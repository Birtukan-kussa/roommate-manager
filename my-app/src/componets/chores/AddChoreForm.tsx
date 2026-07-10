"use client";

import { useState } from "react";

type Props = {
  onAdd: (title: string, assignedTo: string) => void;
};

export default function AddChoreForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !assignedTo.trim()) return;
    onAdd(title, assignedTo);
    setTitle("");
    setAssignedTo("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Chore title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 rounded border border-gray-600 bg-transparent px-3 py-2"
      />
      <input
        type="text"
        placeholder="Assigned to"
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
        className="flex-1 rounded border border-gray-600 bg-transparent px-3 py-2"
      />
      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Add
      </button>
    </form>
  );
}