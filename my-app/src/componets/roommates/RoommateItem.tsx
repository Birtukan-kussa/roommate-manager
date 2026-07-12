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

export default function RoommateItem({ roommate }: { roommate: Roommate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(roommate.name);
  const [email, setEmail] = useState(roommate.email || "");
  const [color, setColor] = useState(roommate.color);
  const { isAdmin } = useAuth();

  const [updateRoommate] = useMutation(UPDATE_ROOMMATE, {
    refetchQueries: [{ query: GET_ROOMMATES }],
  });

  const [deleteRoommate] = useMutation(DELETE_ROOMMATE, {
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

  if (isEditing) {
    return (
      <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "8px", borderBottom: "1px solid #333" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <button onClick={handleSave}>Save</button>
        <button onClick={() => setIsEditing(false)}>Cancel</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderBottom: "1px solid #333" }}>
      <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: roommate.color }} />
      <span style={{ flex: 1 }}>{roommate.name}</span>
      <span style={{ color: "#888", fontSize: "0.9em" }}>{roommate.email}</span>
      {isAdmin && (
        <>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </>
      )}
    </div>
  );
}