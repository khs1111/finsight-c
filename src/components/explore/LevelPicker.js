//초 중 고 레벨 선택
import { useState } from "react";
import "./LevelPicker.css";

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
    <div className="level-picker-container">
      {/* 상단 헤더 */}
      <div className="level-picker-header">
        <button
          onClick={onBack}
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 22,
            color: '#1B1B1B',
            padding: 0,
            marginRight: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.9498 19.5201C11.0931 19.6553 11.2828 19.7304 11.4798 19.7301C11.6761 19.7318 11.8643 19.6521 11.9998 19.5101C12.1428 19.3708 12.2234 19.1797 12.2234 18.9801C12.2234 18.7805 12.1428 18.5894 11.9998 18.4501L6.29975 12.75H19.52C19.9342 12.75 20.27 12.4142 20.27 12C20.27 11.5858 19.9342 11.25 19.52 11.25H6.29756L12.0098 5.52006C12.1528 5.38077 12.2334 5.18965 12.2334 4.99006C12.2334 4.79048 12.1528 4.59935 12.0098 4.46006C11.717 4.16761 11.2426 4.16761 10.9498 4.46006L3.94981 11.4601C3.65736 11.7529 3.65736 12.2272 3.94981 12.5201L10.9498 19.5201Z" fill="#1B1B1B"/>
          </svg>
        </button>
        <span style={{
          fontFamily: 'Pretendard, Roboto, sans-serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          lineHeight: '1.3',
          color: '#474747',
          flex: 1,
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '-0.01em',
        }}>{mainTopic ? `${mainTopic} - ${subTopic || ''}` : subTopic || ''}</span>
      </div>

      {/* 메인 타이틀 */}
      <h1 className="level-picker-title">
        단계별로 맞춘 집중학습, <br />
        함께 시작해요!
      </h1>

      {/* 서브 타이틀 */}
      <p className="level-picker-desc">
        학습 목표를 확인하고 실습할 수 있어요.
      </p>

      {/* 레벨 카드 리스트 */}
      <div className="level-picker-list">
        {levels.map((lv) => (
          <div
            key={lv.key}
            className={
              'level-picker-card' +
              (selectedLevel === lv.key ? ' selected' : '')
            }
            onClick={() => setSelectedLevel(lv.key)}
          >
            <div className="level-picker-card-content">
              <div className="level-picker-card-title">
                {lv.title}
              </div>
              <div className="level-picker-card-desc">
                {lv.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 학습 목표 카드 */}
      {selectedLevel && (
        <div className="level-picker-goal">
          <div className="level-picker-goal-title">학습 목표</div>
          <div style={{ width: '100%', borderTop: '1px solid #F5F5F5', marginTop: 10, marginBottom: 10 }} />
          <div className="level-picker-goal-desc">
            {levels.find((lv) => lv.key === selectedLevel)?.goal}
          </div>
        </div>
      )}

      {/* 확인 버튼 */}
      <button
        onClick={() => onConfirm(selectedLevel)}
        disabled={!selectedLevel}
        style={{
          position: "fixed",
          left: "50%",
          bottom: "72px",
          transform: "translateX(-50%)",
          width: 'calc(100vw - 32px)',
          maxWidth: 380,
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
          boxShadow: selectedLevel ? "0 0 8px rgba(0,0,0,0.25)" : "none",
          zIndex: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          boxSizing: 'border-box',
          transition: 'background 0.15s',
        }}
      >
        확인
      </button>
    </div>
  );
}
