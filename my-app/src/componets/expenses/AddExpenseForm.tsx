"use client";

import { useState } from "react";

type Props = {
  onAdd: (description: string, amount: number, paidBy: string) => void;
};

export default function AddExpenseForm({ onAdd }: Props) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || !paidBy.trim() || isNaN(parsedAmount)) return;
    onAdd(description, parsedAmount, paidBy);
    setDescription("");
    setAmount("");
    setPaidBy("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="flex-1 rounded border border-gray-600 bg-transparent px-3 py-2"
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-28 rounded border border-gray-600 bg-transparent px-3 py-2"
      />
      <input
        type="text"
        placeholder="Paid by"
        value={paidBy}
        onChange={(e) => setPaidBy(e.target.value)}
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