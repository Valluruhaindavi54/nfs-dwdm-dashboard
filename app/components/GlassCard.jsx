"use client";

export default function GlassCard({ children, style }: any) {
  return (
    <div className="glass-card" style={style}>
      <style jsx>{`
        .glass-card:hover {
          background: linear-gradient(
            135deg,
            rgba(56, 189, 248, 0.12) 0%,
            rgba(30, 41, 59, 0.8) 100%
          ) !important;
          border-color: rgba(125, 211, 252, 0.3) !important;
          transform: translateY(-2px);
        }
      `}</style>
      {children}
    </div>
  );
}