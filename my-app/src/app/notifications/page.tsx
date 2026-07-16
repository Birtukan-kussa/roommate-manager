"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { useRouter } from "next/navigation";

const GET_ROOMMATES = gql`
  query GetRoommatesForNotifications {
    roommates {
      id
      name
      email
    }
  }
`;

const SEND_ADMIN_NOTIFICATION = gql`
  mutation SendAdminNotification($roommateId: ID, $message: String!, $subject: String) {
    sendAdminNotification(roommateId: $roommateId, message: $message, subject: $subject)
  }
`;

export default function NotificationsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [selectedRoommate, setSelectedRoommate] = useState("ALL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const { data, loading: roommatesLoading, error: roommatesError } = useQuery<{ roommates: any[] }>(GET_ROOMMATES, {
    fetchPolicy: "network-only",
  });
  const [sendNotification, { loading: sending }] = useMutation(SEND_ADMIN_NOTIFICATION);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [authLoading, isAdmin, router]);

  if (authLoading || roommatesLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F3F3EF]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E2993C] border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }

    try {
      await sendNotification({
        variables: {
          roommateId: selectedRoommate === "ALL" ? null : selectedRoommate,
          message,
          subject: subject.trim() || "Message from SmartSplit Admin",
        },
      });
      setSuccess("Notification sent successfully!");
      setMessage("");
      setSubject("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send notification.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F3EF] px-5 py-8 pb-20 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 
            className="text-3xl tracking-tight text-[#14181C] mb-2"
            style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)" }}
          >
            Send Notification
          </h1>
          <p className="text-[14.5px] text-[#5b5c53]">
            Manually send an email notification to roommates.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="rounded-xl border border-[#DEDBD1] bg-white p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-6 rounded-md bg-[#C1543C]/10 p-3 text-[13.5px] text-[#C1543C]">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-md bg-[#7FA88A]/10 p-3 text-[13.5px] text-[#7FA88A]">
              {success}
            </div>
          )}

          {roommatesError && (
            <div className="mb-6 rounded-md bg-[#C1543C]/10 p-3 text-[13.5px] text-[#C1543C]">
              Error loading roommates: {roommatesError.message}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="roommate" className="mb-1.5 block text-[13px] font-medium text-[#5b5c53]">
                Recipient
              </label>
              <select
                id="roommate"
                value={selectedRoommate}
                onChange={(e) => setSelectedRoommate(e.target.value)}
                className="w-full rounded-md border border-[#DEDBD1] bg-white px-3.5 py-2 text-[14px] text-[#14181C] focus:border-[#E2993C] focus:outline-none focus:ring-1 focus:ring-[#E2993C]"
              >
                <option value="ALL">All Roommates</option>
                {data?.roommates?.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.email || "No email"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="mb-1.5 block text-[13px] font-medium text-[#5b5c53]">
                Subject (Optional)
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Message from SmartSplit Admin"
                className="w-full rounded-md border border-[#DEDBD1] px-3.5 py-2 text-[14px] text-[#14181C] placeholder-[#8B8C82] focus:border-[#E2993C] focus:outline-none focus:ring-1 focus:ring-[#E2993C]"
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-[13px] font-medium text-[#5b5c53]">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-[#DEDBD1] px-3.5 py-2 text-[14px] text-[#14181C] focus:border-[#E2993C] focus:outline-none focus:ring-1 focus:ring-[#E2993C]"
                placeholder="Type your message here..."
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="mt-2 w-full rounded-md bg-[#14181C] px-4 py-2.5 text-[14px] font-medium text-[#F3F3EF] transition hover:bg-[#232a32] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
