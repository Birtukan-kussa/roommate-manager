"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

const navLinks = [
  { href: "/roommates", label: "Roommates" },
  { href: "/chores", label: "Chores" },
  { href: "/expenses", label: "Expenses" },
  { href: "/shopping-list", label: "Shopping list" },
];

export default function Navbar() {
  const { user, logout, loading, isAdmin, token } = useAuth();
  const [inviteLoading, setInviteLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleGenerateInvite = async () => {
    if (!token) return;
    setInviteLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000";
      const res = await fetch(`${API_URL}/api/auth/invite`, {
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
    <header className="border-b border-[#2B333C] bg-[#14181C] text-[#F3F3EF]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link
          href="/"
          className="text-[19px] tracking-tight text-[#F3F3EF] transition hover:text-[#E2993C]"
          style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)" }}
        >
          SmartSplit<span className="text-[#E2993C]">.</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {!loading && user && (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13.5px] text-[#C7CAD1] transition hover:text-[#F3F3EF]"
                >
                  {link.label}
                </Link>
              ))}

              <span className="h-4 w-px bg-[#2B333C]" aria-hidden />

              <div className="flex items-center gap-2.5">
                <span className="text-[13px] text-[#8D93A0]">
                  {user.name}
                  {isAdmin && (
                    <span className="ml-2 rounded-full bg-[#E2993C]/15 px-2 py-0.5 text-[10.5px] font-medium tracking-wide text-[#E2993C]">
                      ADMIN
                    </span>
                  )}
                </span>

                {isAdmin && (
                  <button
                    onClick={handleGenerateInvite}
                    disabled={inviteLoading}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#7FA88A]/30 bg-[#7FA88A]/10 px-2.5 py-1 text-[12px] font-medium text-[#7FA88A] transition hover:bg-[#7FA88A]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {inviteLoading && (
                      <span
                        aria-hidden
                        className="h-3 w-3 animate-spin rounded-full border-2 border-[#7FA88A]/30 border-t-[#7FA88A]"
                      />
                    )}
                    {inviteLoading ? "Generating…" : "Invite roommate"}
                  </button>
                )}

                <button
                  onClick={logout}
                  className="rounded-md px-2.5 py-1 text-[12.5px] text-[#8D93A0] transition hover:bg-[#C1543C]/10 hover:text-[#C1543C]"
                >
                  Log out
                </button>
              </div>
            </>
          )}

          {!loading && !user && (
            <>
              <Link href="/login" className="text-[13.5px] text-[#C7CAD1] transition hover:text-[#F3F3EF]">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[#E2993C] px-3.5 py-1.5 text-[13px] font-medium text-[#14181C] transition hover:bg-[#f0a648]"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        {!loading && (
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-md text-[#F3F3EF] transition hover:bg-white/5 md:hidden"
          >
            <span className="relative block h-3.5 w-4">
              <span
                className={`absolute left-0 top-0 h-px w-4 bg-current transition ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`}
              />
              <span
                className={`absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current transition ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`absolute bottom-0 left-0 h-px w-4 bg-current transition ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {menuOpen && !loading && (
        <div className="border-t border-[#2B333C] px-5 pb-5 pt-1 md:hidden">
          {user ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13.5px] text-[#8D93A0]">
                  Signed in as <span className="text-[#F3F3EF]">{user.name}</span>
                </span>
                {isAdmin && (
                  <span className="rounded-full bg-[#E2993C]/15 px-2 py-0.5 text-[10.5px] font-medium tracking-wide text-[#E2993C]">
                    ADMIN
                  </span>
                )}
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-t border-[#2B333C] py-3 text-[14px] text-[#C7CAD1] transition hover:text-[#F3F3EF]"
                >
                  {link.label}
                </Link>
              ))}

              {isAdmin && (
                <button
                  onClick={handleGenerateInvite}
                  disabled={inviteLoading}
                  className="mt-3 rounded-md border border-[#7FA88A]/30 bg-[#7FA88A]/10 px-3 py-2 text-[13px] font-medium text-[#7FA88A] disabled:opacity-50"
                >
                  {inviteLoading ? "Generating…" : "Invite roommate"}
                </button>
              )}

              <button
                onClick={logout}
                className="mt-2 rounded-md border-t border-[#2B333C] py-3 text-left text-[14px] text-[#C1543C]"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="py-2 text-[14px] text-[#C7CAD1]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="rounded-md bg-[#E2993C] px-3.5 py-2 text-center text-[14px] font-medium text-[#14181C]"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}