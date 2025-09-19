// 탐험 메인화면
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import FloatingQuizCTA from './FloatingQuizCTA';
import ExploreFilterDropdown from './ExploreFilterDropdown';
import useProgress from '../useProgress';
import { getQuestions } from '../../api/explore';
import antCharacter from '../../assets/antCharacter.svg';

// ExploreMain: 학습 진입 전 개요 UI
export default function ExploreMain({ onStart }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // 메뉴 토글 상태
  const [filterOpen, setFilterOpen] = useState(false);
  // 기본 난이도 선택: '초보자'
  const [selectedLevel, setSelectedLevel] = useState('초보자'); // 선택 난이도
  const [selectedTopic, setSelectedTopic] = useState('은행');
  const [selectedSubTopic, setSelectedSubTopic] = useState('예금/적금');
  const [totalQuestions, setTotalQuestions] = useState(0); // 서버에서 받아온 총 질문 수
  const today = new Date().getDate(); // 오늘 날짜
const weekDates = Array.from({ length: 7 }, (_, i) => today - 3 + i); // 오늘 기준으로 3일
// eslint-disable-next-line no-unused-vars
const [solvedDates, setSolvedDates] = React.useState([today]);

// 서버에서 질문 수 가져오기
useEffect(() => {
  const fetchQuestions = async () => {
    try {
      const response = await getQuestions({ 
        topicId: selectedTopic, 
        levelId: selectedLevel
      });
      
      if (response && Array.isArray(response.questions)) {
        setTotalQuestions(response.questions.length);
      } else if (response && typeof response.totalCount === 'number') {
        setTotalQuestions(response.totalCount);
      } else {
        setTotalQuestions(5); // 기본값
      }
    } catch (error) {
      console.error('Failed to fetch questions count:', error);
      setTotalQuestions(5); // 에러 시 기본값
    }
  };
  
  fetchQuestions();
}, [selectedLevel, selectedTopic, selectedSubTopic]);

// 진행 상황: 서버에서 받아온 총 질문 수를 전달
const { total: totalProblems, index: currentIndex, answers } = useProgress('default', totalQuestions);
const answeredCount = answers.length; // 사용자가 풀면 진행
// eslint-disable-next-line no-unused-vars
const correctCount = answers.filter(a => a.correct).length;
const progressPercent = totalProblems > 0 ? (answeredCount / totalProblems) * 100 : 0; // 진행 퍼센트

// 진행도 바 위치 기준 (현재 미사용)
// eslint-disable-next-line no-unused-vars  
const progressBarTop = 210;
// eslint-disable-next-line no-unused-vars
const progressBarLeft = "calc(50% - 355px/2 + 0.5px)";

// 징검다리 단계: 문제 수 기준 (질문이 없을 때 최소 0)
const totalStages = Math.max(0, totalProblems || 0);
// active 단계: 현재 푸는 문제 index (모두 끝나면 -1 로 처리)
const activeStage = currentIndex < totalStages ? currentIndex : -1;

const svgWidth = 336;
const svgHeight = 627;

// 징검다리 라인
const steppingStoneLine = (
  <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} fill="none" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
    <path d="M173.5 594.057C222 588.391 319 554.957 319 466.557C319 378.157 222 359.391 173.5 361.057C124.333 362.89 26.2 350.557 27 286.557C28 206.557 73 170.557 157.5 172.057C242 173.557 314.5 152.057 319 102.557C323.5 53.057 292.5 2.05698 157.5 4.05698"
      stroke="url(#paint0_linear_903_5358)" strokeWidth="8" strokeDasharray="15 15"
    />
    <defs>
      <linearGradient id="paint0_linear_903_5358" x1="173.203" y1="4" x2="173.203" y2="594.057" gradientUnits="userSpaceOnUse">
        <stop stopColor="#DEECFF"/>
        <stop offset="0.764423" stopColor="#DEECFF"/>
        <stop offset="1" stopColor="#448FFF"/>
      </linearGradient>
    </defs>
  </svg>
);

