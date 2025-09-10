//퀴즈 메인
import React, { useState } from "react"; 
import ProgressHeader from "./ProgressHeader";
import AntCharacter from "../../assets/antCharacter.svg";

/** 문제별 학습하기 텍스트 */
function getLearningText(id) {
  switch (id) {
    case 1:
      return `🔍 
이제 이렇게 생각해보세요.
“돈을 한 번에 넣고, 만기까지 기다린다” → 어떤 상품이죠?
“조금씩 꾸준히 쌓아간다” → 이건 어떤 구조에 가깝나요?

보기를 하나씩 볼 때는 말에 속지 말고 구조를 상상해보는 것이 포인트입니다.
‘돈을 어떻게 넣느냐’가 바로 핵심이에요.`;
    case 2:
      return `체크카드는 결제 즉시 통장에서 출금되고,
신용카드는 후불 결제로 나중에 결제되는 차이가 있습니다.`;
    case 3:
      return `복리 이자는 원금뿐 아니라 발생한 이자에도 다시 이자가 붙는 구조입니다.`;
    case 4:
      return `예금과 적금은 모두 은행에 돈을 맡기는 저축 상품이라는 공통점이 있습니다.`;
    default:
      return "";
  }
}

const DEFAULT_QUESTIONS = [
  {
    id: 1,
    heading: "‘예금’과 ‘적금’의 차이로 가장 옳은 것은?",
    options: [
      "예금은 매달 같은 금액을 넣고, 적금은 목돈을 한 번에 맡긴다.",
      "예금은 언제든 입출금 가능, 적금은 만기 전 인출 불가.",
      "예금은 목돈을 한 번에 넣고, 적금은 매달 조금씩 넣는다.",
      "예금은 이자가 없고, 적금만 이자가 있다."
    ],
    answer: 0,
    explanation:
      "예금은 보통 목돈을 한 번에 맡기는 방식이고, 적금은 정해진 기간 동안 일정 금액을 매달 납입하는 방식입니다."
  },
  {
    id: 2,
    heading: "체크카드와 신용카드의 차이를 고르세요.",
    options: [
      "체크=후불, 신용=선불",
      "체크=즉시 출금, 신용=후불 결제",
      "둘 다 할부 가능하고 조건 동일",
      "신용카드는 포인트 적립이 불가"
    ],
    answer: 1,
    explanation:
      "체크카드는 연결된 통장에서 즉시 출금되며, 신용카드는 한 달 뒤 후불 결제가 됩니다."
  },
  {
    id: 3,
    heading: "복리 이자란?",
    options: [
      "항상 단리보다 이자가 적다.",
      "원금에만 이자가 붙는다.",
      "원금+이자에 다시 이자가 붙는다.",
      "예금자 보호와 동일한 개념이다."
    ],
    answer: 2,
    explanation: "복리는 원금뿐 아니라 이자에도 다시 이자가 붙는 방식입니다."
  },
  {
    id: 4,
    heading: "예금과 적금의 공통점으로 옳은 것은?",
    options: [
      "모두 은행에 돈을 맡기는 저축 상품이다.",
      "예금만 이자가 붙는다.",
      "적금만 은행 보장을 받는다.",
      "둘 다 언제든 인출 가능하다."
    ],
    answer: 0,
    explanation:
      "예금과 적금은 모두 은행에 돈을 맡기고 이자를 받는 저축성 상품입니다."
  }
];

export default function QuizQuestion({ onComplete, onBack }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showLearning, setShowLearning] = useState(false);
  const [showHint, setShowHint] = useState(false); 
  const [results, setResults] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
