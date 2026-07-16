"use client";

const LEDGER_ITEMS = [
  { label: "Rent", detail: "split 3 ways", amount: "$840", state: "due" as const },
  { label: "Groceries", detail: "Priya paid", amount: "$62", state: "settled" as const },
  { label: "Dishes", detail: "Sam · Tue", amount: "", state: "settled" as const },
  { label: "Take out trash", detail: "You · Thu", amount: "", state: "due" as const },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full lg:grid lg:grid-cols-2"
      style={{ fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)" }}
    >
      {/* Form side */}
      <div className="flex min-h-screen items-center justify-center bg-[#F3F3EF] px-6 py-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {/* Signature side: dark ledger / receipt-stub panel */}
      <div className="relative hidden overflow-hidden bg-[#14181C] px-14 py-16 lg:flex lg:flex-col lg:justify-between">
        {/* perforated "tear" edge along the left border of this panel */}
        <div
          aria-hidden
          className="absolute left-0 top-0 h-full w-px"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, #F3F3EF 0px, #F3F3EF 8px, transparent 8px, transparent 18px)",
          }}
        />

        <div>
          <p
            className="text-2xl tracking-tight text-[#F3F3EF]"
            style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)" }}
          >
            SmartSplit<span className="text-[#E2993C]">.</span>
          </p>
          <p className="mt-4 max-w-[26ch] text-[15px] leading-relaxed text-[#8D93A0]">
            Split the bills. Split the chores. Not the friendship.
          </p>
        </div>

        {/* Receipt stub */}
        <div className="mt-12">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-[#8D93A0]">
            <span>This week</span>
            <span className="h-px flex-1 bg-[#2B333C]" />
          </div>

          <ul className="mt-4 space-y-0">
            {LEDGER_ITEMS.map((item, i) => (
              <li
                key={item.label}
                className={`flex items-center justify-between gap-4 py-3 ${i !== LEDGER_ITEMS.length - 1 ? "border-b border-dashed border-[#2B333C]" : ""
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={`h-[7px] w-[7px] rounded-full border ${item.state === "settled"
                        ? "border-[#7FA88A] bg-[#7FA88A]"
                        : "border-[#8D93A0] bg-transparent"
                      }`}
                  />
                  <div>
                    <p
                      className={`text-[13.5px] text-[#F3F3EF] ${item.state === "settled" ? "line-through decoration-[#5a6069]" : ""
                        }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-[11.5px] text-[#8D93A0]">{item.detail}</p>
                  </div>
                </div>
                {item.amount && (
                  <span
                    className="text-[13px] text-[#F3F3EF]"
                    style={{ fontFamily: "var(--font-mono, 'IBM Plex Mono', ui-monospace, monospace)" }}
                  >
                    {item.amount}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-[11px] text-[#5a6069]">
            One shared ledger. Everyone sees where things stand.
          </p>
        </div>
      </div>
    </div>
  );
}