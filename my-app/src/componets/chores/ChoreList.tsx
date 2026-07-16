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
  createdBy?: { id: string; name: string; color: string } | null;
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

const fontDisplay = "var(--font-display, 'Fraunces', Georgia, serif)";

const inputClass =
  "rounded-md border border-[#DEDBD1] bg-white px-3.5 py-2.5 text-[14px] text-[#14181C] placeholder:text-[#A6A79C] outline-none transition focus:border-[#E2993C] focus:ring-2 focus:ring-[#E2993C]/25";

const statusPillClass = (statusEnum: string) =>
  `cursor-pointer appearance-none rounded-full border-0 bg-none px-2.5 py-1 pr-6 text-[11px] font-medium bg-[length:10px] bg-[right_0.5rem_center] bg-no-repeat ${statusEnum === "COMPLETED"
    ? "bg-[#7FA88A]/15 text-[#4d7a63]"
    : statusEnum === "IN_PROGRESS"
      ? "bg-[#E2993C]/15 text-[#c9821f]"
      : "bg-[#14181C]/[0.06] text-[#5b5c53]"
  }`;

export default function ChoreList() {
  const { user, isAdmin } = useAuth();
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
          Chores
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[#5b5c53]">
          Assign a chore once, then keep track of who&apos;s up.
        </p>

        {/* Add form — available to ALL authenticated users */}
        <form
          onSubmit={handleAdd}
          className="mt-8 flex flex-wrap gap-2.5 rounded-lg border border-[#DEDBD1] bg-white p-5 shadow-sm"
        >
          <input
            type="text"
            placeholder="Chore title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`min-w-[140px] flex-1 ${inputClass}`}
          />
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className={inputClass}
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
            className={inputClass}
          />
          <button
            type="submit"
            disabled={adding}
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[#14181C] px-4 py-2.5 text-[14px] font-medium text-[#F3F3EF] transition hover:bg-[#232a32] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adding && (
              <span
                aria-hidden
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#F3F3EF]/30 border-t-[#F3F3EF]"
              />
            )}
            {adding ? "Adding…" : "Add"}
          </button>
        </form>

        {loading && (
          <div className="mt-6 flex items-center gap-2.5 text-[13.5px] text-[#8B8C82]">
            <span
              aria-hidden
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#DEDBD1] border-t-[#14181C]"
            />
            Loading chores…
          </div>
        )}
        {error && (
          <p className="mt-6 rounded-md border border-[#C1543C]/25 bg-[#C1543C]/[0.06] px-3.5 py-2.5 text-[13.5px] text-[#C1543C]">
            Error loading chores: {error.message}
          </p>
        )}
        {mutationError && (
          <p className="mt-6 rounded-md border border-[#C1543C]/25 bg-[#C1543C]/[0.06] px-3.5 py-2.5 text-[13.5px] text-[#C1543C]">
            {mutationError}
          </p>
        )}

        <div className="mt-8">
          {!loading && chores.length === 0 && (
            <p className="rounded-lg border border-dashed border-[#DEDBD1] px-5 py-8 text-center text-[13.5px] text-[#8B8C82]">
              No chores yet — add one above.
            </p>
          )}

          {chores.length > 0 && (
            <div className="rounded-lg border border-[#DEDBD1] bg-white shadow-sm">
              {chores.map((chore, i) => {
                const done = chore.status === "Completed";
                const isEditing = editingId === chore.id;
                const rowBorder =
                  i !== chores.length - 1 ? "border-b border-dashed border-[#DEDBD1]" : "";
                const isOverdue =
                  !done && chore.dueDate ? Number(chore.dueDate) < Date.now() : false;

                // ── Edit row ──
                if (isEditing) {
                  return (
                    <div
                      key={chore.id}
                      className={`space-y-2.5 border-l-2 border-l-[#E2993C] bg-[#FBF6ED] px-5 py-4 ${rowBorder}`}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className={`w-full ${inputClass} py-1.5 text-[13px]`}
                        placeholder="Chore title"
                      />
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={editAssignedTo}
                          onChange={(e) => setEditAssignedTo(e.target.value)}
                          className={`${inputClass} py-1.5 text-[13px]`}
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
                          className={`${inputClass} py-1.5 text-[13px]`}
                        >
                          <option value="NOT_STARTED">Not started</option>
                          <option value="IN_PROGRESS">In progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                        <input
                          type="date"
                          value={editDueDate}
                          min={today}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className={`${inputClass} py-1.5 text-[13px]`}
                        />
                      </div>
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
                  isAdmin || (user && chore.createdBy && user._id === chore.createdBy.id);

                return (
                  <div
                    key={chore.id}
                    className={`flex items-center justify-between gap-4 px-5 py-3.5 ${rowBorder}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <label className="relative flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center">
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => handleToggle(chore)}
                          className="peer sr-only"
                        />
                        <span
                          className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#E2993C]/40 ${done ? "border-[#7FA88A] bg-[#7FA88A]" : "border-[#DEDBD1] bg-white"
                            }`}
                        >
                          {done && (
                            <svg viewBox="0 0 12 12" className="h-[9px] w-[9px]" aria-hidden>
                              <path
                                d="M2 6.2 4.8 9 10 3"
                                fill="none"
                                stroke="white"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                      </label>

                      <div className="min-w-0">
                        <span className={`text-[14px] ${done ? "text-[#A6A79C] line-through" : "text-[#14181C]"}`}>
                          {chore.title}
                        </span>
                        {chore.assignedTo && (
                          <span className="ml-2 inline-flex items-center gap-1.5 text-[12px] text-[#8B8C82]">
                            <span
                              aria-hidden
                              className="h-[6px] w-[6px] rounded-full"
                              style={{ backgroundColor: chore.assignedTo.color }}
                            />
                            {chore.assignedTo.name}
                          </span>
                        )}
                        {formatDate(chore.dueDate) && (
                          <span className={`ml-2 text-[11.5px] ${isOverdue ? "text-[#C1543C]" : "text-[#A6A79C]"}`}>
                            {isOverdue ? "overdue " : "due "}
                            {formatDate(chore.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {/* Status selector — available to ALL authenticated users */}
                      <select
                        value={statusToEnum(chore.status)}
                        onChange={(e) =>
                          updateChore({
                            variables: { id: chore.id, status: e.target.value },
                          }).catch((err) =>
                            setMutationError(
                              err instanceof Error ? err.message : "Failed to update status."
                            )
                          )
                        }
                        className={statusPillClass(statusToEnum(chore.status))}
                      >
                        <option value="NOT_STARTED">Not started</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>

                      {/* Edit + Remove buttons: available to admins OR chore creators */}
                      {canManage && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(chore)}
                            className="rounded-md px-2 py-1 text-[12.5px] font-medium text-[#8B8C82] transition hover:text-[#14181C]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(chore.id)}
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
      </div>
    </div>
  );
}