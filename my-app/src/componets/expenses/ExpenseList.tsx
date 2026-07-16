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

const fontDisplay = "var(--font-display, 'Fraunces', Georgia, serif)";
const fontMono = "var(--font-mono, 'IBM Plex Mono', ui-monospace, monospace)";

const inputClass =
  "rounded-md border border-[#DEDBD1] bg-white px-3.5 py-2.5 text-[14px] text-[#14181C] placeholder:text-[#A6A79C] outline-none transition focus:border-[#E2993C] focus:ring-2 focus:ring-[#E2993C]/25";

function SplitChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[12.5px] font-medium transition ${selected
          ? "border-[#E2993C] bg-[#E2993C]/15 text-[#c9821f]"
          : "border-[#DEDBD1] bg-white text-[#5b5c53] hover:border-[#14181C]"
        }`}
    >
      {label}
    </button>
  );
}

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
    <div
      className="min-h-screen bg-[#F3F3EF]"
      style={{ fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)" }}
    >
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8B8C82]">
          Household
        </p>
        <h1
          className="mt-2 text-[30px] leading-tight text-[#14181C]"
          style={{ fontFamily: fontDisplay }}
        >
          Expenses
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[#5b5c53]">
          Log what you paid for and who it&apos;s split with.
        </p>

        {/* Add form — available to ALL authenticated users */}
        <form
          onSubmit={handleAdd}
          className="mt-8 space-y-3.5 rounded-lg border border-[#DEDBD1] bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap gap-2.5">
            <input
              type="text"
              placeholder="What was paid for?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`min-w-[140px] flex-1 ${inputClass}`}
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-28 ${inputClass}`}
              min={0}
              step={0.01}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <label className="w-16 text-[13px] text-[#5b5c53]">Paid by</label>
            <select
              value={paidById}
              onChange={(e) => setPaidById(e.target.value)}
              className={inputClass}
            >
              <option value="">Select roommate…</option>
              {roommates.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {roommates.length > 0 && (
            <div>
              <p className="mb-1.5 text-[13px] text-[#5b5c53]">Split between (optional)</p>
              <div className="flex flex-wrap gap-2">
                {roommates.map((r) => (
                  <SplitChip
                    key={r.id}
                    label={r.name}
                    selected={splitIds.includes(r.id)}
                    onClick={() => toggleSplit(r.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center gap-2 rounded-md bg-[#14181C] px-4 py-2.5 text-[14px] font-medium text-[#F3F3EF] transition hover:bg-[#232a32] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adding && (
              <span
                aria-hidden
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#F3F3EF]/30 border-t-[#F3F3EF]"
              />
            )}
            {adding ? "Adding…" : "Add expense"}
          </button>
        </form>

        {loading && (
          <div className="mt-6 flex items-center gap-2.5 text-[13.5px] text-[#8B8C82]">
            <span
              aria-hidden
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#DEDBD1] border-t-[#14181C]"
            />
            Loading expenses…
          </div>
        )}
        {error && (
          <p className="mt-6 rounded-md border border-[#C1543C]/25 bg-[#C1543C]/[0.06] px-3.5 py-2.5 text-[13.5px] text-[#C1543C]">
            Error: {error.message}
          </p>
        )}
        {mutationError && (
          <p className="mt-6 rounded-md border border-[#C1543C]/25 bg-[#C1543C]/[0.06] px-3.5 py-2.5 text-[13.5px] text-[#C1543C]">
            {mutationError}
          </p>
        )}

        <div className="mt-8">
          {!loading && expenses.length === 0 && (
            <p className="rounded-lg border border-dashed border-[#DEDBD1] px-5 py-8 text-center text-[13.5px] text-[#8B8C82]">
              No expenses yet — add one above.
            </p>
          )}

          {expenses.length > 0 && (
            <div className="rounded-lg border border-[#DEDBD1] bg-white shadow-sm">
              {expenses.map((expense, i) => {
                const isEditing = editingId === expense.id;
                const rowBorder =
                  i !== expenses.length - 1 ? "border-b border-dashed border-[#DEDBD1]" : "";

                // ── Edit row ──
                if (isEditing) {
                  return (
                    <div
                      key={expense.id}
                      className={`space-y-2.5 border-l-2 border-l-[#E2993C] bg-[#FBF6ED] px-5 py-4 ${rowBorder}`}
                    >
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Description"
                          className={`min-w-[120px] flex-1 ${inputClass} py-1.5 text-[13px]`}
                        />
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          placeholder="Amount"
                          className={`w-28 ${inputClass} py-1.5 text-[13px]`}
                          min={0}
                          step={0.01}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="w-14 text-[12px] text-[#8B8C82]">Paid by</label>
                        <select
                          value={editPaidBy}
                          onChange={(e) => setEditPaidBy(e.target.value)}
                          className={`${inputClass} py-1.5 text-[13px]`}
                        >
                          <option value="">Select…</option>
                          {roommates.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {roommates.length > 0 && (
                        <div>
                          <p className="mb-1 text-[12px] text-[#8B8C82]">Split between</p>
                          <div className="flex flex-wrap gap-2">
                            {roommates.map((r) => (
                              <SplitChip
                                key={r.id}
                                label={r.name}
                                selected={editSplitIds.includes(r.id)}
                                onClick={() => toggleEditSplit(r.id)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="rounded-md bg-[#14181C] px-3.5 py-1.5 text-[12.5px] font-medium text-[#F3F3EF] transition hover:bg-[#232a32] disabled:opacity-60"
                        >
                          {saving ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-md border border-[#DEDBD1] px-3.5 py-1.5 text-[12.5px] font-medium text-[#5b5c53] transition hover:border-[#14181C]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                // ── Read-only row ──
                const canManage =
                  isAdmin || (user && expense.paidBy && user._id === expense.paidBy.id);

                return (
                  <div
                    key={expense.id}
                    className={`flex items-center justify-between gap-4 px-5 py-4 ${rowBorder}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[14px] text-[#14181C]">{expense.title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12.5px] text-[#8B8C82]">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            aria-hidden
                            className="h-[6px] w-[6px] rounded-full"
                            style={{ backgroundColor: expense.paidBy?.color ?? "#A6A79C" }}
                          />
                          Paid by <span className="text-[#14181C]">{expense.paidBy?.name ?? "Unknown"}</span>
                        </span>
                        {expense.splitBetween?.length > 0 && (
                          <span>· split: {expense.splitBetween.map((r) => r.name).join(", ")}</span>
                        )}
                        {expense.date && (
                          <span className="text-[#A6A79C]">
                            {new Date(Number(expense.date)).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-[15px] text-[#4d7a63]" style={{ fontFamily: fontMono }}>
                        ${expense.amount.toFixed(2)}
                      </span>
                      {canManage && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(expense)}
                            className="rounded-md px-2 py-1 text-[12.5px] font-medium text-[#8B8C82] transition hover:text-[#14181C]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteExpense({ variables: { id: expense.id } })}
                            className="rounded-md px-2 py-1 text-[12.5px] font-medium text-[#8B8C82] transition hover:bg-[#C1543C]/10 hover:text-[#C1543C]"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {expenses.length > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-dashed border-[#DEDBD1] pt-4">
            <span className="text-[13.5px] font-medium text-[#5b5c53]">Total</span>
            <span className="text-[20px] text-[#4d7a63]" style={{ fontFamily: fontMono }}>
              ${total.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}