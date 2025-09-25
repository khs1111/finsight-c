/**
 * 🎯 퀴즈 문제 화면 컴포넌트
 * 
 * 📋 주요 기능:
 * - 문제 표시 (마크다운 형식 지원)
 * - 선택지 표시 및 선택 처리
 * - 답안 제출 및 채점 결과 표시
 * - 힌트 및 학습 모드 제공
 * - 진행도 관리 및 네비게이션
 * 
 * 🔗 백엔드 연동:
 * - getQuiz(): 퀴즈 데이터 조회
 * - submitAnswer(): 답안 제출 및 채점
 */
import React, { useState, useRef, useEffect } from "react";
import "./QuizQuestion.css";

import ProgressHeader from "./ProgressHeader";

/**
 * 🎯 QuizQuestion 컴포넌트
 * 
 * @param {number} current - 현재 문제 번호 (0부터 시작)
 * @param {function} setCurrent - 문제 번호 변경 함수
 * @param {Array} questions - 전체 문제 배열
 * @param {number} selected - 현재 선택된 답안 인덱스
 * @param {boolean} showResult - 채점 결과 표시 여부
 * @param {function} onSelect - 답안 선택 시 호출되는 함수
 * @param {function} onCheck - 답안 확인 버튼 클릭 시 호출되는 함수
 * @param {function} onComplete - 퀴즈 완료 시 호출되는 함수
 * @param {function} onBack - 뒤로가기 버튼 클릭 시 호출되는 함수
 */
