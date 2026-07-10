"use client";

import { useState } from "react";
import AddExpenseForm from "../expenses/AddExpenseForm";
import ExpenseItem from "../expenses/ExpenseItem";

export type Expense = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
};

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  function addExpense(description: string, amount: number, paidBy: string) {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description,
      amount,
      paidBy,
    };
    setExpenses((prev) => [...prev, newExpense]);
  }

  function deleteExpense(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>
      <AddExpenseForm onAdd={addExpense} />
      <div className="mt-6 space-y-2">
        {expenses.length === 0 && (
          <p className="text-gray-400">No expenses added yet.</p>
        )}
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            onDelete={deleteExpense}
          />
        ))}
      </div>
      {expenses.length > 0 && (
        <p className="mt-4 font-semibold">Total: {total.toFixed(2)}</p>
      )}
    </div>
  );
}