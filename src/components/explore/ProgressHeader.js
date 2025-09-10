import React from "react";

export default function ProgressHeader({
  current = 1,   // 기본값 1번 문제
  total = 4,
  onBack,
  spacing = -24,  // 문제와 헤더 사이 거리 (px)
}) {
  // current는 1부터 시작한다고 가정
  const clamped = Math.max(1, Math.min(current, total));

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#F4F6FA" }}>
      {/* 상태바 높이만큼 여백 (피그마 48px) */}
      <div style={{ height:16 }} />

      {/* Frame 86 */}
      <div
        style={{
          width: "100%",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            // Frame 116
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Frame 88 (Arrow) */}
          <button
            aria-label="뒤로가기"
            onClick={onBack}
            style={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              marginLeft: -16
            }}
          >
            {/* SVG는 교체 가능 */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.9498 19.5196C11.0931 19.6548 11.2828 19.73 11.4798 19.7296C11.6761 19.7313 11.8643 19.6516 11.9998 19.5096C12.1428 19.3703 12.2234 19.1792 12.2234 18.9796C12.2234 18.78 12.1428 18.5889 11.9998 18.4496L6.29975 12.7495H19.52C19.9342 12.7495 20.27 12.4137 20.27 11.9995C20.27 11.5853 19.9342 11.2495 19.52 11.2495H6.29756L12.0098 5.51957C12.1528 5.38029 12.2334 5.18916 12.2334 4.98957C12.2334 4.78999 12.1528 4.59886 12.0098 4.45957C11.717 4.16712 11.2426 4.16712 10.9498 4.45957L3.94981 11.4596C3.65736 11.7524 3.65736 12.2268 3.94981 12.5196L10.9498 19.5196Z" fill="#1B1B1B"/>
</svg>

          </button>

          {/* Frame 2608168 — 진행바 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 16,
              width: 340,
            }}
          >
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 73,
                  height: 16,
                  borderRadius: 8,
                  background: i < clamped ? "#448FFF" : "#E0E8F3",
                  flex: 1,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 문제와의 간격 */}
      <div style={{ marginBottom: spacing }} />

      {/* 상단 배경 그림자 (피그마 spec) */}
      <div style={{ boxShadow: "0px -2px 4px rgba(10,26,51,0.18)" }} />
    </div>
  );
}
