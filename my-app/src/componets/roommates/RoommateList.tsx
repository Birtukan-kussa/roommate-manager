"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ROOMMATES } from "@/graphql/roommateQueries";
import RoommateItem from "./RoommateItem";
import AddRoommateForm from "./AddRoommateForm";

type Roommate = {
  id: string;
  name: string;
  email: string;
  color: string;
  createdAt: string;
};

type RoommatesData = {
  roommates: Roommate[];
};

export default function RoommateList() {
  const { loading, error, data } = useQuery<RoommatesData>(GET_ROOMMATES);

  if (loading) return <p>Loading roommates...</p>;
  if (error) return <p>Error loading roommates: {error.message}</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1>Roommates</h1>
      <AddRoommateForm />
      {data?.roommates.map((r) => (
        <RoommateItem key={r.id} roommate={r} />
      ))}
    </div>
  );
}