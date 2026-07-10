"use client";
import { useState } from "react";
import AddChoreForm from "../chores/AddChoreForm";
import ChoreItem from "../chores/ChoreItem";

export type Chore = {
  id: string;
  title: string;
  assignedTo: string;
  done: boolean;
};

export default function ChoreList() {
  const [chores, setChores] = useState<Chore[]>([]);

  function addChore(title: string, assignedTo: string) {
    const newChore: Chore = {
      id: crypto.randomUUID(),
      title,
      assignedTo,
      done: false,
    };
    setChores((prev) => [...prev, newChore]);
  }

  function toggleChore(id: string) {
    setChores((prev) =>
      prev.map((chore) =>
        chore.id === id ? { ...chore, done: !chore.done } : chore
      )
    );
  }

  function deleteChore(id: string) {
    setChores((prev) => prev.filter((chore) => chore.id !== id));
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Chores</h1>
      <AddChoreForm onAdd={addChore} />
      <div className="mt-6 space-y-2">
        {chores.length === 0 && (
          <p className="text-gray-400">No chores added yet.</p>
        )}
        {chores.map((chore) => (
          <ChoreItem
            key={chore.id}
            chore={chore}
            onToggle={toggleChore}
            onDelete={deleteChore}
          />
        ))}
      </div>
    </div>
  );
}