const [showResult, setShowResult] = useState(false);

  const question = DEFAULT_QUESTIONS[current];

  const handleSelect = (index) => {
    if (showResult) return;   // 채점 이후엔 클릭 못하게
  setSelected(index); 
  };

  const handleNext = () => {
    if (current + 1 < DEFAULT_QUESTIONS.length) {
      setCurrent(current + 1);
      setSelected(null);
      setShowLearning(false);
      setShowHint(false);
    } else {
      onComplete(results);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        maxWidth: "390px",
        margin: "0 auto",
        background: "#F4F6FA",
        paddingBottom: "100px", 
        overflowY: "scroll",       
      }}
    >
      {/* 상단 진행도 */}
     <ProgressHeader
      current={current + 1}
      total={DEFAULT_QUESTIONS.length}
      onBack={onBack}
 />
      {/* 문제 */}
      <div style={{ padding: "16px" }}>
        <h2
          style={{
            fontFamily: "Roboto, sans-serif",
            fontWeight: 700,
            fontSize: "1.5rem",
            lineHeight: "2.125rem",
            letterSpacing: "-0.04em",
            color: "#1B1B1B",
            marginBottom: "16px",
          }}
        >
          {question.heading}
        </h2>

        {question.options.map((opt, idx) => {
  const isSelected = selected === idx;
  const isCorrect = isSelected && idx === question.answer;
  const isWrong = isSelected && idx !== question.answer;

  // 카드 스타일
  const borderColor = isCorrect ? "#1EE000" : isWrong ? "#EE3030" : "transparent";
  const shadowColor = isCorrect ? "#1EE000" : isWrong ? "#EE3030" : "rgba(0,0,0,0.25)";

  // 배지 색
  let badgeBg = "#448FFF";  

if (isCorrect === true) {
  badgeBg = "#1EE000";    
} else if (isWrong === true) {
  badgeBg = "#FF5959";   
}
  
  const badgeColor = "#FFFFFF";

  const badgeLetter = String.fromCharCode(65 + idx);

  return (
    <div
      key={idx}
      onClick={() => handleSelect(idx)}
      style={{
        width: "100%",
        padding: "19px 16px",
        borderRadius: "8px",
        background: "#fff",
        marginBottom: "16px",
        cursor: selected === null ? "pointer" : "default",
        border: `1px solid ${borderColor}`,
        boxShadow: `0px 0px 2px ${shadowColor}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* A/B/C/D 배지 */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "18px",
            background: badgeBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "18px",
            lineHeight: "21px",
            color: badgeColor,
            flexShrink: 0,
          }}
        >
          {badgeLetter}
        </div>

        {/* 옵션 텍스트 */}
        <div
          style={{
            fontSize: "14px",
            lineHeight: "16px",
            color: "#4D4D4D",
            flex: 1,
          }}
        >
          {opt}
        </div>
      </div>
    </div>
  );
})}

        {/* 정답 해설*/}
        {selected === question.answer && (
  <div
    style={{
      marginTop: "16px",
      background: "#E6F0FF",
      borderRadius: "8px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    }}
  >
    {/* 상단: 정답 + 배지 */}
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span
        style={{
          fontFamily: "Roboto, sans-serif",
          fontWeight: 700,
          fontSize: "12px",
          lineHeight: "14px",
          color: "#474747",
        }}
      >
        정답
      </span>

      {/* 정답 배지 */}
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "18px",
          background: "#448FFF",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Roboto, sans-serif",
            fontWeight: 700,
            fontSize: "12px",
            lineHeight: "14px",
            color: "#fff",
          }}
        >
          {String.fromCharCode(65 + question.answer)} {/* A, B, C, D */}
        </span>
      </div>
    </div>

    {/* 해설 텍스트 */}
    <div
      style={{
        fontFamily: "Roboto, sans-serif",
        fontWeight: 400,
        fontSize: "12px",
        lineHeight: "14px",
        letterSpacing: "-0.02em",
        color: "#647184",
      }}
    >
      {question.explanation}
    </div>
  </div>
)}


        {/* 학습하기 카드 */}
        <div style={{ marginTop: "24px" }}>
          <div
            onClick={() => setShowLearning(!showLearning)}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "8px",
              background: "#FFFFFF",
              boxShadow: "0px 0px 12px rgba(0,0,0,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: "Roboto, sans-serif",
                fontWeight: 700,
                fontSize: "18px",
                lineHeight: "21px",
                letterSpacing: "-0.02em",
                color: "#000",
              }}
            >
              🏫 학습하기
            </span>

            {/* 아이콘 (토글) */}
            {showLearning ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 16.7498C11.801 16.7508 11.6099 16.6715 11.47 16.5298L3.47003 8.52985C3.19467 8.23434 3.2028 7.77384 3.48841 7.48823C3.77402 7.20261 4.23452 7.19449 4.53003 7.46985L12 14.9398L19.47 7.46985C19.7655 7.19449 20.226 7.20261 20.5117 7.48823C20.7973 7.77384 20.8054 8.23434 20.53 8.52985L12.53 16.5298C12.3901 16.6715 12.1991 16.7508 12 16.7498Z"
                  fill="black"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ transform: "rotate(180deg)" }}
              >
                <path
                  d="M12 16.7498C11.801 16.7508 11.6099 16.6715 11.47 16.5298L3.47003 8.52985C3.19467 8.23434 3.2028 7.77384 3.48841 7.48823C3.77402 7.20261 4.23452 7.19449 4.53003 7.46985L12 14.9398L19.47 7.46985C19.7655 7.19449 20.226 7.20261 20.5117 7.48823C20.7973 7.77384 20.8054 8.23434 20.53 8.52985L12.53 16.5298C12.3901 16.6715 12.1991 16.7508 12 16.7498Z"
                  fill="black"
                />
              </svg>
            )}
          </div>

          {showLearning && (
            <div
              style={{
                marginTop: "16px",
                width: "100%",
                borderRadius: "8px",
                background: "#4B794C",
                padding: "20px 16px 32px",
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              {/* 개미 캐릭터 + 말풍선 */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src={AntCharacter}
                  alt="ant"
                  style={{ width: "48px", height: "48px" }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "40px",
                    background: "#FFFFFF",
                    borderRadius: "12px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#000",
                    boxShadow: "0px 0px 4px rgba(0,0,0,0.1)",
                    whiteSpace: "nowrap",
                  }}
                >
                  이 문제는 용어 정의 문제예요!
                </div>
              </div>

              {/* 칠판 텍스트 */}
              <div
                style={{
                  flex: 1,
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: 700,
                  fontSize: "18px",
                  lineHeight: "21px",
                  letterSpacing: "-0.02em",
                  color: "#FFFFFF",
                  whiteSpace: "pre-line",
                }}
              >
                {getLearningText(question.id)}
              </div>
            </div>
          )}
        </div>

        {/* 핵심 포인트 카드 */}
        <div
          style={{
            marginTop: "24px",
            background: "#F4F6FA",
            boxShadow: "0px 0px 18px rgba(0,0,0,0.5)",
            borderRadius: "16px",
            padding: "10px",
          }}
        >
          <div
            style={{
              background: "#FFE478",
              boxShadow: "0px 0px 12px rgba(0,0,0,0.08)",
              borderRadius: "12px",
              padding: "16px",
              position: "relative",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <span
                style={{
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: 700,
                  fontSize: "18px",
                  lineHeight: "21px",
                  letterSpacing: "-0.02em",
                  color: "#000",
                }}
              >
                💡 힌트
              </span>
            </div>

            <div
              style={{
                fontFamily: "Roboto, sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "16px",
                letterSpacing: "-0.03em",
                color: "#000",
                whiteSpace: "pre-line",
              }}
            >
              ✔️ 예금 = 목돈을 한 번에 넣고, 전액에 이자가 붙는 구조{"\n"}
              ✔️ 적금 = 매달 일정 금액을 넣으며, 쌓인 금액에 점점 이자가 붙는 구조{"\n"}
              ✔️ 둘 다 저축 상품이고, 둘 다 이자가 붙는다{"\n"}
              ✔️ 가장 중요한 차이는 ‘돈을 어떻게 넣느냐’!
            </div>

              {!showHint && (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "12px",
        backdropFilter: "blur(6px)",   
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <button
        onClick={() => setShowHint(true)}
        style={{
          padding: "12px 24px",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.2)",
          fontWeight: 700,
          fontSize: "14px",
          border: "none",
          cursor: "pointer",
        }}
      >
        <svg width="266" height="85" viewBox="0 0 266 85" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="266" height="85" rx="16" fill="white" fill-opacity="0.8"/>
<path d="M132 13.5098C134.023 13.5098 135.671 13.9835 136.971 14.8623C138.27 15.7397 139.104 16.9418 139.636 18.1992C140.325 19.8258 140.542 21.6457 140.612 23.1885H141.169C142.295 23.1886 143.207 24.1013 143.207 25.2266V37.4521C143.206 38.5773 142.295 39.4891 141.169 39.4893H122.831C121.706 39.489 120.794 38.5772 120.793 37.4521V25.2266C120.793 24.1014 121.705 23.1887 122.831 23.1885H123.375C123.449 21.3902 123.69 19.4337 124.47 17.7656C125.038 16.5524 125.902 15.4547 127.195 14.6758C128.478 13.9027 130.074 13.5098 132 13.5098ZM132 16.5664C130.487 16.5664 129.47 16.8733 128.772 17.2939C128.083 17.7088 127.594 18.3002 127.239 19.0605C126.707 20.1984 126.51 21.626 126.438 23.1885H137.55C137.485 21.8833 137.308 20.5396 136.822 19.3906C136.465 18.5472 135.964 17.87 135.26 17.3945C134.559 16.9206 133.537 16.5665 132 16.5664Z" fill="black"/>
<path d="M92.4815 59.598V61.026H86.2095V59.598H88.4355V58.422H90.2555V59.598H92.4815ZM88.2255 63.756C88.2255 64.386 88.6875 64.722 89.3735 64.722C90.0455 64.722 90.5075 64.386 90.5075 63.756C90.5075 63.126 90.0455 62.79 89.3735 62.79C88.6875 62.79 88.2255 63.126 88.2255 63.756ZM92.1455 63.756C92.1455 65.114 90.9975 66.066 89.3735 66.066C87.7355 66.066 86.5875 65.114 86.5875 63.756C86.5875 62.398 87.7355 61.446 89.3735 61.446C90.9975 61.446 92.1455 62.398 92.1455 63.756ZM88.3935 68.446V66.976H97.2695V71.218H95.4215V68.446H88.3935ZM95.5195 58.296H97.2695V66.374H95.5195V63.21H94.5675V66.318H92.8455V58.52H94.5675V61.726H95.5195V58.296ZM106.494 63.7L105.612 65.142C104.156 64.708 103.162 63.826 102.588 62.692C102 63.924 100.95 64.904 99.4384 65.38L98.5424 63.924C100.698 63.252 101.622 61.614 101.622 60.032V58.786H103.498V60.032C103.498 61.586 104.408 63.098 106.494 63.7ZM102.546 67.634V69.608H107.502V67.634H102.546ZM100.726 71.05V66.192H109.308V71.05H100.726ZM107.446 58.31H109.308V65.59H107.446V58.31ZM118.338 60.844V64.498H120.97V60.844H118.338ZM120.578 68.264H125.52V69.748H113.844V68.264H118.73V65.968H114.824V64.498H116.504V60.844H114.754V59.374H124.554V60.844H122.804V64.498H124.512V65.968H120.578V68.264ZM136.873 58.324V67.578H135.011V58.324H136.873ZM128.151 62.412C128.151 63.448 128.907 64.078 129.859 64.078C130.825 64.078 131.553 63.448 131.553 62.412C131.553 61.348 130.825 60.732 129.859 60.732C128.907 60.732 128.151 61.348 128.151 62.412ZM133.359 62.412C133.359 64.288 131.833 65.674 129.859 65.674C127.885 65.674 126.345 64.288 126.345 62.412C126.345 60.508 127.885 59.136 129.859 59.136C131.833 59.136 133.359 60.508 133.359 62.412ZM130.139 69.51H137.195V70.98H128.291V66.668H130.139V69.51ZM148.911 64.96V66.416H139.853V59.248H148.813V60.732H141.729V62.09H148.519V63.518H141.729V64.96H148.911ZM138.481 68.222H150.157V69.72H138.481V68.222ZM156.793 62.566V64.372H162.309V62.566H156.793ZM160.475 68.208H165.403V69.706H153.727V68.208H158.627V65.842H154.959V59.108H156.793V61.11H162.309V59.108H164.129V65.842H160.475V68.208ZM166.76 59.64H172.948C172.948 63.588 171.618 66.808 167.04 69.02L166.074 67.564C169.364 65.982 170.792 63.966 171.058 61.11H166.76V59.64ZM174.922 58.296H176.784V71.19H174.922V58.296Z" fill="black"/>
</svg>

      </button>
    </div>
  )}
</div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "390px",
          padding: "16px",
          background: "#F4F6FA",
        }}
      >
        <button
  disabled={selected === null}   
  onClick={() => {
    if (!showResult) {

      setShowResult(true);
    } else {
    
      setSelected(null);      // 선택 초기화
      setShowResult(false);   // 결과 화면 닫기
      handleNext();           // 다음 문제 이동
    }
  }}
  style={{
    width: "100%",
    padding: "16px",
    borderRadius: "8px",
    border: "none",
    background:
      selected === null
        ? "#CACACA" // 선택 전 → 회색
        : "linear-gradient(104.45deg, #448FFF -6.51%, #4833D0 105.13%)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "18px",
    cursor: selected === null ? "not-allowed" : "pointer",
  }}
>
  {showResult ? "다음" : "채점하기"}
</button>

      </div>
    </div>
  );
}
