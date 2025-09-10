//초 중 고 레벨 선택
import { useState } from "react";

export default function LevelPicker({ subTopic, onConfirm, onBack }) {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const levels = [
    {
      key: "초급자",
      title: "초급자",
      desc: "예금과 적금, 금리 개념, 차이를 배워요.",
      goal: "학습 완료 시, 예금과 적금의 차이를 명확히 이해하고, 자신에게 맞는 방식을 선택할 수 있습니다!",
    },
    {
      key: "중급자",
      title: "중급자",
      desc: "이자 계산 방식, 고정 vs 변동금리를 배워요.",
      goal: "학습 완료 시, 이자 계산법과 금리 구조를 이해하고 더 나은 금융상품을 선택할 수 있습니다!",
    },
    {
      key: "고급자",
      title: "고급자",
      desc: "예금자 보호, 비과세 상품을 배워요.",
      goal: "학습 완료 시, 세제 혜택과 예금자 보호 제도를 이해해 금융 리스크를 줄일 수 있습니다!",
    },
  ];

  return (
    <div
      style={{
        maxWidth: "412px",
        width: "100%",
        margin: "0 auto",
        background: "#F4F6FA",
        minHeight: "100vh",
        padding: "0 16px",
      }}
    >
      {/* 상단 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "24px" }}>
        <button
          onClick={onBack}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "22px",
            color: "#1B1B1B",
          }}
        >
          ←
        </button>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#474747" }}>
          은행 - {subTopic}
        </h2>
      </div>

      {/* 메인 */}
      <h1
        style={{
          fontSize: "26px",
          fontWeight: "900",
          lineHeight: "35px",
          marginTop: "24px",
          marginBottom: "4px",
          color: "#000",
        }}
      >
        단계별로 맞춘 집중학습, <br /> 함께 시작해요!
      </h1>
      <p style={{ fontSize: "16px", color: "#767676", marginBottom: "28px" }}>
        학습 목표를 확인하고 실습할 수 있어요.
      </p>

      {/* 레벨  */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {levels.map((lv) => (
          <div
            key={lv.key}
            onClick={() => setSelectedLevel(lv.key)}
            style={{
              width: "100%",
              height: "77px", 
              padding: "16px",
              background: "#fff",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxShadow:
                selectedLevel === lv.key
                  ? "0px 0px 4px #448FFF"
                  : "0px 0px 2px rgba(0,0,0,0.25)",
              border: selectedLevel === lv.key ? "1px solid #448FFF" : "none",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#4D4D4D", marginBottom: "6px" }}>
              {lv.title}
            </h3>
            <p style={{ fontSize: "12px", lineHeight: "14px", color: "#4D4D4D" }}>{lv.desc}</p>
          </div>
        ))}
      </div>

      {/* 학습 목표 카드 */}
      {selectedLevel && (
        <div
          style={{
            marginTop: "40px",
            padding: "16px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
            textAlign: "center",
          }}
        >
          <h4 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px", color: "#000" }}>
            학습 목표
          </h4>
          <p style={{ fontSize: "14px", lineHeight: "16px", color: "#474747" }}>
            {levels.find((lv) => lv.key === selectedLevel)?.goal}
          </p>
        </div>
      )}

      {/* 확인 버튼 */}
      <button
        onClick={() => onConfirm(selectedLevel)}
        disabled={!selectedLevel}
        style={{
          marginTop: "32px",
          marginBottom: "40px",
          width: "100%",
          height: "60px",
          background: selectedLevel
            ? "linear-gradient(104.45deg, #448FFF -6.51%, #4833D0 105.13%)"
            : "#CACACA",
          color: "#fff",
          fontSize: "18px",
          fontWeight: "700",
          border: "none",
          borderRadius: "8px",
          cursor: selectedLevel ? "pointer" : "not-allowed",
          boxShadow: selectedLevel ? "0px 0px 8px rgba(0,0,0,0.25)" : "none",
        }}
      >
        확인
      </button>
    </div>
  );
}
