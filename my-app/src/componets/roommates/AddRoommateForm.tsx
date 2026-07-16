"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { ADD_ROOMMATE } from "@/graphql/roommateMutations";
import { GET_ROOMMATES } from "@/graphql/roommateQueries";

const inputClass =
  "w-full rounded-md border border-[#DEDBD1] bg-white px-3.5 py-2.5 text-[14px] text-[#14181C] placeholder:text-[#A6A79C] outline-none transition focus:border-[#E2993C] focus:ring-2 focus:ring-[#E2993C]/25";

export default function AddRoommateForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [color, setColor] = useState("#E2993C");

  const [addRoommate, { loading }] = useMutation(ADD_ROOMMATE, {
    refetchQueries: [{ query: GET_ROOMMATES }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await addRoommate({ variables: { name, email, color } });
      setName("");
      setEmail("");
      setColor("#E2993C");
    } catch (err) {
      console.error("Error adding roommate:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-[#DEDBD1] bg-white p-4 shadow-sm sm:flex-row sm:items-center"
    >
      <label className="shrink-0" title="Pick a color">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-10 cursor-pointer appearance-none rounded-full border border-[#DEDBD1] bg-transparent p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:rounded-full [&::-webkit-color-swatch-wrapper]:p-0"
        />
      </label>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className={inputClass}
      />
      <input
        type="email"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
      />

      <button
        type="submit"
        disabled={loading}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#14181C] px-4 py-2.5 text-[13.5px] font-medium text-[#F3F3EF] transition hover:bg-[#232a32] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && (
          <span
            aria-hidden
            className="h-3 w-3 animate-spin rounded-full border-2 border-[#F3F3EF]/30 border-t-[#F3F3EF]"
          />
        )}
        {loading ? "Adding…" : "Add roommate"}
      </button>
    </form>
  );
}