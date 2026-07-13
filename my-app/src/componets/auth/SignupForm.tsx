"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

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
        const res = await fetch("http://localhost:9000/graphql", {
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
      const res = await fetch("http://localhost:9000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          inviteToken: inviteRequired ? inviteToken : undefined 
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      login({ _id: data._id, name: data.name, email: data.email, role: data.role }, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (checkingInvite) {
    return <div className="text-center text-gray-400">Verifying registration access...</div>;
  }

  if (inviteRequired && !inviteToken) {
    return (
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Invite Only</h1>
        <p className="text-gray-300 mb-6">
          Registration is restricted. You must have a valid invite link from a roommate admin to register.
        </p>
        <Link href="/login" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 text-center">Sign Up</h1>
      {inviteRequired && (
        <p className="text-xs text-green-400 text-center mb-4 font-semibold">
          ✓ Valid invite link detected
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-gray-600 bg-transparent px-3 py-2 text-white"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-gray-600 bg-transparent px-3 py-2 text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-gray-600 bg-transparent px-3 py-2 text-white"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="rounded border border-gray-600 bg-transparent px-3 py-2 text-white"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}