"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import AuthLayout from "@/app/(auth)/layout";

const inputClass =
  "w-full rounded-md border border-[#DEDBD1] bg-white px-3.5 py-2.5 text-[14px] text-[#14181C] placeholder:text-[#A6A79C] outline-none transition focus:border-[#E2993C] focus:ring-2 focus:ring-[#E2993C]/25";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteRequired, setInviteRequired] = useState(false);
  const [checkingInvite, setCheckingInvite] = useState(true);

  const { login } = useAuth();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite") || "";

  useEffect(() => {
    const checkInviteRequirement = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000";
        const res = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: "{ roommates { id } }" }),
        });
        const json = await res.json();

        if (json.data && json.data.roommates && json.data.roommates.length > 0) {
          setInviteRequired(true);
        }
      } catch (err) {
        console.error("Error checking roommates count:", err);
      } finally {
        setCheckingInvite(false);
      }
    };
    checkInviteRequirement();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000";
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          inviteToken: inviteRequired ? inviteToken : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      login({ _id: data._id, name: data.name, email: data.email, role: data.role }, data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (checkingInvite) {
    return (
      <AuthLayout>
        <div className="flex items-center gap-2.5 text-[14px] text-[#8B8C82]">
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#DEDBD1] border-t-[#14181C]"
          />
          Checking registration access…
        </div>
      </AuthLayout>
    );
  }

  if (inviteRequired && !inviteToken) {
    return (
      <AuthLayout>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#C1543C]">
          Invite only
        </p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[#14181C]"
          style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)" }}
        >
          This household is closed to new sign-ups
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-[#5b5c53]">
          You&apos;ll need a valid invite link from a roommate admin to join. Ask them to send
          you one from the household settings.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-[#14181C] px-4 py-2.5 text-[14px] font-medium text-[#F3F3EF] transition hover:bg-[#232a32]"
        >
          Go to login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8B8C82]">
        Get started
      </p>
      <h1
        className="mt-2 text-[28px] leading-tight text-[#14181C]"
        style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)" }}
      >
        Set up your account
      </h1>

      {inviteRequired && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#4d7a63]">
          <span aria-hidden className="h-[6px] w-[6px] rounded-full bg-[#7FA88A]" />
          Valid invite link detected
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-[13px] text-[#5b5c53]">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Jordan Lee"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] text-[#5b5c53]">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[13px] text-[#5b5c53]">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-[13px] text-[#5b5c53]">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="rounded-md border border-[#C1543C]/25 bg-[#C1543C]/[0.06] px-3 py-2 text-[13px] text-[#C1543C]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[#14181C] px-4 py-2.5 text-[14px] font-medium text-[#F3F3EF] transition hover:bg-[#232a32] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && (
            <span
              aria-hidden
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#F3F3EF]/30 border-t-[#F3F3EF]"
            />
          )}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13.5px] text-[#8B8C82]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#14181C] underline decoration-[#E2993C] decoration-2 underline-offset-2">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}