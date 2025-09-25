
import React from "react";
import "./OptionCard.css";

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

  let cardClass = "option-card";
  if (isSelected && isCorrect) cardClass += " selected-correct";
  else if (isWrongSelected) cardClass += " selected-wrong";
  const isDisabled = selectedIndex != null;

  return (
    <div
      className={cardClass}
      aria-disabled={isDisabled}
      onClick={() => {
        if (!isDisabled) onClick(index);
      }}
    >
      <div className="option-card-inner">
        <div className="option-card-circle">{String.fromCharCode(65 + index)}</div>
        <span className="option-card-text">{text}</span>
      </div>
    </div>
  );
}
