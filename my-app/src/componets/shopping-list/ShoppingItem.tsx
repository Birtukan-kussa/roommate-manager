"use client";

import type { Item } from "./ShoppingList";

type Props = {
  item: Item;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function ShoppingItem({ item, onToggle, onDelete }: Props) {
  return (
    <div className="flex items-center justify-between rounded border border-gray-700 px-4 py-2">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={item.purchased}
          onChange={() => onToggle(item.id)}
        />
        <span className={item.purchased ? "line-through text-gray-500" : ""}>
          {item.name}
        </span>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="text-red-400 hover:text-red-500 text-sm"
      >
        Remove
      </button>
    </div>
  );
}