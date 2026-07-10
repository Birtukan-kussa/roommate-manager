import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ maxWidth: "700px", margin: "80px auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>Roommate Manager</h1>
      <p style={{ color: "#888", marginBottom: "40px" }}>
        Manage chores, schedules, shared expenses, and shopping lists with your roommates.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px",
        }}
      >
        <Link href="/roommates" style={cardStyle}>
          👥 Roommates
        </Link>
        <Link href="/chores" style={cardStyle}>
          🧹 Chores & Schedule
        </Link>
        <Link href="/expenses" style={cardStyle}>
          💸 Expenses
        </Link>
        <Link href="/shopping" style={cardStyle}>
          🛒 Shopping List
        </Link>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: "block",
  padding: "24px",
  border: "1px solid #333",
  borderRadius: "8px",
  textDecoration: "none",
  color: "inherit",
  fontSize: "1.1rem",
  fontWeight: 500,
};