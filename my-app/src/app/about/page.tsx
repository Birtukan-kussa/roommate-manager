import Link from "next/link";

const fontDisplay = "var(--font-display, 'Fraunces', Georgia, serif)";

export default function AboutPage() {
  return (
    <div
      className="min-h-screen bg-[#F3F3EF] flex flex-col"
      style={{ fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)" }}
    >


      <main className="flex-1 mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8B8C82] mb-4">
          About Us
        </p>
        <h1
          className="text-[42px] leading-[1.1] text-[#14181C] mb-8"
          style={{ fontFamily: fontDisplay }}
        >
          Building harmony for shared homes.
        </h1>
        
        <div className="space-y-6 text-[15.5px] leading-relaxed text-[#5b5c53]">
          <p>
            Living with roommates can be one of the best experiences of your life. But managing shared expenses, dividing up chores, and keeping the kitchen stocked can quickly become a source of friction.
          </p>
          <p>
            We created <strong>SmartSplit</strong> to remove the awkwardness from shared living. No more tracking down receipts, no more passive-aggressive group chats about who took out the trash last, and no more complicated spreadsheets.
          </p>
          <p>
            Our mission is simple: to help you split the bills and the chores fairly and transparently, so you can focus on what really matters—enjoying the friendship and the home you share.
          </p>
          
          <div className="mt-12 rounded-xl border border-[#DEDBD1] bg-white p-8 shadow-sm">
            <h2 
              className="text-2xl text-[#14181C] mb-4" 
              style={{ fontFamily: fontDisplay }}
            >
              Ready to simplify your household?
            </h2>
            <div className="flex gap-3">
              <Link
                href="/signup"
                className="rounded-md bg-[#14181C] px-5 py-2.5 text-[14px] font-medium text-[#F3F3EF] transition hover:bg-[#232a32]"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}