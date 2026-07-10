"use client";
import { useState } from "react";
import AddItemForm from "../shopping-list/AddItemForm";
import ShoppingItem from "../shopping-list/ShoppingItem";

export type Item = {
  id: string;
  name: string;
  purchased: boolean;
};

export default function ShoppingList() {
  const [items, setItems] = useState<Item[]>([]);

  function addItem(name: string) {
    const newItem: Item = {
      id: crypto.randomUUID(),
      name,
      purchased: false,
    };
    setItems((prev) => [...prev, newItem]);
  }

  function toggleItem(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, purchased: !item.purchased } : item
      )
    );
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Shopping List</h1>
      <AddItemForm onAdd={addItem} />
      <div className="mt-6 space-y-2">
        {items.length === 0 && (
          <p className="text-gray-400">No items added yet.</p>
        )}
        {items.map((item) => (
          <ShoppingItem
            key={item.id}
            item={item}
            onToggle={toggleItem}
            onDelete={deleteItem}
          />
        ))}
      </div>
    </div>
  );
}