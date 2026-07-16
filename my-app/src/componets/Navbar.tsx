import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-[#2B333C] bg-[#14181C] text-[#F3F3EF] shrink-0">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        {/* Brand Logo */}
        <Link
          href="/"
          className="text-[19px] tracking-tight text-[#F3F3EF] transition hover:text-[#E2993C] font-semibold"
          style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)" }}
        >
          SmartSplit<span className="text-[#E2993C]">.</span>
        </Link>

        {/* Public Action Links */}
        <nav className="flex items-center gap-5">
          <Link 
            href="/login" 
            className="text-[13.5px] text-[#C7CAD1] transition hover:text-[#F3F3EF]"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-[#E2993C] px-3.5 py-1.5 text-[13px] font-medium text-[#14181C] transition hover:bg-[#f0a648]"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}