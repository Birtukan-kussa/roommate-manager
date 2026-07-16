import Link from "next/link";

const pillars = [
  {
    title: "Chores",
    copy: "Set up a rotation once. SmartSplit keeps track of whose turn it is and nudges the household when something's overdue.",
  },
  {
    title: "Expenses",
    copy: "Log what you paid for and who it's split with. Everyone can see the running balance — no more guessing who owes who.",
  },
  {
    title: "Shopping list",
    copy: "One shared list for the house. Add what you need, and cross it off when it's in the fridge.",
  },
];

export default function AboutPage() {
  return (
    <div
      className="min-h-screen bg-[#F3F3EF]"
      style={{ fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)" }}
    >
      <div className="mx-auto max-w-2xl px-6 py-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8B8C82]">
          About
        </p>
        <h1
          className="mt-3 text-[36px] leading-[1.15] text-[#14181C]"
          style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)" }}
        >
          One ledger for everything you share.
        </h1>
        <p className="mt-5 text-[15.5px] leading-relaxed text-[#5b5c53]">
          Living with roommates usually means two spreadsheets that never get updated and a
          group chat full of &ldquo;did you pay me back yet?&rdquo; SmartSplit puts your chores
          and expenses in one place, so the house always knows where things stand.
        </p>

        <div className="mt-10 flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-[#DEDBD1]" />
          <span className="text-[11px] uppercase tracking-[0.14em] text-[#8B8C82]">
            What it does
          </span>
          <span className="h-px flex-1 bg-[#DEDBD1]" />
        </div>

        <div className="mt-8 flex flex-col">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.title}
              className={`flex gap-5 py-5 ${i !== pillars.length - 1 ? "border-b border-dashed border-[#DEDBD1]" : ""
                }`}
            >
              <span
                className="mt-0.5 shrink-0 text-[13px] text-[#E2993C]"
                style={{ fontFamily: "var(--font-mono, 'IBM Plex Mono', ui-monospace, monospace)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-[15px] font-medium text-[#14181C]">{pillar.title}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-[#5b5c53]">{pillar.copy}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-lg border border-[#DEDBD1] bg-white px-6 py-6">
          <h2
            className="text-[18px] text-[#14181C]"
            style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)" }}
          >
            Why we built it
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#5b5c53]">
            Most tools handle either chores or money, not both — and shared living is really
            about both. We wanted something small households could set up in a few minutes and
            actually keep using, without turning fairness into a spreadsheet argument.
          </p>
        </div>

        <div className="mt-12 flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#14181C] transition hover:text-[#E2993C]"
          >
            ← Back to home
          </Link>
          <span className="h-4 w-px bg-[#DEDBD1]" aria-hidden />
          <Link
            href="/signup"
            className="text-[14px] font-medium text-[#14181C] underline decoration-[#E2993C] decoration-2 underline-offset-2"
          >
            Set up your household
          </Link>
        </div>
      </div>
    </div>
  );
}