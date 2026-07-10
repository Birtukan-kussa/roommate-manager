"use client";

import { useState } from "react";

type Props = {
  onAdd: (name: string) => void;
};

export default function AddItemForm({ onAdd }: Props) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name);
    setName("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
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