// 각 단계별 원(스테이지) 렌더 함수

  // 징검다리 스크롤 ref
  const steppingRef = useRef(null);

  useEffect(() => {
    if (steppingRef.current) {
      const el = steppingRef.current;
      el.scrollTop = el.scrollHeight - el.clientHeight;
    }
  }, []);

  return (
  <div style={{ position: 'relative', width: 412, minHeight: 853, background: '#F4F6FA', fontFamily: 'Roboto, sans-serif', margin: '0 auto' }} data-explore-root>
      <div style={{ position: 'absolute', left: 16, top: 64, width: 380, height: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setFilterOpen(o => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 30,
            border: 'none',
            background: 'transparent',
            padding: 0,
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px 12px', background: selectedLevel ? 'linear-gradient(104.45deg,#448FFF -6.51%,#4833D0 105.13%)' : '#EEF2F6', borderRadius: 8, minWidth: 58, height: 30 }}>
            <span style={{ color: selectedLevel ? '#FFFFFF' : '#626262', fontSize: 12, fontWeight: 700 }}>{selectedLevel || '난이도'}</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#474747', letterSpacing: '-0.02em' }}>{selectedTopic} - {selectedSubTopic}</span>
          <div style={{ width: 20, height: 20, transform: filterOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M17.0173 5C16.6805 5 16.3436 5.12807 16.0866 5.38509L9.99975 11.4728L3.9129 5.38509C3.39887 4.87193 2.56553 4.87193 2.05149 5.38509C1.53834 5.89912 1.53834 6.73246 2.05149 7.24649L9.06905 14.264C9.58308 14.7772 10.4164 14.7772 10.9305 14.264L17.948 7.24649C18.4612 6.73246 18.4612 5.89912 17.948 5.38509C17.691 5.12807 17.3541 5 17.0173 5Z" fill="#474747"/></svg>
          </div>
        </button>
        <div style={{ width: 24, height: 24, position: 'relative', cursor: 'pointer' }} onClick={() => setMenuOpen(!menuOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 18C3.44772 18 3 17.5523 3 17C3 16.4477 3.44772 16 4 16H20C20.5523 16 21 16.4477 21 17C21 17.5523 20.5523 18 20 18H4ZM4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H4ZM4 8C3.44772 8 3 7.55228 3 7C3 6.44772 3.44772 6 4 6H20C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H4Z" fill="#474747"/></svg>
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 32,
                right: 0,
                width: 82,
                height: 76,
                background: '#FFFFFF',
                boxShadow: '0px 0px 16px rgba(10,26,51,0.32)',
                borderRadius: 16,
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 12px',
                gap: 10,
                boxSizing: 'border-box',
                zIndex: 40
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', padding: 0, gap: 8, width: 58 }}>
                <div
                  onClick={() => { navigate('/study?tab=words'); setMenuOpen(false); }}
                  style={{
                    width: 58,
                    height: 14,
                    fontFamily: 'Roboto',
                    fontWeight: 700,
                    fontSize: 12,
                    lineHeight: '14px',
                    color: '#282828',
                    cursor: 'pointer',
                    letterSpacing: '-0.02em'
                  }}
                >단어장</div>
                <div style={{ width: 58, height: 0, borderTop: '1px solid #F5F5F5' }} />
                <div
                  onClick={() => { navigate('/study?tab=wrong'); setMenuOpen(false); }}
                  style={{
                    width: 58,
                    height: 14,
                    fontFamily: 'Roboto',
                    fontWeight: 700,
                    fontSize: 12,
                    lineHeight: '14px',
                    color: '#282828',
                    cursor: 'pointer',
                    letterSpacing: '-0.02em'
                  }}
                >오답노트</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ExploreFilterDropdown
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
        selectedTopic={selectedTopic}
        selectedSubTopic={selectedSubTopic}
        onConfirm={({ level, topic, subTopic }) => {
          setSelectedLevel(level);
          setSelectedTopic(topic);
          setSelectedSubTopic(subTopic);
        }}
      />

      {/* 출석 카드  */}
      <div style={{ position: 'absolute', left: '50%', top: 106, transform: 'translateX(-50%)', width: 380, height: 80, background: '#FFFFFF', boxShadow: '0 0 2px rgba(0,0,0,0.25)', borderRadius: 16, padding: '12px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {weekDates.map(date => (
            <div key={date} style={{ width: 18, textAlign: 'center', fontSize: 10, fontWeight: 500, color: date === today ? '#448FFF' : '#B2B2B2' }}>{date}</div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
          {weekDates.map(date => (
            <div key={date}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M10.1244 4.55018C10.4124 3.61856 11.2793 2.9877 12.2544 3.00018C13.2349 2.99033 14.1036 3.63063 14.3844 4.57018L15.0444 6.57018C15.3408 7.49581 16.2025 8.12289 17.1744 8.12018H19.2544C20.2492 8.08249 21.1495 8.70582 21.4643 9.65023C21.7791 10.5946 21.4328 11.6335 20.6144 12.2002L18.9044 13.4502C18.1162 14.0163 17.7846 15.0272 18.0844 15.9502L18.7444 17.9502C18.9712 18.6425 18.8487 19.4019 18.4157 19.9878C17.9827 20.5737 17.2928 20.9137 16.5644 20.9002C16.092 20.8966 15.6331 20.7425 15.2544 20.4602L13.6144 19.2102C12.8279 18.6365 11.7609 18.6365 10.9744 19.2102L9.25439 20.4602C8.87111 20.7686 8.39625 20.9409 7.90439 20.9502C7.17067 20.9563 6.48006 20.6042 6.05396 20.0069C5.62785 19.4095 5.51978 18.642 5.76439 17.9502L6.42439 15.9502C6.74237 15.03 6.42662 14.0098 5.64439 13.4302L3.93439 12.1802C3.14176 11.6115 2.8083 10.5953 3.10992 9.66755C3.41154 8.73983 4.27889 8.11399 5.25439 8.12018H7.33439C8.31172 8.12014 9.17514 7.48372 9.46439 6.55018L10.1244 4.55018Z" fill={solvedDates.includes(date) ? '#FFBC02' : '#B0B0B0'} /></svg>
            </div>
          ))}
        </div>
      </div>

      {/* 진행도 바 배경  */}
      <div id="explore-progress-bar" style={{ position: 'absolute', top: 210, left: '50%', transform: 'translateX(-50%)', width: 355, height: 12, background: '#DDEBFF', borderRadius: 50, overflow: 'hidden' }}>
        <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(104.45deg,#448FFF -6.51%,#4833D0 105.13%)', borderRadius: 50, transition: 'width .3s' }} />
      </div>
      {/* 진행도 바  */}
      <div style={{ position: 'absolute', top: 200, left: 16, width: 32, height: 32, background: '#448FFF', borderRadius: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 2px #448FFF' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>1</span>
      </div>
      <div style={{ position: 'absolute', top: 200, left: 364, width: 32, height: 32, background: '#DDEAFF', borderRadius: 16, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#ADC5EB', letterSpacing: '-0.02em' }}>2</span>
      </div>

      {/* 개미 캐릭터는 스크롤 영역 내부로 이동 (버튼처럼 고정 아님) */}

      {/* 징검다리 스크롤 영역 */}
      <SteppingStonesScrollable
        totalStages={totalStages}
        activeStage={activeStage}
        answeredCount={answeredCount}
        currentIndex={currentIndex}
      />
      <FloatingQuizCTA onClick={onStart} label="퀴즈 풀러가기" />
    </div>
  );
}

/**
 SteppingStones 컴포넌트
 */
function SteppingStonesScrollable({ totalStages = 0, activeStage = -1, answeredCount = 0, currentIndex = 0 }) {

  const VIEWPORT_HEIGHT = 430; 
  const OFFSET_LEFT = 34;     

  const baseRawPositions = [
    { left: 172, top: 665 }, // Stage 0 (bottom)
    { left: 292, top: 617 }, // Stage 1
    { left: 302, top: 484 }, // Stage 2
    { left: 172, top: 432 }, // Stage 3
    { left: 34,  top: 392 }, // Stage 4
    { left: 74,  top: 264 }, // Stage 5
    { left: 235, top: 242 }, // Stage 6
    { left: 120, top: 40  }, // Stage 7 (topmost)
  ];

  const extraPositions = [];
  if (totalStages > baseRawPositions.length) {
    const need = totalStages - baseRawPositions.length;
    const last = baseRawPositions[baseRawPositions.length - 1]; 
    let currentTop = last.top - 140; 
    for (let i = 0; i < need; i++) {

      const zigLeft = i % 2 === 0 ? 200 : 60;
      extraPositions.push({ left: zigLeft, top: currentTop });
      currentTop -= 140;
    }
  }
  const rawPositions = [...baseRawPositions, ...extraPositions];
  const maxTop = Math.max(...rawPositions.map(p => p.top), 0);
  const minTop = Math.min(...rawPositions.map(p => p.top), 0);
  const TOTAL_HEIGHT = (maxTop - minTop) + 120; 

  // 원형(68x68)의 정확한 중심 정렬을 위해 좌표를 보정합니다.
  // - 가로: 중심값에서 반지름(34px)을 빼서 왼쪽 상단 좌표로 변환
  // - 세로: 미세 상향 보정(-1px)으로 라인과의 시각적 중심을 맞춤
  const MICRO_SHIFT_Y = -1; // 필요시 -2 ~ +2 사이에서 추가 조정 가능
  const STONES_SHIFT_Y = 6; // 전체를 약간 올림(이전 12px에서 6px로 조정)
  const positions = rawPositions.map(p => ({ left: p.left - 34, top: p.top - minTop + MICRO_SHIFT_Y + STONES_SHIFT_Y }));

  // 특정 인덱스 원판의 미세 정렬 보정값 (px)
  // 필요 시 여기서 인덱스별 dx/dy를 조정하세요.
  const INDEX_MICRO = {
    // 두번째 원판: 선 중심에 정확히 올리기 위해 약간 왼쪽(-2px) + 위로 2px 보정
    1: { dx: -4, dy: -12 },
  };


  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {

      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight; 
      });
    }
  }, [totalStages]);

  function StageCircle({ index }) {
    const status = index < answeredCount ? 'done' : (index === currentIndex && currentIndex < totalStages) ? 'active' : 'locked';
  const pos = positions[index] || { left: 0, top: 0 };
  const adj = INDEX_MICRO[index] || { dx: 0, dy: 0 };
  const style = { position: 'absolute', left: pos.left + adj.dx, top: pos.top + adj.dy };
    if (status === 'done') {
      return (
        <svg key={index} width="68" height="68" viewBox="0 0 68 68" fill="none" style={style}>
          <rect width="68" height="68" rx="34" fill="url(#circle_grad)"/>
          <path d="M30.2387 41.5338C29.8201 41.5335 29.4145 41.3884 29.0908 41.123L23.6775 36.6884C22.9373 36.0453 22.8426 34.9303 23.4639 34.1717C24.0851 33.4131 25.197 33.2861 25.9733 33.885L30.1662 37.3167L42.2495 26.188C42.7037 25.6479 43.43 25.4206 44.1111 25.6052C44.7921 25.7899 45.3041 26.3531 45.4232 27.0486C45.5423 27.7441 45.247 28.4455 44.6662 28.8463L31.4712 41.0505C31.1373 41.3633 30.6962 41.5363 30.2387 41.5338Z" fill="white"/>
        </svg>
      );
    }
    if (status === 'active') {
      return (
        <div key={index} style={{ ...style, width: 68, height: 82 }}>
          <svg width="68" height="68" viewBox="0 0 68 68" fill="none" style={{ position:'absolute', left:0, top:0 }}>
            <rect width="68" height="68" rx="34" fill="url(#circle_grad)"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M26.6785 25.542H41.1785C43.8479 25.542 46.0119 27.7059 46.0119 30.3753V37.6253C46.0119 40.2947 43.8479 42.4587 41.1785 42.4587H26.6785C24.0092 42.4587 21.8452 40.2947 21.8452 37.6253V30.3753C21.8452 27.7059 24.0092 25.542 26.6785 25.542ZM25.7844 37.3232H42.0727C42.5732 37.3232 42.979 36.9175 42.979 36.417C42.979 35.9165 42.5732 35.5107 42.0727 35.5107H25.7844C25.2839 35.5107 24.8781 35.9165 24.8781 36.417C24.8781 36.9175 25.2839 37.3232 25.7844 37.3232Z" fill="white"/>
          </svg>
        </div>
      );
    }
    return (
      <svg key={index} width="68" height="68" viewBox="0 0 68 68" fill="none" style={style}>
        <rect width="68" height="68" rx="34" fill="#DDEBFF" />
        <path d="M34 21.01C36.0223 21.01 37.67 21.4836 38.9706 22.3625C40.269 23.2399 41.1031 24.442 41.6356 25.6994C42.3244 27.326 42.5413 29.1459 42.6112 30.6887H43.1688C44.2941 30.6888 45.2059 31.6015 45.2059 32.7268V44.9523C45.2059 46.0775 44.2941 46.9893 43.1688 46.9895H24.83C23.7048 46.9892 22.793 46.0774 22.7928 44.9523V32.7268C22.7928 31.6016 23.7047 30.6889 24.83 30.6887H25.3739C25.4486 28.8904 25.6897 26.9339 26.4696 25.2658C27.037 24.0526 27.9012 22.9548 29.1942 22.176C30.4778 21.4029 32.0738 21.01 34 21.01ZM34 24.0666C32.4867 24.0666 31.4699 24.3735 30.7715 24.7941C30.0827 25.209 29.5938 25.8004 29.2383 26.5607C28.7063 27.6986 28.5094 29.1262 28.4375 30.6887H39.5498C39.4843 29.3835 39.3078 28.0398 38.8213 26.8908C38.464 26.0474 37.9632 25.3702 37.2598 24.8947C36.5584 24.4208 35.5364 24.0667 34 24.0666Z" fill="#BAD1F3" />
      </svg>
    );
  }

  const [dynamicTop, setDynamicTop] = React.useState(320);
  React.useEffect(() => {
    function recalc() {
      const root = document.querySelector('[data-explore-root]');
      const cta = document.querySelector('[data-floating-cta]');
      if (!root || !cta) return; 
      const rootRect = root.getBoundingClientRect();
      const ctaRect = cta.getBoundingClientRect();
  const GAP = 0; 
      const ctaTopInRoot = ctaRect.top - rootRect.top;
      const targetBottomInRoot = ctaTopInRoot - GAP;
      const proposedTop = targetBottomInRoot - VIEWPORT_HEIGHT;
  // 하단 버튼과의 간격을 정확히 44px로 유지하기 위해 클램프 없이 적용
  setDynamicTop(Math.round(proposedTop));
    }
    recalc(); 
    window.addEventListener('resize', recalc);
    const interval = setInterval(recalc, 500); 
    setTimeout(() => clearInterval(interval), 4000);
    return () => {
      window.removeEventListener('resize', recalc);
      clearInterval(interval);
    };
  }, [totalStages, VIEWPORT_HEIGHT]);

  return (
  <div style={{ position: 'absolute', left: OFFSET_LEFT, top: dynamicTop, width: 336, height: VIEWPORT_HEIGHT, overflowY: 'auto', overscrollBehavior: 'contain', transition: 'top .25s ease' }} ref={scrollRef}>
      <div style={{ position: 'relative', width: 336, height: TOTAL_HEIGHT }}>
        {/* 개미 캐릭터 (스크롤과 함께 이동) */}
        <img
          src={antCharacter}
          alt="ant"
          style={{
            position: 'absolute',
            // 루트 기준 (64, 511)을 스크롤 영역 내부 좌표로 변환: left는 OFFSET_LEFT를 보정, top은 minTop/MICRO_SHIFT_Y/STONES_SHIFT_Y 반영
            left: 64 - OFFSET_LEFT,
            top: 511 - minTop + MICRO_SHIFT_Y + STONES_SHIFT_Y,
            width: 92,
            height: 140,
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
  <svg width="301" height={TOTAL_HEIGHT} viewBox="0 0 301 599" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', left: 20, top: STONES_SHIFT_Y }}>
          <path d="M150.5 595C199 589.333 296 555.9 296 467.5C296 379.1 199 360.333 150.5 362C101.333 363.833 3.19998 351.499 3.99998 287.499C4.99998 207.499 50 171.499 134.5 172.999C219 174.499 291.5 152.999 296 103.499C300.5 53.9994 269.5 2.99936 134.5 4.99936" stroke="url(#stepping_path_grad)" strokeWidth="8" strokeDasharray="15 15"/>
          <defs>
            <linearGradient id="stepping_path_grad" x1="150.203" y1="4.94238" x2="150.203" y2="595" gradientUnits="userSpaceOnUse">
              <stop stopColor="#DEECFF"/>
              <stop offset="0.764423" stopColor="#DEECFF"/>
              <stop offset="1" stopColor="#448FFF"/>
            </linearGradient>
            <linearGradient id="circle_grad" x1="-5.56897" y1="0" x2="83.967" y2="23.0671" gradientUnits="userSpaceOnUse">
              <stop stopColor="#448FFF"/>
              <stop offset="1" stopColor="#4833D0"/>
            </linearGradient>
          </defs>
        </svg>
        {Array.from({ length: totalStages }).map((_, i) => <StageCircle key={i} index={i} />)}
      </div>
    </div>
  );
}
