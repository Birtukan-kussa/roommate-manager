"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateInvite: () => Promise<void>;
  inviteLoading: boolean;
}

export default function Sidebar({ isOpen, onClose, onGenerateInvite, inviteLoading }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  const links = [
    { href: "/", label: "Home" },
    { href: "/roommates", label: "Roommates" },
    { href: "/chores", label: "Chores" },
    { href: "/expenses", label: "Expenses" },
    { href: "/shopping-list", label: "Shopping list" },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#14181C] text-[#F3F3EF] border-r border-[#2B333C] w-[260px]">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-[#2B333C]">
        <Link
          href="/"
          onClick={onClose}
          className="text-[20px] tracking-tight text-[#F3F3EF] transition hover:text-[#E2993C] font-semibold"
          style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)" }}
        >
          SmartSplit<span className="text-[#E2993C]">.</span>
        </Link>
      </div>

      {/* User Info Card */}
      {user && (
        <div className="px-6 py-5 border-b border-[#2B333C] bg-[#1a1f24]/50">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white shadow-inner"
              style={{ backgroundColor: user.color || "#14181C" }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold text-[#F3F3EF]">{user.name}</p>
              <div className="mt-0.5 flex items-center">
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                  isAdmin ? "bg-[#E2993C]/15 text-[#E2993C]" : "bg-[#8D93A0]/15 text-[#8D93A0]"
                }`}>
                  {isAdmin ? "ADMIN" : "MEMBER"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-all duration-200 ${
                isActive
                  ? "bg-[#C1543C]/10 text-[#C1543C] font-semibold"
                  : "text-[#C7CAD1] hover:bg-white/5 hover:text-[#F3F3EF]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/notifications"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-all duration-200 ${
              pathname === "/notifications"
                ? "bg-[#C1543C]/10 text-[#C1543C] font-semibold"
                : "text-[#C7CAD1] hover:bg-white/5 hover:text-[#F3F3EF]"
            }`}
          >
            Notifications
          </Link>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-[#2B333C] space-y-2 bg-[#1a1f24]/30">
        {isAdmin && (
          <button
            onClick={onGenerateInvite}
            disabled={inviteLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#7FA88A]/30 bg-[#7FA88A]/10 px-4 py-2.5 text-[13px] font-medium text-[#7FA88A] transition hover:bg-[#7FA88A]/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {inviteLoading && (
              <span
                aria-hidden
                className="h-3 w-3 animate-spin rounded-full border-2 border-[#7FA88A]/30 border-t-[#7FA88A]"
              />
            )}
            {inviteLoading ? "Generating invite…" : "Invite roommate"}
          </button>
        )}

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-[#8D93A0] hover:bg-[#C1543C]/10 hover:text-[#C1543C] transition-all duration-200"
        >
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer content */}
          <div className="relative flex h-full w-[260px] animate-in slide-in-from-left duration-300 ease-out z-10">
            {sidebarContent}
            {/* Close button on the outer right */}
            <button
              onClick={onClose}
              className="absolute right-[-45px] top-4 text-white hover:text-[#E2993C] text-[28px] font-semibold transition"
              aria-label="Close menu"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
