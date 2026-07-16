"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ROOMMATES } from "@/graphql/roommateQueries";
import { GET_CHORES } from "@/graphql/choreQueries";
import { GET_EXPENSES } from "@/graphql/expenseQueries";
import { GET_SHOPPING_ITEMS } from "@/graphql/shoppingQueries";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { useState } from "react";

type Roommate = {
  id: string;
  name: string;
  email: string;
  color: string;
};

type Chore = {
  id: string;
  title: string;
  status: string;
  assignedTo: { id: string; name: string } | null;
  dueDate?: string;
};

type Expense = {
  id: string;
  title: string;
  amount: number;
  paidBy: { id: string; name: string } | null;
  splitBetween: { id: string; name: string }[];
};

type ShoppingItem = {
  id: string;
  name: string;
  purchased: boolean;
};

export default function HomeDashboard() {
  const { user, loading: authLoading } = useAuth();

  const { data: roommatesData, loading: roommatesLoading } = useQuery<{ roommates: Roommate[] }>(GET_ROOMMATES);
  const { data: choresData, loading: choresLoading } = useQuery<{ chores: Chore[] }>(GET_CHORES);
  const { data: expensesData, loading: expensesLoading } = useQuery<{ expenses: Expense[] }>(GET_EXPENSES);
  const { data: shoppingData, loading: shoppingLoading } = useQuery<{ shoppingItems: ShoppingItem[] }>(GET_SHOPPING_ITEMS);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-400">Loading your profile…</p>
      </div>
    );
  }

  // ── LOGGED OUT VIEW ──
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Roommate Manager
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
          The premium hub to manage chores, schedules, shared expenses, and shopping lists with your housemates.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded border border-gray-700 bg-gray-900 px-6 py-3 font-semibold text-gray-300 hover:bg-gray-800 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  // ── DATA PREPARATION ──
  const roommates = roommatesData?.roommates ?? [];
  const chores = choresData?.chores ?? [];
  const expenses = expensesData?.expenses ?? [];
  const shoppingItems = shoppingData?.shoppingItems ?? [];

  // Filter personal pending chores
  const myChores = chores.filter(
    (c) => c.assignedTo?.id === user._id && c.status !== "Completed"
  );

  // Filter remaining shopping items
  const neededItems = shoppingItems.filter((item) => !item.purchased);

  // ── EXPENSE BALANCE CALCULATIONS ──
  // Calculate how much user is owed (lent) vs how much user owes (borrowed)
  let totalOwedToMe = 0;
  let totalIOwe = 0;

  const debtDetails: { roommateName: string; amount: number; isOwed: boolean }[] = [];

  // Intermediate balance ledger per roommate
  // positive = they owe current user, negative = current user owes them
  const ledger: Record<string, { name: string; balance: number }> = {};
  roommates.forEach((r) => {
    if (r.id !== user._id) {
      ledger[r.id] = { name: r.name, balance: 0 };
    }
  });

  expenses.forEach((exp) => {
    const amount = exp.amount;
    const payerId = exp.paidBy?.id;
    const splitCount = exp.splitBetween?.length ?? 0;
    if (splitCount === 0 || !payerId) return;

    const share = amount / splitCount;
    const userInSplit = exp.splitBetween.some((r) => r.id === user._id);

    if (payerId === user._id) {
      // Current user paid. Everyone else in the split owes current user their share.
      exp.splitBetween.forEach((r) => {
        if (r.id !== user._id && ledger[r.id]) {
          ledger[r.id].balance += share;
        }
      });
    } else if (userInSplit) {
      // Someone else paid, and current user is in the split. Current user owes the payer.
      if (ledger[payerId]) {
        ledger[payerId].balance -= share;
      }
    }
  });

  // Convert ledger entries to totals
  Object.keys(ledger).forEach((id) => {
    const { name, balance } = ledger[id];
    if (balance > 0.01) {
      totalOwedToMe += balance;
      debtDetails.push({ roommateName: name, amount: balance, isOwed: true });
    } else if (balance < -0.01) {
      totalIOwe += Math.abs(balance);
      debtDetails.push({ roommateName: name, amount: Math.abs(balance), isOwed: false });
    }
  });

  const netBalance = totalOwedToMe - totalIOwe;

  const loadingAll = roommatesLoading || choresLoading || expensesLoading || shoppingLoading;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Here is a status report of your shared house.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-300">
          <span>Role:</span>
          <span className={`px-2 py-0.5 rounded-full ${user.role === "admin" ? "bg-yellow-900 text-yellow-300" : "bg-blue-900 text-blue-300"}`}>
            {user.role.toUpperCase()}
          </span>
        </div>
      </div>

      {loadingAll && (
        <div className="py-10 text-center">
          <p className="text-gray-400 animate-pulse">Syncing home status…</p>
        </div>
      )}

      {!loadingAll && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT COLUMN: CHORES & SHOPPING */}
          <div className="md:col-span-2 space-y-6">
            
            {/* YOUR CHORES CARD */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  🧹 Your Pending Chores
                </h2>
                <Link href="/chores" className="text-xs text-blue-400 hover:underline">
                  View All ({chores.length})
                </Link>
              </div>
              
              {myChores.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">All caught up! No pending chores assigned to you.</p>
              ) : (
                <div className="space-y-3">
                  {myChores.map((c) => (
                    <div key={c.id} className="flex justify-between items-center bg-gray-950 border border-gray-850 rounded-lg px-4 py-3">
                      <div>
                        <p className="font-semibold text-sm text-gray-200">{c.title}</p>
                        {c.dueDate && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Due: {new Date(Number(c.dueDate)).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span className="text-xs bg-yellow-900/60 text-yellow-300 border border-yellow-800 px-2 py-0.5 rounded-full font-medium">
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SHOPPING LIST CARD */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  🛒 Shopping List Highlights
                </h2>
                <Link href="/shopping-list" className="text-xs text-blue-400 hover:underline">
                  Go to List
                </Link>
              </div>
              
              {neededItems.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">Pantries are fully stocked! No items needed.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {neededItems.slice(0, 6).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 bg-gray-950 border border-gray-850 rounded-lg px-4 py-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span className="text-sm text-gray-200 font-medium truncate">{item.name}</span>
                    </div>
                  ))}
                  {neededItems.length > 6 && (
                    <div className="flex items-center justify-center bg-gray-950 border border-dashed border-gray-800 rounded-lg py-2.5">
                      <span className="text-xs text-gray-400 font-semibold">
                        +{neededItems.length - 6} more items
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: HOUSEMATES & BALANCE SHEET */}
          <div className="space-y-6">
            
            {/* HOUSE BALANCE SHEET CARD */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                💸 Balance Sheet
              </h2>
              
              <div className="flex flex-col items-center bg-gray-950 border border-gray-850 rounded-lg py-5 mb-4 text-center">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Net Balance
                </span>
                <span className={`text-3xl font-black mt-1 ${netBalance >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {netBalance >= 0 ? "+" : "-"}${Math.abs(netBalance).toFixed(2)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total you are owed:</span>
                  <span className="font-semibold text-green-400">${totalOwedToMe.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total you owe:</span>
                  <span className="font-semibold text-red-400">${totalIOwe.toFixed(2)}</span>
                </div>
              </div>

              {debtDetails.length > 0 && (
                <div className="border-t border-gray-800 pt-3 space-y-2 max-h-48 overflow-y-auto">
                  {debtDetails.map((det, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-gray-300 font-medium">{det.roommateName}</span>
                      <span className={det.isOwed ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                        {det.isOwed ? "owes you" : "you owe"} ${det.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              <Link
                href="/expenses"
                className="block text-center rounded bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-200 py-2.5 hover:bg-gray-750 transition mt-4"
              >
                Manage Expenses
              </Link>
            </div>

            {/* ROOMMATES DIRECTORY CARD */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                👥 House Directory
              </h2>
              
              {roommates.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">No roommates added yet.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {roommates.map((r) => (
                    <div key={r.id} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner"
                        style={{ backgroundColor: r.color || "#4F46E5" }}
                      >
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-200">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Link
                href="/roommates"
                className="block text-center rounded bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-200 py-2.5 hover:bg-gray-750 transition mt-4"
              >
                Roommates List
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}