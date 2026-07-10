"use client";

import type { Expense } from "./ExpenseList";

type Props = {
  expense: Expense;
  onDelete: (id: string) => void;
};

export default function ExpenseItem({ expense, onDelete }: Props) {
  return (
    <div className="flex items-center justify-between rounded border border-gray-700 px-4 py-2">
      <div>
        <span>{expense.description}</span>
        <span className="ml-2 text-sm text-gray-400">
          ({expense.paidBy})
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-medium">{expense.amount.toFixed(2)}</span>
        <button
          onClick={() => onDelete(expense.id)}
          className="text-red-400 hover:text-red-500 text-sm"
        >
          Remove
        </button>
      </div>
    </div>
  );
}