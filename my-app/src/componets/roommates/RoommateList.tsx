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

const fontDisplay = "var(--font-display, 'Fraunces', Georgia, serif)";

export default function RoommateList() {
  const { loading, error, data } = useQuery<RoommatesData>(GET_ROOMMATES);

  return (
    <div
      className="min-h-screen bg-[#F3F3EF]"
      style={{ fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)" }}
    >
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8B8C82]">
          Household
        </p>
        <h1
          className="mt-2 text-[30px] leading-tight text-[#14181C]"
          style={{ fontFamily: fontDisplay }}
        >
          Roommates
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[#5b5c53]">
          Everyone who shares chores and expenses in this house.
        </p>

        <div className="mt-8">
          <AddRoommateForm />
        </div>

        <div className="mt-8 rounded-lg border border-[#DEDBD1] bg-white shadow-sm">
          {loading && (
            <div className="flex items-center gap-2.5 px-6 py-8 text-[13.5px] text-[#8B8C82]">
              <span
                aria-hidden
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#DEDBD1] border-t-[#14181C]"
              />
              Loading roommates…
            </div>
          )}

          {error && (
            <p className="px-6 py-8 text-[13.5px] text-[#C1543C]">
              Couldn&apos;t load roommates: {error.message}
            </p>
          )}

          {!loading && !error && data?.roommates.length === 0 && (
            <p className="px-6 py-8 text-[13.5px] text-[#8B8C82]">
              No roommates added yet — use the form above to add the first one.
            </p>
          )}

          {!loading &&
            !error &&
            data?.roommates.map((r, i) => (
              <RoommateItem key={r.id} roommate={r} isLast={i === (data?.roommates.length ?? 0) - 1} />
            ))}
        </div>
      </div>
    </div>
  );
}