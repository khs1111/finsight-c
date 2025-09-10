import React from "react";

export default function OptionCard({
  index,
  text,
  selectedIndex,
  correctIndex,
  onClick,
}) {
  const isSelected = selectedIndex === index;
  const isCorrect = index === correctIndex;
  const isWrongSelected = isSelected && !isCorrect;

  const baseBox = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "19px 16px",
    width: "100%",
    background: "#FFFFFF",
    borderRadius: 8,
    boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
    cursor: selectedIndex == null ? "pointer" : "default",
    userSelect: "none",
    transition: "box-shadow .12s, border .12s",
  };

  const styleBox = {
    ...baseBox,
    ...(isSelected && isCorrect
      ? { border: "1px solid #1EE000", boxShadow: "0px 0px 2px #1EE000" }
      : {}),
    ...(isWrongSelected
      ? { border: "1px solid #EE3030", boxShadow: "0px 0px 2px #EE3030" }
      : {}),
  };

  const baseCircle = {
    width: 36,
    height: 36,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 18,
    color: "#fff",
    background: "#448FFF",
  };

  const styleCircle = {
    ...baseCircle,
    ...(isSelected && isCorrect ? { background: "#1EE000" } : {}),
    ...(isWrongSelected ? { background: "#EE3030" } : {}),
  };

  return (
    <div
      style={styleBox}
      onClick={() => {
        if (selectedIndex == null) onClick(index);
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={styleCircle}>{String.fromCharCode(65 + index)}</div>
        <span style={{ fontSize: 14, color: "#4D4D4D" }}>{text}</span>
      </div>
    </div>
  );
}
