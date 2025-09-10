// 주제 선택
import { useState } from "react";
import TopicCard from "./TopicCard";

const subTopicMap = {
  은행: ["예금/적금", "계좌 종류와 기능", "인터넷/모바일 뱅킹", "은행 수수료", "대출 기초 이해"],
  카드: ["체크카드", "신용카드", "선불카드"],
  투자: ["주식", "채권", "펀드"],
  "세금/절세": ["소득세", "절세 전략"],
  암호화폐: ["비트코인", "이더리움", "블록체인 기초"],
};

export default function TopicPicker({ onConfirm }) {
  const [openTopic, setOpenTopic] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  const topics = Object.keys(subTopicMap);

  const toggleTopic = (topic) => {
    setOpenTopic(openTopic === topic ? null : topic);
    setSelectedSub(null);
    setSelectedTopic(topic);
  };

  return (
    <div
      style={{
        maxWidth: "412px",
        width: "100%",
        margin: "0 auto",
        padding: "16px",
        background: "#F4F6FA",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "26px",
          fontWeight: "900",
          marginBottom: "20px",
          lineHeight: "32px",
          color: "#000",
        }}
      >
        내가 고른 주제, <br /> 깊이 있게 배워봐요!
      </h1>

      {topics.map((topic) => (
        <div key={topic} style={{ marginBottom: "12px" }}>
          <TopicCard
            title={topic}
            onClick={() => toggleTopic(topic)}
            active={openTopic === topic}
          />

          {openTopic === topic && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #F0F0F0",
                borderTop: "none",
                borderRadius: "0 0 8px 8px",
                boxShadow: "0px 0px 4px rgba(0,0,0,0.1)",
                marginTop: "-8px",
              }}
            >
              {subTopicMap[topic].map((sub) => (
                <div
                  key={sub}
                  onClick={() => setSelectedSub(sub)}
                  style={{
                    padding: "14px 16px",
                    cursor: "pointer",
                    background: selectedSub === sub ? "#EAF2FF" : "#fff",
                    color: selectedSub === sub ? "#448FFF" : "#333",
                    fontSize: "16px",
                  }}
                >
                  {sub}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => onConfirm(selectedTopic, selectedSub)}
        disabled={!selectedSub}
        style={{
          marginTop: "20px",
          width: "100%",
          height: "60px",
          background: selectedSub
            ? "linear-gradient(104.45deg, #448FFF -6.51%, #4833D0 105.13%)"
            : "#CACACA",
          color: "#fff",
          fontSize: "18px",
          fontWeight: "700",
          border: "none",
          borderRadius: "8px",
          cursor: selectedSub ? "pointer" : "not-allowed",
        }}
      >
        확인
      </button>
    </div>
  );
}
