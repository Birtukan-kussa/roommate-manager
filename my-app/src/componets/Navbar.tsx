"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const { user, logout, loading, isAdmin } = useAuth();

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
            <Link href="/roommates" className="hover:text-gray-300 text-sm">Roommates</Link>
            <Link href="/chores" className="hover:text-gray-300 text-sm">Chores</Link>
            <Link href="/expenses" className="hover:text-gray-300 text-sm">Expenses</Link>
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
