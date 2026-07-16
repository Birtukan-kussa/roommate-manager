"use client";

import Image from "next/image";
import roommatesImg from "../../../public/roommates.png";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-[#F3F3EF]"
      style={{ fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)" }}
    >
      {/* Form side */}
      <div className="flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {/* Signature side: image panel */}
      <div className="relative hidden overflow-hidden px-14 py-16 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="w-full max-w-[500px] flex flex-col items-center">
          {/* Main Image */}
          <div className="relative w-full overflow-hidden rounded-2xl shadow-sm mb-8">
            <Image 
              src={roommatesImg} 
              alt="Roommates hanging out" 
              className="w-full h-auto object-cover"
              placeholder="blur"
            />
          </div>

          {/* Quote / Tagline below the image */}
          <div className="w-full text-center">
            <p
              className="text-3xl tracking-tight text-[#14181C]"
              style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)" }}
            >
              SmartSplit<span className="text-[#E2993C]">.</span>
            </p>
            <p className="mx-auto mt-3 max-w-[28ch] text-[16px] leading-relaxed text-[#5b5c53]">
              Split the bills. Split the chores. Not the friendship.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}