"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_EXPENSES } from "@/graphql/expenseQueries";
import { ADD_EXPENSE, DELETE_EXPENSE, UPDATE_EXPENSE } from "@/graphql/expenseMutations";
import { GET_ROOMMATES } from "@/graphql/roommateQueries";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

export type Expense = {
  id: string;
  title: string;
  amount: number;
  paidBy: { id: string; name: string; color: string } | null;
  splitBetween: { id: string; name: string }[];
  date?: string;
};

export default function ExpenseList() {
  const { user, isAdmin } = useAuth();
  const { data, loading, error } = useQuery<{ expenses: Expense[] }>(GET_EXPENSES);
  const { data: roommateData } = useQuery<{
    roommates: { id: string; name: string; color: string }[];
  }>(GET_ROOMMATES);

  // ── Add form state ──
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidById, setPaidById] = useState("");
  const [splitIds, setSplitIds] = useState<string[]>([]);

  // ── Edit state ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editPaidBy, setEditPaidBy] = useState("");
  const [editSplitIds, setEditSplitIds] = useState<string[]>([]);

  const [mutationError, setMutationError] = useState<string | null>(null);

  const [addExpense, { loading: adding }] = useMutation(ADD_EXPENSE, {
    refetchQueries: [{ query: GET_EXPENSES }],
  });
  const [deleteExpense] = useMutation(DELETE_EXPENSE, {
    refetchQueries: [{ query: GET_EXPENSES }],
  });
  const [updateExpense, { loading: saving }] = useMutation(UPDATE_EXPENSE, {
    refetchQueries: [{ query: GET_EXPENSES }],
  });

  const roommates = roommateData?.roommates ?? [];
  const expenses: Expense[] = data?.expenses ?? [];
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!title.trim() || !paidById || isNaN(parsed) || parsed <= 0) return;
    setMutationError(null);
    try {
      await addExpense({
        variables: {
          title,
          amount: parsed,
          paidBy: paidById,
          splitBetween: splitIds.length > 0 ? splitIds : undefined,
        },
      });
      setTitle("");
      setAmount("");
      setPaidById("");
      setSplitIds([]);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Failed to add expense.");
    }
  };

  const toggleSplit = (id: string) => {
    setSplitIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleEditSplit = (id: string) => {
    setEditSplitIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditTitle(expense.title);
    setEditAmount(expense.amount.toString());
    setEditPaidBy(expense.paidBy?.id ?? "");
    setEditSplitIds(expense.splitBetween?.map((r) => r.id) ?? []);
    setMutationError(null);
  };

  const handleSave = async () => {
    if (!editingId) return;
    const parsed = parseFloat(editAmount);
    if (!editTitle.trim() || isNaN(parsed) || parsed <= 0) return;
    setMutationError(null);
    try {
      await updateExpense({
        variables: {
          id: editingId,
          title: editTitle,
          amount: parsed,
          paidBy: editPaidBy || undefined,
          splitBetween: editSplitIds.length > 0 ? editSplitIds : undefined,
        },
      });
      setEditingId(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Failed to save changes.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>

      {/* Add form — available to ALL authenticated users */}
      <form onSubmit={handleAdd} className="space-y-3 mb-6 p-4 border border-gray-700 rounded-lg">
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="What was paid for?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 min-w-[140px] rounded border border-gray-600 bg-transparent px-3 py-2"
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-28 rounded border border-gray-600 bg-transparent px-3 py-2"
              min={0}
              step={0.01}
            />
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <label className="text-sm text-gray-400 w-16">Paid by</label>
            <select
              value={paidById}
              onChange={(e) => setPaidById(e.target.value)}
              className="rounded border border-gray-600 bg-gray-800 px-3 py-2"
            >
              <option value="">Select roommate…</option>
              {roommates.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          {roommates.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Split between (optional)</p>
              <div className="flex flex-wrap gap-2">
                {roommates.map((r) => (
                  <label key={r.id} className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={splitIds.includes(r.id)}
                      onChange={() => toggleSplit(r.id)}
                    />
                    <span style={{ color: r.color ?? "inherit" }}>{r.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={adding}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add Expense"}
          </button>
        </form>

      {loading && <p className="text-gray-400">Loading expenses…</p>}
      {error && <p className="text-red-400">Error: {error.message}</p>}
      {mutationError && <p className="text-red-400 mb-3">⚠ {mutationError}</p>}

      <div className="space-y-2">
        {!loading && expenses.length === 0 && (
          <p className="text-gray-400">
            No expenses yet. Add one above!
          </p>
        )}

        {expenses.map((expense) => {
          const isEditing = editingId === expense.id;

          // ── Edit row ──
          if (isEditing) {
            return (
              <div
                key={expense.id}
                className="rounded border border-blue-600 bg-gray-900 px-4 py-3 space-y-2"
              >
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Description"
                    className="flex-1 min-w-[120px] rounded border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm"
                  />
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-28 rounded border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm"
                    min={0}
                    step={0.01}
                  />
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <label className="text-xs text-gray-400 w-14">Paid by</label>
                  <select
                    value={editPaidBy}
                    onChange={(e) => setEditPaidBy(e.target.value)}
                    className="rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm"
                  >
                    <option value="">Select…</option>
                    {roommates.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                {roommates.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Split between</p>
                    <div className="flex flex-wrap gap-2">
                      {roommates.map((r) => (
                        <label key={r.id} className="flex items-center gap-1.5 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={editSplitIds.includes(r.id)}
                            onChange={() => toggleEditSplit(r.id)}
                          />
                          <span style={{ color: r.color ?? "inherit" }}>{r.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded border border-gray-600 px-3 py-1.5 text-sm text-gray-300 hover:border-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          }

          // ── Read-only row ──
          return (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded border border-gray-700 px-4 py-3"
            >
              <div>
                <p className="font-medium">{expense.title}</p>
                <p className="text-sm text-gray-400">
                  Paid by{" "}
                  <span
                    className="font-semibold"
                    style={{ color: expense.paidBy?.color ?? "inherit" }}
                  >
                    {expense.paidBy?.name ?? "Unknown"}
                  </span>
                  {expense.splitBetween?.length > 0 && (
                    <span className="text-gray-500">
                      {" · split: "}
                      {expense.splitBetween.map((r) => r.name).join(", ")}
                    </span>
                  )}
                  {expense.date && (
                    <span className="ml-2 text-gray-500 text-xs">
                      {new Date(Number(expense.date)).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-green-400">
                  ${expense.amount.toFixed(2)}
                </span>
                {/* Edit + Remove buttons: available to admins OR expense creators (paidBy) */}
                {(isAdmin || (user && expense.paidBy && user._id === expense.paidBy.id)) && (
                  <>
                    <button
                      onClick={() => openEdit(expense)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteExpense({ variables: { id: expense.id } })}
                      className="text-red-400 hover:text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {expenses.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between">
          <span className="font-semibold text-gray-300">Total</span>
          <span className="font-bold text-xl text-green-400">${total.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}