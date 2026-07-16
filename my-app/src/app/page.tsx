"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ROOMMATES } from "@/graphql/roommateQueries";
import { GET_CHORES } from "@/graphql/choreQueries";
import { GET_EXPENSES } from "@/graphql/expenseQueries";
import { GET_SHOPPING_ITEMS } from "@/graphql/shoppingQueries";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";

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

const fontDisplay = "var(--font-display, 'Fraunces', Georgia, serif)";
const fontMono = "var(--font-mono, 'IBM Plex Mono', ui-monospace, monospace)";

export default function HomeDashboard() {
  const { user, loading: authLoading } = useAuth();

  const { data: roommatesData, loading: roommatesLoading } = useQuery<{ roommates: Roommate[] }>(GET_ROOMMATES);
  const { data: choresData, loading: choresLoading } = useQuery<{ chores: Chore[] }>(GET_CHORES);
  const { data: expensesData, loading: expensesLoading } = useQuery<{ expenses: Expense[] }>(GET_EXPENSES);
  const { data: shoppingData, loading: shoppingLoading } = useQuery<{ shoppingItems: ShoppingItem[] }>(GET_SHOPPING_ITEMS);

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F3F3EF]">
        <div className="flex items-center gap-2.5 text-[14px] text-[#8B8C82]">
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#DEDBD1] border-t-[#14181C]"
          />
          Loading your profile…
        </div>
      </div>
    );
  }

  // ── LOGGED OUT VIEW ──
  if (!user) {
    return (
      <div
        className="min-h-screen bg-[#F3F3EF]"
        style={{ fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)" }}
      >
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-24 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8B8C82]">
            For roommates who share more than rent
          </p>
          <h1
            className="mt-3 text-[42px] leading-[1.1] text-[#14181C]"
            style={{ fontFamily: fontDisplay }}
          >
            Chores and expenses, in one shared ledger.
          </h1>
          <p className="mx-auto mt-5 max-w-[42ch] text-[15.5px] leading-relaxed text-[#5b5c53]">
            Assign chores that rotate on their own. Log what you paid for. See exactly who owes
            who, without a spreadsheet or a group-chat argument.
          </p>
          <div className="mt-9 flex justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-md bg-[#14181C] px-5 py-2.5 text-[14px] font-medium text-[#F3F3EF] transition hover:bg-[#232a32]"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-[#DEDBD1] bg-white px-5 py-2.5 text-[14px] font-medium text-[#14181C] transition hover:border-[#14181C]"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Preview receipt, echoes the auth-page ledger */}
        <div className="mx-auto max-w-sm px-6 pb-24">
          <div className="rounded-lg border border-[#DEDBD1] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-[#8B8C82]">
              <span>This week</span>
              <span className="h-px flex-1 bg-[#DEDBD1]" />
            </div>
            <ul className="mt-4 space-y-0">
              {[
                { label: "Rent", detail: "split 3 ways", amount: "$840", settled: false },
                { label: "Groceries", detail: "Priya paid", amount: "$62", settled: true },
                { label: "Take out trash", detail: "You · Thu", amount: "", settled: false },
              ].map((item, i, arr) => (
                <li
                  key={item.label}
                  className={`flex items-center justify-between gap-4 py-3 ${i !== arr.length - 1 ? "border-b border-dashed border-[#DEDBD1]" : ""
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className={`h-[7px] w-[7px] rounded-full border ${item.settled ? "border-[#7FA88A] bg-[#7FA88A]" : "border-[#A6A79C] bg-transparent"
                        }`}
                    />
                    <div className="text-left">
                      <p className={`text-[13.5px] text-[#14181C] ${item.settled ? "text-[#A6A79C] line-through" : ""}`}>
                        {item.label}
                      </p>
                      <p className="text-[11.5px] text-[#8B8C82]">{item.detail}</p>
                    </div>
                  </div>
                  {item.amount && (
                    <span className="text-[13px] text-[#14181C]" style={{ fontFamily: fontMono }}>
                      {item.amount}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
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
    <div
      className="min-h-screen bg-[#F3F3EF]"
      style={{ fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)" }}
    >
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-[#DEDBD1] bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <h1
              className="text-[26px] leading-tight text-[#14181C]"
              style={{ fontFamily: fontDisplay }}
            >
              Welcome back, {user.name}
            </h1>
            <p className="mt-1 text-[13.5px] text-[#8B8C82]">
              Here&apos;s the status of your shared house.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#DEDBD1] px-3 py-1.5 text-[11.5px] font-medium text-[#5b5c53]">
            <span>Role</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10.5px] tracking-wide ${user.role === "admin" ? "bg-[#E2993C]/15 text-[#c9821f]" : "bg-[#14181C]/[0.06] text-[#14181C]"
                }`}
            >
              {user.role.toUpperCase()}
            </span>
          </div>
        </div>

        {loadingAll && (
          <div className="py-10 text-center">
            <p className="animate-pulse text-[13.5px] text-[#8B8C82]">Syncing home status…</p>
          </div>
        )}

        {!loadingAll && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* LEFT COLUMN: CHORES & SHOPPING */}
            <div className="space-y-6 md:col-span-2">

              {/* YOUR CHORES CARD */}
              <div className="rounded-lg border border-[#DEDBD1] bg-white p-6 shadow-sm">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-[15px] font-medium text-[#14181C]">Your pending chores</h2>
                  <Link href="/chores" className="text-[12px] font-medium text-[#8B8C82] hover:text-[#14181C]">
                    View all ({chores.length})
                  </Link>
                </div>

                {myChores.length === 0 ? (
                  <p className="py-4 text-[13.5px] text-[#8B8C82]">
                    All caught up — no chores assigned to you right now.
                  </p>
                ) : (
                  <div className="mt-3">
                    {myChores.map((c, i) => {
                      const isOverdue = c.dueDate ? Number(c.dueDate) < Date.now() : false;
                      return (
                        <div
                          key={c.id}
                          className={`flex items-center justify-between gap-4 py-3 ${i !== myChores.length - 1 ? "border-b border-dashed border-[#DEDBD1]" : ""
                            }`}
                        >
                          <div>
                            <p className="text-[13.5px] text-[#14181C]">{c.title}</p>
                            {c.dueDate && (
                              <p className={`mt-0.5 text-[11.5px] ${isOverdue ? "text-[#C1543C]" : "text-[#8B8C82]"}`}>
                                {isOverdue ? "Overdue · " : "Due "}
                                {new Date(Number(c.dueDate)).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 rounded-full bg-[#E2993C]/15 px-2.5 py-1 text-[11px] font-medium text-[#c9821f]">
                            {c.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SHOPPING LIST CARD */}
              <div className="rounded-lg border border-[#DEDBD1] bg-white p-6 shadow-sm">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-[15px] font-medium text-[#14181C]">Shopping list highlights</h2>
                  <Link href="/shopping-list" className="text-[12px] font-medium text-[#8B8C82] hover:text-[#14181C]">
                    Go to list
                  </Link>
                </div>

                {neededItems.length === 0 ? (
                  <p className="py-4 text-[13.5px] text-[#8B8C82]">
                    Pantry&apos;s fully stocked — nothing needed right now.
                  </p>
                ) : (
                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {neededItems.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 rounded-md border border-[#DEDBD1] px-3.5 py-2.5"
                      >
                        <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#E2993C]" />
                        <span className="truncate text-[13.5px] text-[#14181C]">{item.name}</span>
                      </div>
                    ))}
                    {neededItems.length > 6 && (
                      <div className="flex items-center justify-center rounded-md border border-dashed border-[#DEDBD1] py-2.5">
                        <span className="text-[12px] font-medium text-[#8B8C82]">
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
              <div className="rounded-lg border border-[#DEDBD1] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-[15px] font-medium text-[#14181C]">Balance sheet</h2>

                <div className="mb-5 flex flex-col items-center rounded-md bg-[#F7F7F4] py-5 text-center">
                  <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8B8C82]">
                    Net balance
                  </span>
                  <span
                    className={`mt-1 text-[30px] ${netBalance >= 0 ? "text-[#4d7a63]" : "text-[#C1543C]"}`}
                    style={{ fontFamily: fontMono }}
                  >
                    {netBalance >= 0 ? "+" : "-"}${Math.abs(netBalance).toFixed(2)}
                  </span>
                </div>

                <div className="mb-1 space-y-2.5">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#8B8C82]">Total you&apos;re owed</span>
                    <span className="font-medium text-[#4d7a63]" style={{ fontFamily: fontMono }}>
                      ${totalOwedToMe.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#8B8C82]">Total you owe</span>
                    <span className="font-medium text-[#C1543C]" style={{ fontFamily: fontMono }}>
                      ${totalIOwe.toFixed(2)}
                    </span>
                  </div>
                </div>

                {debtDetails.length > 0 && (
                  <div className="mt-4 max-h-48 space-y-0 overflow-y-auto border-t border-dashed border-[#DEDBD1] pt-1">
                    {debtDetails.map((det, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between py-2.5 text-[12.5px] ${idx !== debtDetails.length - 1 ? "border-b border-dashed border-[#DEDBD1]" : ""
                          }`}
                      >
                        <span className="text-[#14181C]">{det.roommateName}</span>
                        <span
                          className={det.isOwed ? "font-medium text-[#4d7a63]" : "font-medium text-[#C1543C]"}
                          style={{ fontFamily: fontMono }}
                        >
                          {det.isOwed ? "owes you " : "you owe "}${det.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href="/expenses"
                  className="mt-5 block rounded-md border border-[#DEDBD1] py-2.5 text-center text-[12.5px] font-medium text-[#14181C] transition hover:border-[#14181C]"
                >
                  Manage expenses
                </Link>
              </div>

              {/* ROOMMATES DIRECTORY CARD */}
              <div className="rounded-lg border border-[#DEDBD1] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-[15px] font-medium text-[#14181C]">House directory</h2>

                {roommates.length === 0 ? (
                  <p className="py-4 text-[13.5px] text-[#8B8C82]">No roommates added yet.</p>
                ) : (
                  <div className="max-h-60 space-y-3 overflow-y-auto">
                    {roommates.map((r) => (
                      <div key={r.id} className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                          style={{ backgroundColor: r.color || "#14181C" }}
                        >
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] text-[#14181C]">{r.name}</p>
                          <p className="truncate text-[11.5px] text-[#8B8C82]">{r.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href="/roommates"
                  className="mt-5 block rounded-md border border-[#DEDBD1] py-2.5 text-center text-[12.5px] font-medium text-[#14181C] transition hover:border-[#14181C]"
                >
                  Roommates list
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}