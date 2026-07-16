"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F3EF]">
        <div className="flex items-center gap-2.5 text-[14px] text-[#8B8C82]">
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-[#DEDBD1] border-t-[#14181C]"
          />
          Syncing profile…
        </div>
      </div>
    );
  }

  // Authenticated State (Left Sidebar, Right Content area)
  if (user) {
    return (
      <div className="flex min-h-screen bg-[#F3F3EF]">
        {/* Left Navigation Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onGenerateInvite={handleGenerateInvite}
          inviteLoading={inviteLoading}
        />

        {/* Content Area */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Mobile Top Header (only visible on mobile, provides toggle button) */}
          <header className="flex h-16 items-center justify-between border-b border-[#2B333C]/10 bg-[#14181C] px-5 text-[#F3F3EF] md:hidden">
            <Link
              href="/"
              className="text-[17px] font-semibold tracking-tight text-[#F3F3EF]"
              style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)" }}
            >
              SmartSplit<span className="text-[#E2993C]">.</span>
            </Link>

            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/5"
            >
              <span className="relative block h-3.5 w-4">
                <span className="absolute left-0 top-0 h-px w-4 bg-current" />
                <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
                <span className="absolute bottom-0 left-0 h-px w-4 bg-current" />
              </span>
            </button>
          </header>

          <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
      </div>
    );
  }

  // Public / Logged-out State (Navbar + Content + Footer)
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F3EF]">
      <Navbar />
      <main className="flex-1">
        {children}
        
        {/* Public About Us Section */}
        <section id="about-us" className="border-t border-[#DEDBD1] bg-[#F7F7F4] py-16 px-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8B8C82] mb-3">
              About Us
            </p>
            <h2
              className="text-[32px] leading-tight text-[#14181C] mb-6"
              style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)" }}
            >
              Building harmony for shared homes.
            </h2>
            
            <div className="space-y-5 text-[14.5px] leading-relaxed text-[#5b5c53]">
              <p>
                Living with roommates can be one of the best experiences of your life. But managing shared expenses, dividing up chores, and keeping the kitchen stocked can quickly become a source of friction.
              </p>
              <p>
                We created <strong>SmartSplit</strong> to remove the awkwardness from shared living. No more tracking down receipts, no more passive-aggressive group chats about who took out the trash last, and no more complicated spreadsheets.
              </p>
              <p>
                Our mission is simple: to help you split the bills and the chores fairly and transparently, so you can focus on what really matters—enjoying the friendship and the home you share.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
