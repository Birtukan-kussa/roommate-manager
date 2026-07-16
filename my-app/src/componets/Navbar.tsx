"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const { user, logout, loading, isAdmin, token } = useAuth();
  const [inviteLoading, setInviteLoading] = useState(false);

  const handleGenerateInvite = async () => {
    if (!token) return;
    setInviteLoading(true);
    try {
      const res = await fetch("http://localhost:9000/api/auth/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate invite");
      
      await navigator.clipboard.writeText(data.inviteUrl);
      alert(`Invite link generated and copied to clipboard!\n\n${data.inviteUrl}`);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Error generating invite: ${message}`);
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <header className="p-4 bg-gray-800 text-white flex justify-between items-center">
      <Link href="/" className="text-xl font-bold hover:text-gray-300">
        🏠 Roommate Manager
      </Link>
      <nav className="flex items-center gap-4">
        {!loading && user ? (
          <>
            <span className="text-sm text-gray-300">
              Hi, {user.name}!{" "}
              {isAdmin && (
                <span className="ml-1 bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded">
                  ADMIN
                </span>
              )}
            </span>
            {isAdmin && (
              <button
                onClick={handleGenerateInvite}
                disabled={inviteLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white text-xs px-3 py-1 rounded font-semibold"
              >
                {inviteLoading ? "Generating..." : "Invite Roommate"}
              </button>
            )}
            <Link href="/roommates" className="hover:text-gray-300 text-sm">Roommates</Link>
            <Link href="/chores" className="hover:text-gray-300 text-sm">Chores</Link>
            <Link href="/expenses" className="hover:text-gray-300 text-sm">Expenses</Link>
            <Link href="/shopping-list" className="hover:text-gray-300 text-sm">Shopping List</Link>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          !loading && (
            <>
              <Link href="/login" className="hover:text-gray-300 text-sm">Login</Link>
              <Link
                href="/signup"
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
              >
                Sign Up
              </Link>
            </>
          )
        )}
      </nav>
    </header>
  );
}
