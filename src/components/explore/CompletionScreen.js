import React, { useLayoutEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import FloatingQuizCTA from './FloatingQuizCTA';
import completeImg from '../../assets/explore/complete.png';
import allfailImg from '../../assets/explore/allfail.png';
import './CompletionScreen.css';

export default function CompletionScreen({
  score,
  total,
  results = [],
  questions = [],
  completeResult = null,
  onRetry,
  onExplore,
}) {
  const navigate = useNavigate();
  // bottom nav height 측정 (FloatingQuizCTA와 동일한 기준 사용)
  const [navHeight, setNavHeight] = useState(0);
  const getViewportWidth = () => {
    if (typeof window === 'undefined') return 390;
    if (window.visualViewport?.width) return Math.round(window.visualViewport.width);
    return Math.round(window.innerWidth);
  };
  const getViewportHeight = () => {
    if (typeof window === 'undefined') return 844;
    if (window.visualViewport?.height) return Math.round(window.visualViewport.height);
    return Math.round(window.innerHeight);
  };
  const [vw, setVw] = useState(getViewportWidth());
  const [vh, setVh] = useState(getViewportHeight());
  const [containerMinH, setContainerMinH] = useState(getViewportHeight());
  useLayoutEffect(() => {
    // 초기 페인트 전에 뷰포트/내비 높이를 먼저 측정해서 첫 렌더 레이아웃이 맞도록 함
    function measure() {
      const nav = document.querySelector('.bottom-nav');
      if (nav) {
        const h = nav.getBoundingClientRect().height;
        setNavHeight(h);
      } else {
        setNavHeight(0);
      }
      if (typeof window !== 'undefined') {
        setVw(getViewportWidth());
        setVh(getViewportHeight());
        setContainerMinH(getViewportHeight());
      }
    }
    // 두 번의 rAF로 모바일 브라우저 주소창 애니메이션 영향을 완화
    requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });
    const ro = typeof window !== 'undefined' && 'ResizeObserver' in window ? new ResizeObserver(measure) : null;
    if (ro) {
      const nav = document.querySelector('.bottom-nav');
      if (nav) ro.observe(nav);
    }
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      if (ro) ro.disconnect();
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, []);

  // 스택 계산 (FloatingQuizCTA 기본값과 동기화)
  const baseBottom = navHeight + 16; // stackIndex=0 bottom
  const buttonHeight = 60;
  const gap = 16;
  const topCTABottom = baseBottom + (buttonHeight + gap) * 1; // stackIndex=1
  const premiumBubbleBottom = topCTABottom + buttonHeight + gap; // 위 CTA 위로 16px
  // 뷰포트 기반 레이아웃 계산
  const maxCardWidth = Math.min(360, vw - 32);
  const characterSize = vh <= 740 ? 180 : 240;
  const topBubble = vh <= 740 ? 36 : 48;
  const topCharacter = topBubble + 88 + 6; // 말풍선 아래 여유
  const estimatedCardHeight = 120; // 내용 자동 높이이지만 레이아웃 계산용 추정치
  // 결과 카드 top: 캐릭터 아래 일정 간격, 단 CTA와 겹치지 않도록 하단 여유
  const rawResultTop = topCharacter + characterSize + 24;
  const bottomSafe = navHeight + 16 + 60 + 16 + 60 + 16; // CTA 2개 스택 가정 여유치
  const maxTopForCard = Math.max(0, vh - bottomSafe - estimatedCardHeight);
  const resultTop = Math.min(rawResultTop, maxTopForCard);

  // Character selection: only when all wrong -> allfail, otherwise always show 'complete' image
  const allWrong = typeof total === 'number' && total > 0 && score === 0;
  const charSrc = allWrong ? allfailImg : completeImg;

  return (
    <div
      className="completion-container"
      style={{ minHeight: `${containerMinH}px` }}
    >
      {/* ===== Status Bar ===== */}
      <div className="completion-status-bar">
        {/* 여기에 실제 스테이터스 UI를 넣으세요 */}
      </div>

      {/* ===== 말풍선 ===== */}
      <div className="completion-bubble-wrap" style={{ top: `${topBubble}px` }}>
        <div className="completion-bubble">
          <span className="completion-bubble-text">
            {score === 0 ? (
              "아쉽게도 모두 틀렸어요"
            ) : (
              <>
                참 잘했어요
                <br />
                {`${score}개 맞췄어요`}
              </>
            )}
          </span>
        </div>
        <div className="completion-bubble-tail" />
      </div>

      {/* ===== 캐릭터 자리 (이미지 렌더) ===== */}
      <div className="completion-character" style={{ top: `${topCharacter}px`, width: `${characterSize}px`, height: `${characterSize}px` }}>
        <img
          src={charSrc}
          alt={allWrong ? '전부 오답 캐릭터' : '완료 캐릭터'}
          width={characterSize}
          height={characterSize}
          className="completion-character-img"
        />
      </div>

      {/* ===== 문제별 결과 카드 ===== */}
      <div className="completion-card" style={{ top: `${resultTop}px`, width: `${maxCardWidth}px` }}>
        {/* 문제 번호 */}
        <div className="completion-card-numbers">
          {results.map((_, idx) => (
            <div key={idx} className="completion-card-number-badge">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* O/X 결과 */}
        <div className="completion-card-ox-row">
          {results.map((r, idx) => {
            const isCorrect = r && r.correct === true;
            return (
              <div key={idx} style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {isCorrect ? (
                  // 정답 O 
                  <div className="completion-card-o" />
                ) : (
                  // 오답 X
                  <div className="completion-card-x">
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M28.5079 26.1836L17.3188 15.0006L28.5079 3.89999C29.0686 3.25055 29.0383 2.27594 28.4382 1.66315C27.8381 1.05036 26.8707 1.00597 26.2177 1.56128L14.9959 12.5796L3.97035 1.47893C3.33231 0.840357 2.30186 0.840357 1.66382 1.47893C1.35414 1.78818 1.17994 2.20914 1.17994 2.64829C1.17994 3.08743 1.35414 3.50839 1.66382 3.81764L12.673 14.9018L1.48388 25.986C1.17419 26.2952 1 26.7162 1 27.1554C1 27.5945 1.17419 28.0155 1.48388 28.3247C1.79259 28.633 2.21051 28.8049 2.64532 28.8023C3.07216 28.8049 3.48309 28.6394 3.79041 28.3412L14.9959 17.2241L26.2177 28.5224C26.5264 28.8306 26.9444 29.0025 27.3792 29C27.8083 28.9982 28.2196 28.8266 28.5242 28.5224C28.8318 28.2109 29.003 27.7887 29 27.3496C28.9969 26.9104 28.8197 26.4907 28.5079 26.1836Z" fill="#FF5959" stroke="#FF5959" strokeWidth="2"/>
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 프리미엄 안내 말풍선  */}
      <div className="completion-premium-wrap" style={{ bottom: premiumBubbleBottom }}>
        <div className="completion-premium-box">
          프리미엄 가입시, 틀린 문제를 다시 확인할 수 있어요!
        </div>
        <div className="completion-premium-tail" />
      </div>

      <FloatingQuizCTA
        stackIndex={0}
        label="홈으로 가기"
        onClick={onExplore}
        gradient={false}
        shadow={false}
        style={{ pointerEvents: 'none' }}
        buttonStyle={{ pointerEvents:'auto' }}
      />
      <FloatingQuizCTA
        stackIndex={1}
        label={score === 0 ? '다시하기' : '오답노트 확인하기'}
        onClick={score === 0 ? onRetry : () => navigate('/study?tab=wrong')}
        gradient
      />
    </div>
  );
}