"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { UPDATE_ROOMMATE, DELETE_ROOMMATE } from "@/graphql/roommateMutations";
import { GET_ROOMMATES } from "@/graphql/roommateQueries";
import { useAuth } from "@/lib/AuthContext";

type Roommate = {
  id: string;
  name: string;
  email: string;
  color: string;
};

const inputClass =
  "rounded-md border border-[#DEDBD1] bg-white px-2.5 py-1.5 text-[13px] text-[#14181C] outline-none transition focus:border-[#E2993C] focus:ring-2 focus:ring-[#E2993C]/25";

export default function RoommateItem({
  roommate,
  isLast = false,
}: {
  roommate: Roommate;
  isLast?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(roommate.name);
  const [email, setEmail] = useState(roommate.email || "");
  const [color, setColor] = useState(roommate.color);
  const { isAdmin } = useAuth();

  const [updateRoommate, { loading: saving }] = useMutation(UPDATE_ROOMMATE, {
    refetchQueries: [{ query: GET_ROOMMATES }],
  });

  const [deleteRoommate, { loading: deleting }] = useMutation(DELETE_ROOMMATE, {
    refetchQueries: [{ query: GET_ROOMMATES }],
  });

  const handleSave = async () => {
    try {
      await updateRoommate({ variables: { id: roommate.id, name, email, color } });
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating roommate:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRoommate({ variables: { id: roommate.id } });
    } catch (err) {
      console.error("Error deleting roommate:", err);
    }
  };

  const rowBorder = !isLast ? "border-b border-dashed border-[#DEDBD1]" : "";

  if (isEditing) {
    return (
      <div className={`flex flex-wrap items-center gap-2.5 px-6 py-4 ${rowBorder}`}>
        <label title="Pick a color">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-8 cursor-pointer appearance-none rounded-full border border-[#DEDBD1] bg-transparent p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:rounded-full [&::-webkit-color-swatch-wrapper]:p-0"
          />
        </label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} w-32`} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} flex-1 min-w-[10rem]`} />
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-[#14181C] px-3 py-1.5 text-[12.5px] font-medium text-[#F3F3EF] transition hover:bg-[#232a32] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="rounded-md px-3 py-1.5 text-[12.5px] font-medium text-[#8B8C82] transition hover:text-[#14181C]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-6 py-4 ${rowBorder}`}>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
        style={{ backgroundColor: roommate.color || "#14181C" }}
      >
        {roommate.name.charAt(0).toUpperCase()}
      </div>
      <span className="flex-1 truncate text-[14px] text-[#14181C]">{roommate.name}</span>
      <span className="hidden truncate text-[12.5px] text-[#8B8C82] sm:block">{roommate.email}</span>
      {isAdmin && (
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#8B8C82] transition hover:text-[#14181C]"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#8B8C82] transition hover:bg-[#C1543C]/10 hover:text-[#C1543C] disabled:opacity-60"
          >
            {deleting ? "Removing…" : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}