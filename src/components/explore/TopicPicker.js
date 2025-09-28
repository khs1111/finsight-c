// 주제 선택
import { useState } from "react";

const subTopicMap = {
  은행: ["예금/적금", "계좌 종류와 기능", "인터넷/모바일 뱅킹", "은행 수수료", "대출 기초 이해"],
  카드: ["체크카드", "신용카드", "선불카드"],
  투자: ["주식", "채권", "펀드"],
  "세금/절세": ["소득세", "절세 전략"],
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

  // 모바일 대응: 600px 이하에서 width 100%
  const containerStyle = {
    maxWidth: "auto",
    width: "100%",
    margin: "0 auto",
    padding: "60px 16px 140px 16px",
    background: "#F4F6FA",
    minHeight: "100vh",
    boxSizing: "border-box",
    position: "relative",
  };
  if (typeof window !== 'undefined' && window.innerWidth <= 600) {
    containerStyle.width = "100vw";
    containerStyle.padding = "40px 4vw 100px 4vw";
  }

  return (
    <div style={containerStyle}>
      <h1
        style={{
          fontFamily: "Roboto, sans-serif",
          fontWeight: 900,
          fontStyle: "normal",
          fontSize: "30px",
          lineHeight: "100%",
          letterSpacing: "0",
          marginBottom: "98px",
          color: "#000",
        }}
      >
        내가 고른 주제, <br />
        깊이 있게 배워 봐요!
      </h1>

      {topics.map((topic) => (
        <div key={topic} style={{ marginBottom: "12px" }}>
          <div
            style={{
              width: 'calc(100vw - 32px)',
              maxWidth: 380,
              margin: '0 auto',
              borderRadius: openTopic === topic ? '8px 8px 0 0' : 8,
              boxShadow: '0px 0px 2px rgba(0,0,0,0.10)',
              background: openTopic === topic ? '#448FFF' : '#FFF',
              transition: 'box-shadow 0.2s, background 0.2s',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 60,
              padding: 0,
              position: 'relative',
            }}
            onClick={() => toggleTopic(topic)}
          >
            <span style={{
              fontFamily: 'Roboto',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: 18,
              lineHeight: '100%',
              letterSpacing: 0,
              color: openTopic === topic ? '#fff' : '#4D4D4D',
              marginLeft: 16,
              width: 348,
              textAlign: 'left',
              height: 21,
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>{topic}</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{marginRight: 16}} xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke={openTopic === topic ? '#fff' : '#BDBDBD'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {openTopic === topic && (
            <div
              style={{
                width: 'calc(100vw - 32px)',
                maxWidth: 380,
                margin: '0 auto',
                background: '#fff',
                boxShadow: '0px 0px 4px rgba(0,0,0,0.25)',
                borderRadius: '0 0 8px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 0,
                gap: 0,
                borderTop: 'none',
                overflow: 'hidden',
              }}
            >
              {subTopicMap[topic].map((sub, idx) => (
                <>
                  <div
                    key={sub}
                    onClick={e => { e.stopPropagation(); setSelectedSub(sub); }}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: '16px',
                      gap: 10,
                      width: '100%',
                      height: 53,
                      background: '#fff',
                      color: '#474747',
                      fontFamily: 'Roboto',
                      fontWeight: 400,
                      fontSize: 18,
                      lineHeight: '21px',
                      cursor: 'pointer',
                      border: selectedSub === sub ? '1px solid #448FFF' : '1px solid transparent',
                      boxShadow: selectedSub === sub ? '0px 0px 4px #448FFF' : 'none',
                      borderRadius: 8,
                      boxSizing: 'border-box',
                      margin: selectedSub === sub ? '0 0 0 0' : '0',
                      transition: 'border 0.15s, box-shadow 0.15s',
                    }}
                  >
                    <span style={{
                      width: 348,
                      height: 21,
                      display: 'flex',
                      alignItems: 'center',
                      fontFamily: 'Roboto',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      fontSize: 18,
                      lineHeight: '100%',
                      letterSpacing: 0,
                      color: '#474747',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{sub}</span>
                  </div>
                  {idx !== subTopicMap[topic].length - 1 && (
                    <div style={{ width: '100%', height: 0, border: '1px solid #F5F5F5' }} />
                  )}
                </>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => onConfirm(selectedTopic, selectedSub)}
        disabled={!selectedSub}
        style={{
          position: "fixed",
          left: "50%",
          bottom: "72px",
          transform: "translateX(-50%)",
          width: 'calc(100vw - 32px)',
          maxWidth: 380,
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
          boxShadow: selectedSub ? "0 0 8px rgba(0,0,0,0.25)" : "none",
          zIndex: 120,
        }}
      >
        확인
      </button>
    </div>
  );
}
