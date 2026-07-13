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

export default function ChoreList() {
  const { isAdmin } = useAuth();
  const { data, loading, error } = useQuery(GET_CHORES);
  const { data: roommateData } = useQuery(GET_ROOMMATES);

  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [addChore, { loading: adding }] = useMutation(ADD_CHORE, {
    refetchQueries: [{ query: GET_CHORES }],
  });

  const [deleteChore] = useMutation(DELETE_CHORE, {
    refetchQueries: [{ query: GET_CHORES }],
  });

  const [updateChore] = useMutation(UPDATE_CHORE, {
    refetchQueries: [{ query: GET_CHORES }],
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
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
  };

  const handleToggle = async (chore: Chore) => {
    const nextStatus =
      chore.status === "Completed" ? "NOT_STARTED" : "COMPLETED";
    await updateChore({ variables: { id: chore.id, status: nextStatus } });
  };

  const handleDelete = async (id: string) => {
    await deleteChore({ variables: { id } });
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
            {roommates.map((r: any) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
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

      <div className="space-y-2">
        {!loading && chores.length === 0 && (
          <p className="text-gray-400">No chores yet. {isAdmin ? "Add one above!" : "Ask your admin to add chores."}</p>
        )}
        {chores.map((chore) => {
          const done = chore.status === "Completed";
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
                  {chore.dueDate && (
                    <span className="ml-2 text-xs text-gray-500">
                      due {new Date(chore.dueDate).toLocaleDateString()}
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
                  <button
                    onClick={() => handleDelete(chore.id)}
                    className="text-red-400 hover:text-red-500 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}