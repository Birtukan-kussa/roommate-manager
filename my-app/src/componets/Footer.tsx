"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const SUBMIT_CONTACT_MESSAGE = gql`
  mutation SubmitContactMessage($name: String!, $email: String!, $message: String!) {
    submitContactMessage(name: $name, email: $email, message: $message)
  }
`;

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [submitContact, { loading }] = useMutation(SUBMIT_CONTACT_MESSAGE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("All fields are required.");
      return;
    }

    try {
      await submitContact({
        variables: { name, email, message },
      });
      setSuccess("Your message has been sent successfully!");
      setName("");
      setEmail("");
      setMessage("");
      // Close the modal after a short delay
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send message. Please check back later.");
    }
  };

  return (
    <footer className="border-t border-[#2B333C] bg-[#14181C] text-[#8D93A0] py-12 px-6">
      <div className="mx-auto max-w-3xl flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left Side: Brand */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link
            href="/"
            className="text-[17px] tracking-tight text-[#F3F3EF] transition hover:text-[#E2993C] font-semibold"
            style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)" }}
          >
            SmartSplit<span className="text-[#E2993C]">.</span>
          </Link>
          <p className="text-[12px] mt-1 text-[#5c626d]">
            © {new Date().getFullYear()} SmartSplit. All rights reserved.
          </p>
        </div>

        {/* Right Side: Links */}
        <div className="flex flex-wrap justify-center gap-6 text-[13.5px]">
          <Link href="#about-us" className="hover:text-[#F3F3EF] transition">
            About Us
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="hover:text-[#F3F3EF] transition cursor-pointer text-left"
          >
            Contact Us
          </button>
          <span className="text-[#2B333C]">|</span>
          <span className="text-[#5c626d] select-none">Privacy Policy</span>
          <span className="text-[#5c626d] select-none">Terms</span>
        </div>
      </div>

      {/* Contact Us Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div 
            className="w-full max-w-md bg-white border border-[#DEDBD1] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200"
            style={{ fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)" }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#DEDBD1] px-6 py-4 bg-[#F7F7F4]">
              <h3 
                className="text-[18px] font-semibold text-[#14181C]"
                style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)" }}
              >
                Contact Support
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setError("");
                  setSuccess("");
                }}
                className="text-[#8B8C82] hover:text-[#14181C] transition text-[20px] font-semibold p-1"
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="rounded-md bg-[#C1543C]/10 p-3 text-[13px] text-[#C1543C]">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-md bg-[#7FA88A]/10 p-3 text-[13px] text-[#7FA88A]">
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="contact-name" className="block text-[12.5px] font-medium text-[#5b5c53] mb-1">
                  Your Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-[#DEDBD1] px-3 py-2 text-[13.5px] text-[#14181C] focus:border-[#E2993C] focus:outline-none focus:ring-1 focus:ring-[#E2993C]"
                  placeholder="Abebe Bikila"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-[12.5px] font-medium text-[#5b5c53] mb-1">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-[#DEDBD1] px-3 py-2 text-[13.5px] text-[#14181C] focus:border-[#E2993C] focus:outline-none focus:ring-1 focus:ring-[#E2993C]"
                  placeholder="abebe@gmail.com"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-[12.5px] font-medium text-[#5b5c53] mb-1">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-md border border-[#DEDBD1] px-3 py-2 text-[13.5px] text-[#14181C] focus:border-[#E2993C] focus:outline-none focus:ring-1 focus:ring-[#E2993C]"
                  placeholder="How can we help you today?"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="px-4 py-2 border border-[#DEDBD1] rounded-md text-[13px] font-medium text-[#5b5c53] hover:bg-[#F7F7F4] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-md bg-[#14181C] text-[13.5px] font-medium text-[#F3F3EF] hover:bg-[#232a32] transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                >
                  {loading && (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
