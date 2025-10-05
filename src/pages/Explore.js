// 탐험 페이지 
import { useState, useEffect } from "react";
import TopicPicker from "../components/explore/TopicPicker";
import LevelPicker from "../components/explore/LevelPicker";
import ExploreMain from "../components/explore/ExploreMain";
import QuizQuestion from "../components/explore/QuizQuestion";
import CompletionScreen from "../components/explore/CompletionScreen";

import {getQuestions as apiGetQuestions, postAttempt } from "../api/explore";
import { dummyQuizzes } from "../utils/testData.js";
import CategoryNav from "../components/news/CategoryNav";
import { useNavVisibility } from "../components/navigation/NavVisibilityContext";

export default function Explore() {
  const [step, setStep] = useState(1);
  const [mainTopic, setMainTopic] = useState(null);
  const [subTopic, setSubTopic] = useState(null);
  const [level, setLevel] = useState(null); // 난이도 상태 추가
  const [current, setQid] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [results, setResults] = useState([]);
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);
  const { setHide } = useNavVisibility();

  useEffect(() => {
    if (step === 4 || step === 5) setHide(true); else setHide(false);
    return () => setHide(false); 
  }, [step, setHide]);
  let content = null;

  if (step === 1) {
    content = (
      <TopicPicker
        onConfirm={(t, sub) => {
          setMainTopic(t);
          setSubTopic(sub);
          setStep(2);
        }}
      />
    );
  }

  // 2단계: 난이도 선택 화면 
  if (step === 2) {
    content = (
      <LevelPicker
        mainTopic={mainTopic}
        subTopic={subTopic}
        onConfirm={async (lv) => {
          setLevel(lv); // 선택한 레벨 저장
          try {
            // getQuestions API 사용 (더미 데이터 우선)
            console.log('🎯 퀴즈 데이터 요청 중...');
            setIsFetchingQuestions(true);
            const result = await apiGetQuestions({ topicId: mainTopic, subTopic: subTopic, levelId: lv });
            if (result && result.questions && result.questions.length > 0) {
              console.log('✅ 퀴즈 데이터 로드 성공:', result.questions.length, '개 문제');
              setQuestions(result.questions);
              setQuizId(result.quizId || null);
            } else {
              console.log('🔄 더미 퀴즈 데이터 사용');
              setQuestions(dummyQuizzes);
              setQuizId(null);
            }
          } catch (err) {
            console.error("❌ 문제 불러오기 실패:", err);
            console.log('🔄 더미 퀴즈 데이터로 폴백');
            setQuestions(dummyQuizzes);
            setQuizId(null);
          } finally { setIsFetchingQuestions(false); }
          setQid(0);
          setStep(3);
        }}
        onBack={() => setStep(1)}
      />
    );
  }

  // 3단계: 탐험 메인 화면 렌더
  if (step === 3) {
    content = (
      <ExploreMain
        total={questions.length}
        done={current - 1}
        selectedLevel={level}
        initialTopic={mainTopic}
        initialSubTopic={subTopic}
        isLoading={isFetchingQuestions}
        onSelectionConfirm={async ({ level: newLevel, topic: newTopic, subTopic: newSub }) => {
          // 부모 상태 업데이트
          setLevel(newLevel);
          setMainTopic(newTopic);
          setSubTopic(newSub);
          // 질문 재조회
          try {
            setIsFetchingQuestions(true);
            const result = await apiGetQuestions({ topicId: newTopic, subTopic: newSub, levelId: newLevel });
            if (result && Array.isArray(result.questions)) {
              setQuestions(result.questions);
              setQuizId(result.quizId || null);
            }
          } catch (e) {
            console.warn('질문 재조회 실패:', e);
            setQuizId(null);
          } finally { setIsFetchingQuestions(false); }
          // 진행도/현재 인덱스 초기화
          setQid(0);
          setResults([]);
        }}
        onStart={() => setStep(4)}
      />
    );
  }

  // 4단계: 실제 문제 풀이 화면
  if (step === 4) {
    const handleBack = () => {
      if (current <= 0) setStep(3);
      else setQid(current - 1);
    };
    const currentResult = results[current] || { selected: null, checked: false, correct: null };
    content = (
      <QuizQuestion
        current={current}
        setCurrent={setQid}
        questions={questions}
        selected={currentResult.selected}
        showResult={currentResult.checked}
        onSelect={(idx) => {
          const newResults = [...results];
          newResults[current] = { ...currentResult, selected: idx };
          setResults(newResults);
        }}
        onCheck={async () => {
          const qList = questions || [];
          const question = qList[current];
          const selectedIdx = currentResult.selected;
          if (!question || selectedIdx == null || selectedIdx < 0) return;

          const selectedOption = question.options?.[selectedIdx];
          const selectedOptionId = selectedOption?.id ?? (selectedIdx + 1);

          let backendCorrectIdx = -1;
          try {
            const resp = await postAttempt({
              quizId: quizId ?? undefined,
              questionId: question.id,
              selectedOptionId,
            });

            // 다양한 서버 응답 스키마 지원: id/index/text/letter
            const opts = question.options || [];
            const toIdxById = (id) => opts.findIndex(o => String(o.id) === String(id));
            const toIdxByText = (txt) => opts.findIndex(o => String(o.text).trim() === String(txt).trim());
            const clamp = (n) => Math.max(0, Math.min(opts.length - 1, n));
            const asNum = (v) => {
              if (typeof v === 'number' && Number.isFinite(v)) return v;
              if (typeof v === 'string') { const n = parseInt(v, 10); return Number.isFinite(n) ? n : NaN; }
              return NaN;
            };

            const r = resp || {};
            const idCandidates = [r.correctOptionId, r.correct_option_id, r.answerId, r.answer_id];
            const idxCandidates = [r.correctIndex, r.correct_index, r.answerIndex, r.answer_index];
            const textCandidates = [r.correctAnswer, r.correct_answer, r.answerText];
            const letterCandidates = [r.correctOption, r.correct_option, r.correctLetter, r.correct_letter];

            // 1) ID 매칭
            for (const cid of idCandidates) {
              if (cid != null) { const i = toIdxById(cid); if (i >= 0) { backendCorrectIdx = i; break; } }
            }
            // 2) 인덱스(0/1-based) 매칭
            if (backendCorrectIdx < 0) {
              for (const c of idxCandidates) {
                const n = asNum(c);
                if (Number.isFinite(n)) {
                  if (n >= 0 && n < opts.length) { backendCorrectIdx = clamp(n); break; }
                  if (n >= 1 && n <= opts.length) { backendCorrectIdx = clamp(n - 1); break; }
                }
              }
            }
            // 3) 텍스트 매칭
            if (backendCorrectIdx < 0) {
              for (const t of textCandidates) {
                if (typeof t === 'string' && t.trim()) { const i = toIdxByText(t); if (i >= 0) { backendCorrectIdx = i; break; } }
              }
            }
            // 4) 레터(A/B/C/D) 매칭
            if (backendCorrectIdx < 0) {
              for (const L of letterCandidates) {
                if (typeof L === 'string' && L.trim()) {
                  const s = L.trim().toUpperCase();
                  if (/^[A-Z]$/.test(s)) { backendCorrectIdx = clamp(s.charCodeAt(0) - 'A'.charCodeAt(0)); break; }
                  const n = asNum(s);
                  if (Number.isFinite(n)) {
                    if (n >= 1 && n <= opts.length) { backendCorrectIdx = clamp(n - 1); break; }
                    if (n >= 0 && n < opts.length) { backendCorrectIdx = clamp(n); break; }
                  }
                }
              }
            }

            // 서버 기준 정답을 옵션에 반영
            if (opts.length && backendCorrectIdx >= 0) {
              const updatedOptions = opts.map((o, i) => ({ ...o, isCorrect: i === backendCorrectIdx }));
              const updatedQuestions = qList.slice();
              updatedQuestions[current] = { ...question, options: updatedOptions };
              setQuestions(updatedQuestions);
            }

            const finalCorrectIdx = backendCorrectIdx >= 0
              ? backendCorrectIdx
              : (opts.findIndex(o => o.isCorrect));
            const isCorrect = Number.isInteger(selectedIdx) && selectedIdx === finalCorrectIdx
              ? true
              : Boolean(r?.correct);

            const newResults = [...results];
            newResults[current] = { ...currentResult, checked: true, correct: isCorrect };
            setResults(newResults);
          } catch (e) {
            console.warn('⚠️ 백엔드 채점 실패, 로컬 판정으로 폴백:', e);
            const correctOption = question.options?.find(o => o.isCorrect);
            const localCorrectIdx = correctOption ? question.options.indexOf(correctOption) : -1;
            const isCorrect = selectedIdx === localCorrectIdx;
            const newResults = [...results];
            newResults[current] = { ...currentResult, checked: true, correct: isCorrect };
            setResults(newResults);
          }
        }}
        onComplete={() => setStep(5)}
        onBack={handleBack}
      />
    );
  }

  // 5단계: 완료
  if (step === 5) {
    const questionList = questions && questions.length > 0 ? questions : [];
    const fixedResults = Array.from({ length: questionList.length }, (_, idx) =>
      results[idx] ? results[idx] : { selected: null, checked: false }
    );
    
    // 결과 계산: 백엔드 판정 우선, 없으면 옵션의 isCorrect 사용
    const correctCount = fixedResults.filter((r, idx) => {
      if (r && r.checked && typeof r.correct === 'boolean') return r.correct;
      const question = questionList[idx];
      const correctOption = question?.options?.find(o => o.isCorrect);
      const correctIdx = correctOption ? question.options.indexOf(correctOption) : -1;
      return r?.selected === correctIdx;
    }).length;
    
    content = (
      <CompletionScreen
        score={correctCount}
        total={questionList.length}
        results={fixedResults}
        questions={questionList}
        onRetry={() => {
          setQid(0);
          setResults(
            Array.from({ length: questionList.length }, () => ({
              selected: null,
              checked: false,
            }))
          );
          setStep(4);
        }}
        onExplore={() => {
          setQid(0);
          setResults([]);
          setStep(3);
        }}
      />
    );
  }

  return (
    <>
      {content}
      {(step === 1 || step === 2 || step === 3) && <CategoryNav />}
    </>
  );
}
