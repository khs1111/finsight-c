import React from "react";

export default function ArticleCard({ article }) {
  if (!article) return null;

  return (
    <div
      style={{
        marginTop: 16,
        background: "#FFFFFF",
        borderRadius: 8,
        boxShadow: "0px 0px 8px rgba(138,161,196,0.18)",
        padding: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            fontFamily: "Roboto, system-ui, -apple-system, Segoe UI",
            fontWeight: 700,
            fontSize: 18,
            lineHeight: "21px",
            letterSpacing: "-0.02em",
            color: "#474747",
          }}
        >
          {article.title}
        </div>
        <div
          style={{
            fontFamily: "Roboto, system-ui, -apple-system, Segoe UI",
            fontSize: 14,
            lineHeight: "16px",
            letterSpacing: "-0.03em",
            color: "#999999",
          }}
        >
          {article.meta}
        </div>

        <div style={{ height: 1, background: "#999", opacity: 0.6, margin: "8px 0 4px" }} />

        <div
          style={{
            fontFamily: "Roboto, system-ui, -apple-system, Segoe UI",
            fontSize: 12,
            lineHeight: "14px",
            letterSpacing: "-0.02em",
            color: "#1B1B1B",
            whiteSpace: "pre-wrap",
          }}
        >
          {article.body}
        </div>
      </div>
    </div>
  );
}
