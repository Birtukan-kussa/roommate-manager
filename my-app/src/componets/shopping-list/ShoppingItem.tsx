"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import type { Item } from "./ShoppingList";

type Props = {
  item: Item;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => Promise<void>;
};

export default function ShoppingItem({ item, onToggle, onDelete, onRename }: Props) {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [saving, setSaving] = useState(false);

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

  // ── Edit row ──
  if (isEditing) {
    return (
      <div className="flex items-center gap-2 rounded border border-blue-600 bg-gray-900 px-4 py-2">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="flex-1 rounded border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm"
          autoFocus
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "…" : "Save"}
        </button>
        <button
          onClick={handleCancel}
          className="rounded border border-gray-600 px-3 py-1.5 text-sm text-gray-300 hover:border-gray-400"
        >
          Cancel
        </button>
      </div>
    );
  }

  // ── Read-only row ──
  return (
    <div className="flex items-center justify-between rounded border border-gray-700 px-4 py-2">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={item.purchased}
          onChange={() => onToggle(item.id)}
          className="cursor-pointer"
        />
        <div>
          <span className={item.purchased ? "line-through text-gray-500" : ""}>
            {item.name}
          </span>
          {item.addedBy && (
            <span className="ml-2 text-sm text-gray-400">
              → added by{" "}
              <span
                className="font-medium"
                style={{ color: item.addedBy.color ?? "inherit" }}
              >
                {item.addedBy.name}
              </span>
            </span>
          )}
        </div>
      </div>
      {isAdmin && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditName(item.name);
              setIsEditing(true);
            }}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="text-red-400 hover:text-red-500 text-sm"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}