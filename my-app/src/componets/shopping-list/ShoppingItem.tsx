"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import type { Item } from "./ShoppingList";

type Props = {
  item: Item;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => Promise<void>;
  onAssign: (id: string, assigneeId: string | null) => Promise<void>;
  roommates: { id: string; name: string; color: string }[];
  isLast?: boolean;
};

export default function ShoppingItem({ item, onToggle, onDelete, onRename, onAssign, roommates, isLast = false }: Props) {
  const { user, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [saving, setSaving] = useState(false);

  // Members can edit/delete their own items; admins can modify anything
  const isOwner = user?._id === item.addedBy?.id;
  const canModify = isAdmin || isOwner;

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await onRename(item.id, editName.trim());
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(item.name);
    setIsEditing(false);
  };

  const rowBorder = !isLast ? "border-b border-dashed border-[#DEDBD1]" : "";

  // ── Edit row ──
  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 border-l-2 border-l-[#E2993C] bg-[#FBF6ED] px-5 py-3 ${rowBorder}`}>
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="flex-1 rounded-md border border-[#DEDBD1] bg-white px-3 py-1.5 text-[13.5px] text-[#14181C] outline-none transition focus:border-[#E2993C] focus:ring-2 focus:ring-[#E2993C]/25"
          autoFocus
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-[#14181C] px-3 py-1.5 text-[12.5px] font-medium text-[#F3F3EF] transition hover:bg-[#232a32] disabled:opacity-60"
        >
          {saving ? "…" : "Save"}
        </button>
        <button
          onClick={handleCancel}
          className="rounded-md border border-[#DEDBD1] px-3 py-1.5 text-[12.5px] font-medium text-[#5b5c53] transition hover:border-[#14181C]"
        >
          Cancel
        </button>
      </div>
    );
  }

  // ── Read-only row ──
  return (
    <div className={`flex items-center justify-between gap-4 px-5 py-3.5 ${rowBorder}`}>
      <div className="flex min-w-0 items-center gap-3">
        <label className="relative flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center">
          <input
            type="checkbox"
            checked={item.purchased}
            onChange={() => onToggle(item.id)}
            className="peer sr-only"
          />
          <span
            className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#E2993C]/40 ${item.purchased ? "border-[#7FA88A] bg-[#7FA88A]" : "border-[#DEDBD1] bg-white"
              }`}
          >
            {item.purchased && (
              <svg viewBox="0 0 12 12" className="h-[9px] w-[9px]" aria-hidden>
                <path
                  d="M2 6.2 4.8 9 10 3"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </label>

        <div className="min-w-0">
          <span className={`text-[14px] ${item.purchased ? "text-[#A6A79C] line-through" : "text-[#14181C]"}`}>
            {item.name}
          </span>
          {item.addedBy && (
            <span className="ml-2 inline-flex items-center gap-1.5 text-[12px] text-[#8B8C82]">
              <span
                aria-hidden
                className="h-[6px] w-[6px] rounded-full"
                style={{ backgroundColor: item.addedBy.color ?? "#A6A79C" }}
              />
              added by {item.addedBy.name}
            </span>
          )}
          {(item as any).assignedTo && (
            <span className="ml-3 inline-flex items-center gap-1.5 rounded-full bg-[#E2993C]/10 px-2 py-0.5 text-[11px] font-medium text-[#C1543C]">
              <span
                aria-hidden
                className="h-[6px] w-[6px] rounded-full"
                style={{ backgroundColor: (item as any).assignedTo.color ?? "#C1543C" }}
              />
              assigned to {(item as any).assignedTo.name}
            </span>
          )}
        </div>
      </div>

      {/* Edit + Delete shown to admins and the item's own creator */}
      {canModify && (
        <div className="flex shrink-0 items-center gap-2">
          {isAdmin && (
            <select
              value={(item as any).assignedTo?.id || ""}
              onChange={(e) => onAssign(item.id, e.target.value || null)}
              className="mr-2 rounded-md border border-[#DEDBD1] bg-white px-2 py-1 text-[12px] text-[#14181C] focus:border-[#E2993C] focus:outline-none"
            >
              <option value="">Unassigned</option>
              {roommates.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => {
              setEditName(item.name);
              setIsEditing(true);
            }}
            className="rounded-md px-2 py-1 text-[12.5px] font-medium text-[#8B8C82] transition hover:text-[#14181C]"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="rounded-md px-2 py-1 text-[12.5px] font-medium text-[#8B8C82] transition hover:bg-[#C1543C]/10 hover:text-[#C1543C]"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}