export default function QuizQuestion({ current,
  setCurrent,
  questions,
  selected,
  showResult,
  onSelect,
  onCheck,
  onComplete,
  onBack}) {
  
  // 🎓 학습 모드 관련 상태
  const [showLearning, setShowLearning] = useState(false);        // 학습 모드 표시 여부
  const [showHint, setShowHint] = useState(false);               // 힌트 표시 여부
  const [learningText, setLearningText] = useState("");          // 학습 모드 텍스트


  // 📚 문제 데이터 처리
  const questionList = questions && questions.length > 0 ? questions : [];
  const question = questionList[current];
  
  // ✅ 정답 인덱스 계산 (백엔드에서 받은 isCorrect 필드 기반)
  const correctOption = question?.options?.find(option => option.isCorrect);
  const correctIdx = correctOption ? question.options.indexOf(correctOption) : -1;
  
  // 🎨 UI 관련 참조 및 상태
  const chalkTextRef = useRef(null);
  const [chalkLayout, setChalkLayout] = useState(null);
  
  /**
   * 📝 학습 텍스트 정규화 함수
   * 
   * 🔧 처리 내용:
   * - Windows CRLF를 LF로 변환
   * - 유니코드 라인 구분자 정규화
   * - 과도한 연속 공백 줄 축소
   * 
   * @param {string} text - 정규화할 텍스트
   * @returns {string} - 정규화된 텍스트
   */


  /**
   * 🎨 학습 콘텐츠 렌더링 함수
   * 
   * 📋 처리 과정:
   * 1. 고정 헤더 텍스트 추가
   * 2. 서버에서 받은 학습 내용 처리
   * 3. 칠판 스타일로 텍스트 포맷팅
   * 
   * @returns {JSX.Element} - 렌더링된 학습 콘텐츠
   */
  const renderLearningContent = () => {
    try {
      // 🎯 고정 헤더 텍스트
      const headerText = "🔍 먼저 핵심개념부터 잡고 갑시다.\n\n";
      
      // 📚 서버에서 받은 학습 내용 처리
      let mainContent = "";
      if (learningText && typeof learningText === 'string') {
        mainContent = learningText;
      } else if (learningText && Array.isArray(learningText)) {
        // 📚 배열 형태의 학습 내용을 문자열로 변환
        mainContent = learningText.join('\n');
      } else {
        // ⚠️ 백엔드에서 키포인트가 없을 경우 기본 메시지
        mainContent = "서버에서 학습 내용을 불러오는 중입니다...";
      }
      
      // 📝 전체 텍스트 합치기 (헤더 + 메인 콘텐츠)
      const fullText = headerText + mainContent;
      
      // 🔄 줄바꿈별로 분리하여 각 줄을 개별 처리
      const lines = fullText.split('\n');
      
      return lines.map((line, index) => {
        const trimmed = line?.trim() || "";
        
        // 📏 빈 줄 처리 - 적절한 간격 제공
        if (!trimmed) {
          return <div key={`empty-${index}`} style={{ height: '12px' }} />;
        }
        
        // 🎯 헤더 줄 (🔍로 시작하는 첫 줄) - 굵게 강조
        if (trimmed.startsWith('🔍')) {
          return (
            <div key={`header-${index}`} style={{ 
              fontWeight: 'bold', 
              fontSize: '16px', 
              marginBottom: '16px',
              color: '#FFFFFF'
            }}>
              {trimmed}
            </div>
          );
        }
        
        // • 불릿 포인트 (•로 시작) - 목록 형태로 표시
        if (trimmed.startsWith('•')) {
          return (
            <div key={`bullet-${index}`} style={{ 
              marginBottom: '12px',
              lineHeight: '1.5',
              paddingLeft: '8px',
              color: '#FFFFFF'
            }}>
              {trimmed}
            </div>
          );
        }
        
        // ➡️ 화살표 설명 (→로 시작) - 부연 설명 스타일
        if (trimmed.startsWith('→')) {
          return (
            <div key={`arrow-${index}`} style={{ 
              marginBottom: '12px',
              marginLeft: '16px',
              lineHeight: '1.5',
              color: '#E6F0FF'
            }}>
              {trimmed}
            </div>
          );
        }
        
        // 인용문 ("로 시작)
        if (trimmed.startsWith('"')) {
          return (
            <div key={`quote-${index}`} style={{ 
              marginBottom: '8px',
              marginLeft: '20px',
              fontStyle: 'italic',
              color: '#B3D9FF',
              lineHeight: '1.4'
            }}>
              {trimmed}
            </div>
          );
        }
        
        // 일반 텍스트
        return (
          <div key={`text-${index}`} style={{ 
            marginBottom: '8px',
            lineHeight: '1.5',
            color: '#FFFFFF'
          }}>
            {trimmed}
          </div>
        );
      });
    } catch (error) {
      console.error('renderLearningContent error:', error);
      return <div>학습 내용을 불러올 수 없습니다.</div>;
    }
  };

  // ===== 기사형 문제 전용 상태 =====
  const ARTICLE_IMG_MIN = 260; 
  const ARTICLE_IMG_MAX = 800; // 길어지는 것 제한 길이
  const [articleImgHeight, setArticleImgHeight] = useState(null);
  // 🖼️ 기사 이미지 관련 상태 및 참조
  const articleImgWrapperRef = useRef(null);
  const naturalSizeRef = useRef({ w: null, h: null });
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const q4Fallbacks = ['/assets/q4-article.png','/assets/q4-article.jpg','/assets/q4-article.jpeg','/assets/q4-article.webp','/assets/q4-article.svg'];
  const q4FallbackIndexRef = useRef(0);

  /**
   * 🖼️ 기사 이미지 로드 완료 처리 함수
   * 
   * 📐 처리 내용:
   * - 이미지 원본 크기 저장
   * - 컨테이너 너비에 맞춰 비율 계산
   * - 최소/최대 높이 제한 적용
   * 
   * @param {Event} e - 이미지 로드 이벤트
   */
  const handleArticleImgLoad = (e) => {
    try {
      // 📏 이미지 원본 크기 정보 저장
      const nw = e.target.naturalWidth || 0;
      const nh = e.target.naturalHeight || 0;
      naturalSizeRef.current = { w: nw, h: nh };
      
      // ⚠️ 컨테이너나 이미지 크기가 없으면 종료
      if (!articleImgWrapperRef.current || !nw || !nh) return;
      
      // 📐 컨테이너 너비에 맞춘 비율 계산
      const wrapW = articleImgWrapperRef.current.clientWidth; 
      const scaledH = nh * (wrapW / nw);
      
      // 🔒 최소/최대 높이 제한 적용
      const clamped = Math.max(ARTICLE_IMG_MIN, Math.min(ARTICLE_IMG_MAX, Math.round(scaledH)));
      setArticleImgHeight(clamped);
    } catch (err) {
      // 🚨 계산 실패 시 최소 높이 사용
      console.warn('이미지 크기 계산 실패:', err);
      setArticleImgHeight(ARTICLE_IMG_MIN);
    }
  };

  /**
   * 📱 창 크기 변경 시 이미지 높이 재계산 (반응형 처리)
   */
  useEffect(() => {
    const onResize = () => {
      const { w, h } = naturalSizeRef.current;
      
      // ⚠️ 이미지 크기 정보나 컨테이너가 없으면 종료
      if (!w || !h || !articleImgWrapperRef.current) return;
      
      // 📐 새로운 컨테이너 너비에 맞춰 재계산
      const wrapW = articleImgWrapperRef.current.clientWidth;
      const scaledH = h * (wrapW / w);
      const clamped = Math.max(ARTICLE_IMG_MIN, Math.min(ARTICLE_IMG_MAX, Math.round(scaledH)));
      setArticleImgHeight(clamped);
    };
    
    // 🔄 이벤트 리스너 등록 및 정리
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /**
   * 🔄 문제 변경 시 UI 상태 초기화 useEffect
   * 
   * 📋 초기화 항목:
   * - 학습 모드 상태
   * - 힌트 표시 상태
   * - 칠판 레이아웃
   * - 이미지 관련 상태
   * - 학습 텍스트 및 로딩 상태
   */
  useEffect(() => {
    // 🔄 UI 상태 전체 초기화
    setShowLearning(false);
    setShowHint(false);
    setChalkLayout(null);
    setImgError(false);
    setLearningText("");

    
    // 🖼️ 기사 이미지 타입의 경우 이미지 소스 설정 (Q4 폴백 지원)
    if (question?.type === 'articleImage') {
      const initial = question.image || null;
      q4FallbackIndexRef.current = 0;
      setImgSrc(initial || q4Fallbacks[0]);
    } else {
      setImgSrc(null);
    }
  }, [current]);

  // 학습하기가 열릴 때 백엔드에서 받은 퀴즈 데이터의 키포인트를 사용
  useEffect(() => {
    const q = question;
    if (!showLearning || !q) return;
    
    try {
      // 🔄 로딩 상태 시작

      // 문제 1번(인덱스 0)일 때 더미 텍스트 적용
      if (current === 0) {
        setLearningText("• 더미 문제 1번의 학습 칠판 텍스트입니다.\n• 핵심 개념을 여기에 입력하세요.\n→ 추가 설명이나 예시도 가능합니다.");
        return;
      }
      // 📚 백엔드에서 받은 퀴즈 데이터에서 학습 내용 추출 (우선순위 순)
      let text = "";
      if (q.solvingKeypointsMd) {
        // 🎯 1순위: 문제 해결 핵심 포인트
        text = q.solvingKeypointsMd;
      } else if (q.teachingExplainerMd) {
        // 📖 2순위: 교육용 설명 텍스트
        text = q.teachingExplainerMd;
      } else if (q.hintMd) {
        // 💡 3순위: 힌트 텍스트
        text = q.hintMd;
      } else {
        // ⚠️ 학습 내용이 없는 경우 기본 메시지
        text = "이 문제에 대한 학습 내용이 준비되지 않았습니다.";
      }
      // ✅ 추출된 학습 텍스트 설정
      setLearningText(text);
    } catch (e) {
      // 🚨 학습 내용 로드 실패 처리
      console.error('학습 내용 로드 실패:', e);
    }
  }, [showLearning, question]); // 학습 모드 토글 또는 문제 변경 시 실행

  /**
   * 📱 칠판 레이아웃 반응형 계산 useEffect
   * 
   * 📐 계산 항목:
   * - 텍스트 영역 높이
   * - 칠판 전체 높이
   * - 분필 라인 위치
   * - 칠판 배경 영역 크기
   */
  useEffect(() => {
    // ⚠️ 학습 모드가 아니거나 칠판 텍스트 참조가 없으면 종료
    if (!showLearning) return;
    if (!chalkTextRef.current) return;

    // 📏 칠판 레이아웃 상수 정의
  const TOP_PAD = 24;             // 상단 패딩
  const SIDE_PAD = 16;            // 좌우 패딩
  const CONTENT_GAP = 16;         // 콘텐츠 간격
  const CHALK_BAND_HEIGHT = 6;    // 분필 라인 높이
  const BOTTOM_BAR_HEIGHT = 19;   // 하단 바 높이
  const BOARD_OVERLAP = 6;        // 칠판 배경 오버랩
  const BOTTOM_EXTRA = 11;        // 분필 아래 칠판 끝까지 거리

    /**
     * 📐 칠판 크기 측정 및 레이아웃 계산 함수
     */
    const measure = () => {
      if (!chalkTextRef.current) return;
      
      // 📏 텍스트 영역의 실제 높이 측정
      const raw = chalkTextRef.current.scrollHeight;
      const textHeight = Math.max(0, raw - TOP_PAD); 

      // 📍 분필 라인 Y 위치 계산
      const chalkY = TOP_PAD + textHeight + CONTENT_GAP;
  // 🧮 전체 칠판 높이 계산 (분필 아래 11px 추가)
  // totalHeight 제거 (boardRectHeight만 사용)
      // 📏 칠판 배경 높이 계산 (분필 아래 11px 추가)
      const boardRectHeight = chalkY + CHALK_BAND_HEIGHT + BOARD_OVERLAP + BOTTOM_EXTRA;

      // 💾 계산된 레이아웃 정보 저장
      setChalkLayout({
        chalkY,
        boardRectHeight,
        constants: { TOP_PAD, SIDE_PAD, CONTENT_GAP, CHALK_BAND_HEIGHT, BOTTOM_BAR_HEIGHT, BOARD_OVERLAP, BOTTOM_EXTRA }
      });
    };

    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [showLearning, current, question?.id]);

  /**
   * 🎯 선택지 선택 처리 함수
   * 
   * 📋 처리 과정:
   * - 결과 표시 상태에서는 클릭 차단
   * - 정상 상태에서 선택지 인덱스 전달
   * 
   * @param {number} index - 선택된 선택지 인덱스
   */
  const handleSelect = (index) => {
    if (showResult) return;   // 채점 이후엔 클릭 못하게
    onSelect(index); 
  };

  /**
   * ➡️ 다음 문제로 이동 처리 함수
   * 
   * 📋 처리 과정:
   * - 문제 목록 내 다음 문제 확인
   * - 다음 문제가 있으면 current 증가
   * - 마지막 문제면 완료 처리
   */
  const handleNext = () => {
    if (current + 1 < questionList.length) {
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  };

  const containerRef = useRef(null);
  // 🔘 버튼 영역 관련 참조 및 상태
  const buttonRef = useRef(null);
  const [bottomPad, setBottomPad] = useState(200); // 초기 값 (첫 렌더 보호)

  /**
   * 📏 버튼 높이 기반 안전 패딩 동적 계산 useEffect
   * 
   * 📋 처리 내용:
   * - 하단 버튼 영역 높이 측정
   * - 콘텐츠와 버튼 간 안전 여백 계산
   * - 화면 크기 변경 시 재계산
   */
  useEffect(() => {
    const calc = () => {
      // ⚠️ 필요한 참조가 없으면 종료
      if (!containerRef.current || !buttonRef.current) return;
      
      // 📏 버튼 영역 실제 높이 측정
      const btnRect = buttonRef.current.getBoundingClientRect();
      const height = btnRect.height;
      const extra = 24; // 추가 여백
      
      // 💾 계산된 패딩 값 저장
      setBottomPad(height + extra);
    };
    
    // 🔄 초기 계산 및 리사이즈 이벤트 등록
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [showResult, selected]); // 결과 표시 상태나 선택 상태 변경 시 재계산

  /**
   * 📐 칠판 높이 개선된 계산 useEffect
   * 
   * 🔧 개선사항:
   * - 텍스트 렌더링 완료 후 높이 측정
   * - 최소 높이 보장
   * - 동적 여백 계산
   */
  useEffect(() => {
    if (showLearning && chalkTextRef.current) {
      const textElement = chalkTextRef.current;
      
      // ⏱️ 텍스트가 실제로 렌더링된 후 높이 측정 (10ms 지연)
      setTimeout(() => {
        const scrollHeight = textElement.scrollHeight;
        
        // 📏 최소 120px 보장, 텍스트 + 여백 40px 추가
        const computedHeight = Math.max(120, scrollHeight + 40);
        
        // 💾 칠판 레이아웃 업데이트
        setChalkLayout((prev) => ({
          ...prev,
          totalHeight: computedHeight,
          chalkY: computedHeight - (prev.constants.BOTTOM_BAR_HEIGHT + prev.constants.CHALK_BAND_HEIGHT + prev.constants.CONTENT_GAP),
          boardRectHeight: computedHeight - prev.constants.BOTTOM_BAR_HEIGHT,
        }));
      }, 10);
    }
  }, [showLearning, learningText]); // 학습 모드나 학습 텍스트 변경 시 실행

  /**
   * ⚠️ 문제 데이터 없음 상태 처리
   * 
   * 📋 표시 내용:
   * - 로딩 메시지
   * - 백엔드 연결 확인 안내
   * - 뒤로가기 버튼
   */
  if (!question) {
    return (
      <div className="quiz-question-header" style={{ textAlign: "center" }}>
        <h2>문제를 불러오는 중입니다...</h2>
        <p>백엔드 서버와 연결을 확인해주세요.</p>
        <button onClick={onBack} className="quiz-question-bottom-btn" style={{ width: "auto", padding: "10px 20px", borderRadius: 5, background: "#448FFF" }}>
          뒤로 가기
        </button>
      </div>
    );
  }

  /**
   * 🎨 메인 컴포넌트 렌더링
   * 
   * 📱 UI 구조:
   * - 전체 컨테이너 (반응형 스크롤)
   * - 문제 표시 영역
   * - 선택지 목록
   * - 하단 버튼 영역
   * - 학습 모드 오버레이
   */
  return (
    <div
      ref={containerRef}
      className="quiz-question-container"
      style={{ paddingBottom: bottomPad }}
    >
      {/* 상단 진행도 */}
     <ProgressHeader
      current={current + 1}
      total={questions?.length || 1}
      onBack={onBack}
 />
      {/* 문제 */}
      <div className="quiz-question-header">
        <h2 className="quiz-question-title">
          {question?.stemMd || question?.question || "문제를 불러오는 중입니다..."}
        </h2>

        {/* 문제와 기사 이미지 사이 안내 문구 (요청 사양) */}
        {question?.type === 'articleImage' && (
          <div className="quiz-question-article-guide">
            ( 6개월 이상 쓸 계획이 없는 1,000 만원 가진 경우)
          </div>
        )}

        {/* 기사 이미지 타입이면 제목 아래에 이미지(또는 플레이스홀더) */}
        {question.type === 'articleImage' && (
          <div ref={articleImgWrapperRef} className="quiz-question-article-img-wrapper">
            {imgSrc && !imgError ? (
              <img
                src={imgSrc}
                alt="기사 이미지"
                onLoad={handleArticleImgLoad}
                onError={() => {
                  if (question?.id === 4 && q4FallbackIndexRef.current < q4Fallbacks.length - 1) {
                    q4FallbackIndexRef.current += 1;
                    setImgSrc(q4Fallbacks[q4FallbackIndexRef.current]);
                  } else {
                    setImgError(true);
                  }
                }}
                className="quiz-question-article-img"
                style={{ height: articleImgHeight ? articleImgHeight : ARTICLE_IMG_MIN }}
              />
            ) : (
              <div className="quiz-question-article-img-placeholder" style={{ height: articleImgHeight ? articleImgHeight : ARTICLE_IMG_MIN }}>
                <span style={{ fontWeight:600 }}>기사 이미지 영역</span>
                {!imgError ? (
                  <span style={{ opacity:0.7, fontSize:12 }}>업로드 시 비율에 맞춰 최대 {ARTICLE_IMG_MAX}px 까지 확장</span>
                ) : (
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:12, color:'#9AA6B2' }}>이미지를 찾을 수 없습니다.</div>
                    <div style={{ fontSize:12, color:'#9AA6B2' }}>다음 중 하나의 파일을 추가하면 자동으로 표시됩니다:</div>
                    <div style={{ fontSize:12, color:'#4A6FB0', marginTop:4, lineHeight:'18px' }}>
                      public/assets/q4-article.png<br/>
                      public/assets/q4-article.jpg<br/>
                      public/assets/q4-article.jpeg<br/>
                      public/assets/q4-article.webp<br/>
                      public/assets/q4-article.svg
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {question?.options?.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrect = showResult && isSelected && idx === correctIdx;
          const isWrong = showResult && isSelected && idx !== correctIdx;
          let cardClass = "quiz-question-option-card";
          if (isCorrect) cardClass += " correct";
          else if (isWrong) cardClass += " wrong";
          else if (isSelected) cardClass += " selected";
          let badgeClass = "quiz-question-option-badge";
          if (isCorrect) badgeClass += " correct";
          else if (isWrong) badgeClass += " wrong";
          const badgeLetter = String.fromCharCode(65 + idx);
          return (
            <div
              key={idx}
              onClick={() => handleSelect(idx)}
              className={cardClass}
              style={{ cursor: showResult ? "not-allowed" : (selected === null ? "pointer" : "default") }}
            >
              <div className="quiz-question-option-row">
                <div className={badgeClass}>{badgeLetter}</div>
                <div className="quiz-question-option-text">
                  {opt.contentMd || opt.content || opt.text || opt}
                </div>
              </div>
            </div>
          );
        })}

        {/* 정답 해설*/}
        {showResult && selected === correctIdx && (
          <div className="quiz-question-explanation">
            <div className="quiz-question-explanation-header">
              <span className="quiz-question-explanation-label">정답</span>
              <div className="quiz-question-explanation-badge">
                <span className="quiz-question-explanation-badge-text">{String.fromCharCode(65 + correctIdx)}</span>
              </div>
            </div>
            <div className="quiz-question-explanation-text">
              {question.answerExplanationMd || question.explanation || "해설이 준비되지 않았습니다."}
            </div>
          </div>
        )}

  {!showResult && (
    <div style={{ marginTop: "16px" }}>
      <div
        onClick={() => setShowLearning(!showLearning)}
        className="quiz-question-learn-btn"
      >
        <span className="quiz-question-learn-btn-label">🏫 학습하기</span>
        {showLearning ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 16.7498C11.801 16.7508 11.6099 16.6715 11.47 16.5298L3.47003 8.52985C3.19467 8.23434 3.2028 7.77384 3.48841 7.48823C3.77402 7.20261 4.23452 7.19449 4.53003 7.46985L12 14.9398L19.47 7.46985C19.7655 7.19449 20.226 7.20261 20.5117 7.48823C20.7973 7.77384 20.8054 8.23434 20.53 8.52985L12.53 16.5298C12.3901 16.6715 12.1991 16.7508 12 16.7498Z" fill="black"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: "rotate(180deg)" }}><path d="M12 16.7498C11.801 16.7508 11.6099 16.6715 11.47 16.5298L3.47003 8.52985C3.19467 8.23434 3.2028 7.77384 3.48841 7.48823C3.77402 7.20261 4.23452 7.19449 4.53003 7.46985L12 14.9398L19.47 7.46985C19.7655 7.19449 20.226 7.20261 20.5117 7.48823C20.7973 7.77384 20.8054 8.23434 20.53 8.52985L12.53 16.5298C12.3901 16.6715 12.1991 16.7508 12 16.7498Z" fill="black"/></svg>
        )}
      </div>
      {showLearning && (
        <div className="quiz-question-learning-wrap">
          <div className="quiz-question-learning-svg-wrap">
            <div className="quiz-question-learning-svg-inner">
              <svg width="272" height="38" viewBox="0 0 272 38" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position:"absolute", inset:0 }}>
                <path d="M255.04 0C259.458 0.000105391 263.04 3.58179 263.04 8V25.6475C266.305 28.6428 269.633 31.6972 271.675 33.5654C272.356 34.1885 271.898 35.3493 270.976 35.3496H260.987C259.523 36.9765 257.401 37.9999 255.04 38H8C3.58173 38 3.22139e-08 34.4183 0 30V8C0 3.58172 3.58172 8.05699e-08 8 0H255.04Z" fill="#448FFF" />
              </svg>
              <div className="quiz-question-learning-svg-label">이 문제는 말 그대로 용어의 정의를 묻고 있어요!</div>
            </div>
            <div style={{ position:"absolute", right:0, top:-16, width:72, height:72, zIndex:5 }}> 
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ position:"absolute", inset:0, filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}>
                <rect width="72" height="72" fill="url(#pattern0_903_5350)" />
                <defs>
                  <pattern id="pattern0_903_5350" patternContentUnits="objectBoundingBox" width="1" height="1"><use xlinkHref="#image0_903_5350" transform="scale(0.00347222)" /></pattern>
                  <image id="image0_903_5350" width="288" height="288" preserveAspectRatio="none" xlinkHref="data:image/png;base64,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" />
                </defs>
              </svg>
            </div>
          </div>
          <div style={{ marginBottom:1 }} />
          <div className="quiz-question-learning-chalkboard-wrap">
            <div className="quiz-question-learning-chalkboard-inner" style={{ height: chalkLayout ? chalkLayout.boardRectHeight : 'auto' }}>
              <svg
                width={chalkLayout ? '100%' : 380}
                height={chalkLayout ? chalkLayout.boardRectHeight : 0}
                viewBox={`0 0 380 ${chalkLayout ? chalkLayout.boardRectHeight : 0}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position:'absolute', left:0, top:0, width:'100%', height:chalkLayout ? chalkLayout.boardRectHeight : 0, pointerEvents:'none', zIndex:0 }}
              >
                {chalkLayout && (() => {
                  const { chalkY, boardRectHeight, constants } = chalkLayout;
                  const { CHALK_BAND_HEIGHT, BOTTOM_BAR_HEIGHT } = constants;
                  return (
                    <g>
                      <rect x={8} y={0} width={364} height={boardRectHeight} rx={4} fill="#4B794C" />
                      <rect x={32} y={chalkY} width={72} height={CHALK_BAND_HEIGHT} rx={2} fill="white" />
                      <rect x={121} y={chalkY} width={72} height={CHALK_BAND_HEIGHT} rx={2} fill="#FF5959" />
                      <rect x={0} y={chalkY + CHALK_BAND_HEIGHT} width={380} height={BOTTOM_BAR_HEIGHT} rx={4} fill="#7D5F5F" />
                    </g>
                  );
                })()}
              </svg>
              <div
                ref={chalkTextRef}
                className="quiz-question-learning-chalkboard-text"
              >
                {renderLearningContent()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )}

  {/* 핵심 포인트 */}
  {!showResult && (
    <div className="quiz-question-point-wrap" style={{ marginTop: showLearning ? 16 : 24 }}>
      <div className="quiz-question-point-card">
        <div className="quiz-question-point-title">💡 핵심 포인트</div>
        {(() => {
          const hintContent = question?.hintMd || "힌트가 준비되지 않았습니다.";
          return (
            <div className="quiz-question-point-content">
              <div className="quiz-question-point-content-pre">{hintContent}</div>
            </div>
          );
        })()}
        {!showHint && (
          <div className="quiz-question-point-hint-blur">
            <button onClick={() => setShowHint(true)} className="quiz-question-point-hint-btn">
              <svg width="266" height="85" viewBox="0 0 266 85" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="266" height="85" rx="16" fill="white" fillOpacity="0.8" />
                <path d="M132 13.5098C134.023 13.5098 135.671 13.9835 136.971 14.8623C138.27 15.7397 139.104 16.9418 139.636 18.1992C140.325 19.8258 140.542 21.6457 140.612 23.1885H141.169C142.295 23.1886 143.207 24.1013 143.207 25.2266V37.4521C143.206 38.5773 142.295 39.4891 141.169 39.4893H122.831C121.706 39.489 120.794 38.5772 120.793 37.4521V25.2266C120.793 24.1014 121.705 23.1887 122.831 23.1885H123.375C123.449 21.3902 123.69 19.4337 124.47 17.7656C125.038 16.5524 125.902 15.4547 127.195 14.6758C128.478 13.9027 130.074 13.5098 132 13.5098ZM132 16.5664C130.487 16.5664 129.47 16.8733 128.772 17.2939C128.083 17.7088 127.594 18.3002 127.239 19.0605C126.707 20.1984 126.51 21.626 126.438 23.1885H137.55C137.485 21.8833 137.308 20.5396 136.822 19.3906C136.465 18.5472 135.964 17.87 135.26 17.3945C134.559 16.9206 133.537 16.5665 132 16.5664Z" fill="black" />
                <path d="M92.4815 59.598V61.026H86.2095V59.598H88.4355V58.422H90.2555V59.598H92.4815ZM88.2255 63.756C88.2255 64.386 88.6875 64.722 89.3735 64.722C90.0455 64.722 90.5075 64.386 90.5075 63.756C90.5075 63.126 90.0455 62.79 89.3735 62.79C88.6875 62.79 88.2255 63.126 88.2255 63.756ZM92.1455 63.756C92.1455 65.114 90.9975 66.066 89.3735 66.066C87.7355 66.066 86.5875 65.114 86.5875 63.756C86.5875 62.398 87.7355 61.446 89.3735 61.446C90.9975 61.446 92.1455 62.398 92.1455 63.756ZM88.3935 68.446V66.976H97.2695V71.218H95.4215V68.446H88.3935ZM95.5195 58.296H97.2695V66.374H95.5195V63.21H94.5675V66.318H92.8455V58.52H94.5675V61.726H95.5195V58.296ZM106.494 63.7L105.612 65.142C104.156 64.708 103.162 63.826 102.588 62.692C102 63.924 100.95 64.904 99.4384 65.38L98.5424 63.924C100.698 63.252 101.622 61.614 101.622 60.032V58.786H103.498V60.032C103.498 61.586 104.408 63.098 106.494 63.7ZM102.546 67.634V69.608H107.502V67.634H102.546ZM100.726 71.05V66.192H109.308V71.05H100.726ZM107.446 58.31H109.308V65.59H107.446V58.31ZM118.338 60.844V64.498H120.97V60.844H118.338ZM120.578 68.264H125.52V69.748H113.844V68.264H118.73V65.968H114.824V64.498H116.504V60.844H114.754V59.374H124.554V60.844H122.804V64.498H124.512V65.968H120.578V68.264ZM136.873 58.324V67.578H135.011V58.324H136.873ZM128.151 62.412C128.151 63.448 128.907 64.078 129.859 64.078C130.825 64.078 131.553 63.448 131.553 62.412C131.553 61.348 130.825 60.732 129.859 60.732C128.907 60.732 128.151 61.348 128.151 62.412ZM133.359 62.412C133.359 64.288 131.833 65.674 129.859 65.674C127.885 65.674 126.345 64.288 126.345 62.412C126.345 60.508 127.885 59.136 129.859 59.136C131.833 59.136 133.359 60.508 133.359 62.412ZM130.139 69.51H137.195V70.98H128.291V66.668H130.139V69.51ZM148.911 64.96V66.416H139.853V59.248H148.813V60.732H141.729V62.09H148.519V63.518H141.729V64.96H148.911ZM138.481 68.222H150.157V69.72H138.481V68.222ZM156.793 62.566V64.372H162.309V62.566H156.793ZM160.475 68.208H165.403V69.706H153.727V68.208H158.627V65.842H154.959V59.108H156.793V61.11H162.309V59.108H164.129V65.842H160.475V68.208ZM166.76 59.64H172.948C172.948 63.588 171.618 66.808 167.04 69.02L166.074 67.564C169.364 65.982 170.792 63.966 171.058 61.11H166.76V59.64ZM174.922 58.296H176.784V71.19H174.922V58.296Z" fill="black" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )}

    </div>

  <div style={{ height: 0 }} />

  {/* 하단 버튼 */}
      <div
        ref={buttonRef}
        className="quiz-question-bottom-btn-wrap"
      >
        <button
          disabled={selected === null}
          onClick={() => {
            if (!showResult) {
              onCheck();
            } else {
              handleNext();
            }
          }}
          className="quiz-question-bottom-btn"
        >
          {showResult ? "다음" : "채점하기"}
        </button>
      </div>
    </div>
  );
}
