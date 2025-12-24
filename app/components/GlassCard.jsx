 // components/GlassCard.tsx
export default function GlassCard({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      style={{
        background: "rgba(30, 41, 59, 0.45)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        padding: "12px",
        height: "260px",              // ✅ SAME HEIGHT FOR ALL CARDS
        display: "flex",
        flexDirection: "column",
        gridColumn: fullWidth ? "1 / -1" : undefined,
      }}
    >
      {children}
    </div>
  );
}
