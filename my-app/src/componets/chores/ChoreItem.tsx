"use client";

import { useAuth } from "@/lib/AuthContext";
import type { Chore } from "./ChoreList";

type Props = {
  chore: Chore;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function ChoreItem({ chore, onToggle, onDelete }: Props) {
  const { isAdmin } = useAuth();

  return (
    <div className="flex items-center justify-between rounded border border-gray-700 px-4 py-2">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={chore.done}
          onChange={() => onToggle(chore.id)}
        />
        <span className={chore.done ? "line-through text-gray-500" : ""}>
          {chore.title}
        </span>
        <span className="text-sm text-gray-400">({chore.assignedTo})</span>
      </div>
      {isAdmin && (
        <button
          onClick={() => onDelete(chore.id)}
          className="text-red-400 hover:text-red-500 text-sm"
        >
          Remove
        </button>
      )}
    </div>
  );
}