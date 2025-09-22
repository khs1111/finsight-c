//초 중 고 레벨 선택
import { useState } from "react";

// props: mainTopic (대분류), subTopic (선택된 소분류)
export default function LevelPicker({ mainTopic, subTopic, onConfirm, onBack }) {
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
        minHeight: "100vh",
        margin: "0 auto",
        background: "#F4F6FA",
        paddingBottom: "120px", // 하단 버튼+탭바 공간 확보
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 상단 헤더 */}
      <div
        style={{
          marginTop: "64px",
          marginLeft: "16px",
          width: "380px",
          height: "24px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: "24px",
            height: "24px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "22px",
            color: "#1B1B1B",
            padding: 0,
            marginRight: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span
          style={{
            fontFamily: "Pretendard, Roboto, sans-serif",
            fontWeight: 700,
            fontSize: "18px",
            lineHeight: "21px",
            color: "#474747",
          }}
        >
          {mainTopic ? `${mainTopic} - ${subTopic || ''}` : subTopic || ''}
        </span>
      </div>

      {/* 메인 타이틀 */}
      <h1
        style={{
          margin: "24px 0 0 16px",
          width: "300px",
          height: "70px",
          fontFamily: "Roboto",
          fontWeight: 900,
          fontSize: "30px",
          lineHeight: "35px",
          color: "#000",
        }}
      >
        내가 고른 주제, <br />
        깊이 있게 배워 봐요!
      </h1>

      {/* 서브 타이틀 */}
      <p
        style={{
          margin: "19px 0 0 16px",
          width: "260px",
          height: "19px",
          fontFamily: "Roboto",
          fontWeight: 400,
          fontSize: "16px",
          lineHeight: "19px",
          color: "#767676",
        }}
      >
        학습 목표를 확인하고 실습할 수 있어요.
      </p>

      {/* 레벨 카드 리스트 */}
      <div
        style={{
          margin: "58px 0 0 16px",
          width: "380px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {levels.map((lv) => (
          <div
            key={lv.key}
            onClick={() => setSelectedLevel(lv.key)}
            style={{
              width: "380px",
              minHeight: "77px",
              padding: "16px",
              background: "#fff",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "10px",
              boxShadow:
                selectedLevel === lv.key
                  ? "0px 0px 4px #448FFF"
                  : "0px 0px 2px rgba(0,0,0,0.25)",
              border: selectedLevel === lv.key ? "1px solid #448FFF" : "none",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            <div
              style={{
                fontFamily: "Roboto",
                fontWeight: 700,
                fontSize: "18px",
                lineHeight: "21px",
                letterSpacing: "-0.02em",
                color: "#4D4D4D",
                marginBottom: "4px",
              }}
            >
              {lv.title}
            </div>
            <div
              style={{
                fontFamily: "Roboto",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "14px",
                letterSpacing: "-0.02em",
                color: "#4D4D4D",
              }}
            >
              {lv.desc}
            </div>
          </div>
        ))}
      </div>

      {/* 학습 목표 카드 */}
      {selectedLevel && (
        <div
          style={{
            margin: "32px 0 0 16px",
            width: "380px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "32px 16px 24px 16px",
            minHeight: "149px",
          }}
        >
          <div
            style={{
              fontFamily: "Roboto",
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: "23px",
              color: "#000",
              textAlign: "center",
              marginBottom: "12px",
            }}
          >
            학습 목표
          </div>
          <div
            style={{
              width: "100%",
              borderTop: "1px solid #F5F5F5",
              marginBottom: "16px",
            }}
          />
          <div
            style={{
              fontFamily: "Roboto",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "16px",
              color: "#474747",
              textAlign: "center",
              width: "100%",
            }}
          >
            {levels.find((lv) => lv.key === selectedLevel)?.goal}
          </div>
        </div>
      )}

      {/* 확인 버튼 - 하단 고정 */}
      <button
        onClick={() => onConfirm(selectedLevel)}
        disabled={!selectedLevel}
        style={{
          position: "fixed",
          left: "50%",
          bottom: "72px", // 네비게이션 바 높이만큼 위로
          transform: "translateX(-50%)",
          width: "380px",
          height: "60px",
          background: selectedLevel
            ? "linear-gradient(104.45deg, #448FFF -6.51%, #4833D0 105.13%)"
            : "#CACACA",
          color: "#fff",
          fontFamily: "Roboto",
          fontWeight: 700,
          fontSize: "18px",
          lineHeight: "21px",
          textAlign: "center",
          letterSpacing: "-0.02em",
          border: "none",
          borderRadius: "8px",
          cursor: selectedLevel ? "pointer" : "not-allowed",
          boxShadow: selectedLevel ? "0px 0px 8px rgba(0,0,0,0.25)" : "none",
          zIndex: 100,
        }}
      >
        확인
      </button>
    </div>
  );
}
