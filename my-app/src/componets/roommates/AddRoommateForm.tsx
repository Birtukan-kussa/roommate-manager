"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { ADD_ROOMMATE } from "@/graphql/roommateMutations";
import { GET_ROOMMATES } from "@/graphql/roommateQueries";

export default function AddRoommateForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [color, setColor] = useState("#3498db");

  const [addRoommate] = useMutation(ADD_ROOMMATE, {
    refetchQueries: [{ query: GET_ROOMMATES }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await addRoommate({ variables: { name, email, color } });
      setName("");
      setEmail("");
      setColor("#3498db");
    } catch (err) {
      console.error("Error adding roommate:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", marginBottom: "20px", alignItems: "center" }}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        title="Pick a color"
      />
      <button type="submit">Add Roommate</button>
    </form>
  );
}