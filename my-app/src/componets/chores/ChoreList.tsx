"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CHORES } from "@/graphql/choreQueries";
import { ADD_CHORE, DELETE_CHORE, UPDATE_CHORE } from "@/graphql/choreMutations";
import { GET_ROOMMATES } from "@/graphql/roommateQueries";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

export type Chore = {
  id: string;
  title: string;
  status: string;
  assignedTo: { id: string; name: string; color: string } | null;
  dueDate?: string;
  recurring?: string;
};

// MongoDB Date fields come back as Unix timestamp strings, e.g. "1753228800000"
function formatDate(raw?: string) {
  if (!raw) return null;
  const d = new Date(Number(raw));
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString();
}

function toInputDate(raw?: string) {
  if (!raw) return "";
  const d = new Date(Number(raw));
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

const today = new Date().toISOString().split("T")[0];

function statusToEnum(status: string) {
  if (status === "Completed") return "COMPLETED";
  if (status === "In Progress") return "IN_PROGRESS";
  return "NOT_STARTED";
}

export default function ChoreList() {
  const { isAdmin } = useAuth();
  const { data, loading, error } = useQuery<{ chores: Chore[] }>(GET_CHORES);
  const { data: roommateData } = useQuery<{
    roommates: { id: string; name: string; color: string }[];
  }>(GET_ROOMMATES);

  // ── Add form state ──
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  // ── Edit state ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editStatus, setEditStatus] = useState("NOT_STARTED");

  const [mutationError, setMutationError] = useState<string | null>(null);

  const [addChore, { loading: adding }] = useMutation(ADD_CHORE, {
    refetchQueries: [{ query: GET_CHORES }],
  });
  const [deleteChore] = useMutation(DELETE_CHORE, {
    refetchQueries: [{ query: GET_CHORES }],
  });
  const [updateChore, { loading: saving }] = useMutation(UPDATE_CHORE, {
    refetchQueries: [{ query: GET_CHORES }],
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setMutationError(null);
    try {
      await addChore({
        variables: {
          title,
          assignedTo: assignedTo || undefined,
          status: "NOT_STARTED",
          dueDate: dueDate || undefined,
        },
      });
      setTitle("");
      setAssignedTo("");
      setDueDate("");
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Failed to add chore.");
    }
  };

  const handleToggle = async (chore: Chore) => {
    const nextStatus = chore.status === "Completed" ? "NOT_STARTED" : "COMPLETED";
    try {
      await updateChore({ variables: { id: chore.id, status: nextStatus } });
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Failed to update chore.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteChore({ variables: { id } });
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Failed to delete chore.");
    }
  };

  const openEdit = (chore: Chore) => {
    setEditingId(chore.id);
    setEditTitle(chore.title);
    setEditAssignedTo(chore.assignedTo?.id ?? "");
    setEditDueDate(toInputDate(chore.dueDate));
    setEditStatus(statusToEnum(chore.status));
    setMutationError(null);
  };

  const handleSave = async () => {
    if (!editingId) return;
    setMutationError(null);
    try {
      await updateChore({
        variables: {
          id: editingId,
          title: editTitle,
          assignedTo: editAssignedTo || undefined,
          dueDate: editDueDate || undefined,
          status: editStatus,
        },
      });
      setEditingId(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Failed to save changes.");
    }
  };

  const chores: Chore[] = data?.chores ?? [];
  const roommates = roommateData?.roommates ?? [];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Chores</h1>

      {isAdmin && (
        <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-6">
          <input
            type="text"
            placeholder="Chore title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 min-w-[140px] rounded border border-gray-600 bg-transparent px-3 py-2"
          />
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="rounded border border-gray-600 bg-gray-800 px-3 py-2"
          >
            <option value="">Assign to…</option>
            {roommates.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            min={today}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded border border-gray-600 bg-gray-800 px-3 py-2 text-gray-300"
          />
          <button
            type="submit"
            disabled={adding}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </form>
      )}

      {loading && <p className="text-gray-400">Loading chores…</p>}
      {error && <p className="text-red-400">Error loading chores: {error.message}</p>}
      {mutationError && <p className="text-red-400 mb-3">⚠ {mutationError}</p>}

      <div className="space-y-2">
        {!loading && chores.length === 0 && (
          <p className="text-gray-400">
            No chores yet.{" "}
            {isAdmin ? "Add one above!" : "Ask your admin to add chores."}
          </p>
        )}

        {chores.map((chore) => {
          const done = chore.status === "Completed";
          const isEditing = editingId === chore.id;

          // ── Edit row ──
          if (isEditing) {
            return (
              <div
                key={chore.id}
                className="rounded border border-blue-600 bg-gray-900 px-4 py-3 space-y-2"
              >
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm"
                  placeholder="Chore title"
                />
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                    className="rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {roommates.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <input
                    type="date"
                    value={editDueDate}
                    min={today}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm text-gray-300"
                  />
                </div>
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
              key={chore.id}
              className="flex items-center justify-between rounded border border-gray-700 px-4 py-2"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => handleToggle(chore)}
                  className="cursor-pointer"
                />
                <div>
                  <span className={done ? "line-through text-gray-500" : ""}>
                    {chore.title}
                  </span>
                  {chore.assignedTo && (
                    <span className="ml-2 text-sm text-gray-400">
                      →{" "}
                      <span
                        className="font-medium"
                        style={{ color: chore.assignedTo.color }}
                      >
                        {chore.assignedTo.name}
                      </span>
                    </span>
                  )}
                  {formatDate(chore.dueDate) && (
                    <span className="ml-2 text-xs text-gray-500">
                      due {formatDate(chore.dueDate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    done
                      ? "bg-green-900 text-green-300"
                      : chore.status === "In Progress"
                      ? "bg-yellow-900 text-yellow-300"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {chore.status ?? "Not Started"}
                </span>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => openEdit(chore)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(chore.id)}
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
    </div>
  );
}