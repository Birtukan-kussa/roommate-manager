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
    <form onSubmit={handleSubmit} className="flex gap-2.5">
      <input
        type="text"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded-md border border-[#DEDBD1] bg-white px-3.5 py-2.5 text-[14px] text-[#14181C] placeholder:text-[#A6A79C] outline-none transition focus:border-[#E2993C] focus:ring-2 focus:ring-[#E2993C]/25"
      />
      <button
        type="submit"
        className="shrink-0 rounded-md bg-[#14181C] px-4 py-2.5 text-[14px] font-medium text-[#F3F3EF] transition hover:bg-[#232a32]"
      >
        Add
      </button>
    </form>
  );
}