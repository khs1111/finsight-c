// 탐험 페이지 

// [탐험 페이지] - README 명세 기반 전체 학습 흐름 구현
// 1. 주제/서브주제/레벨 선택 → 2. 퀴즈/문제 fetch (API 명세대로) → 3. 문제 풀이/정답 체크 → 4. 결과/진행도 저장
// 모든 fetch는 /api/levels/{levelId}/quizzes → /api/quizzes/{quizId} 순서로만 동작하며, fallback/더미/임의 대체 없음
// fetch 결과/에러는 모두 console.log로 남기고, 문제/퀴즈가 없으면 명확한 안내 메시지 출력

import { useState, useEffect } from "react";
import TopicPicker from "../components/explore/TopicPicker";
import LevelPicker from "../components/explore/LevelPicker";
import ExploreMain from "../components/explore/ExploreMain";
import QuizQuestion from "../components/explore/QuizQuestion";
import CompletionScreen from "../components/explore/CompletionScreen";

import {getQuestions as apiGetQuestions, postAttempt } from "../api/explore";
import { createWrongNote } from "../api/community";
import { addWrongNoteImmediate } from "../components/study/useWrongNoteStore";
import CategoryNav from "../components/news/CategoryNav";
import { useNavVisibility } from "../components/navigation/NavVisibilityContext";


export default function Explore() {
  // [화면 단계] 1: 주제선택, 2: 난이도선택, 3: 탐험메인, 4: 문제풀이, 5: 완료
  const [step, setStep] = useState(1);
  // [주제/서브주제/레벨] - 이름/ID 모두 관리 (API 호출 및 화면 표시용)
  const [mainTopic, setMainTopic] = useState(null);       // 주제명
  // eslint-disable-next-line no-unused-vars
  const [mainTopicId, setMainTopicId] = useState(null);   // 주제ID
  const [subTopic, setSubTopic] = useState(null);         // 서브주제명
  // eslint-disable-next-line no-unused-vars
  const [subTopicId, setSubTopicId] = useState(null);     // 서브주제ID
  const [level, setLevel] = useState(null);               // 레벨ID (숫자)
  const [levelName, setLevelName] = useState(null);       // 레벨명(표시용)
  // [문제 풀이 진행] - 현재 문제 인덱스, 문제 배열, 퀴즈ID, 정답 결과, 로딩상태
  const [current, setQid] = useState(0);
  const [questions, setQuestions] = useState([]);         // API에서 받아온 문제 배열 (README 명세대로)
  const [quizId, setQuizId] = useState(null);
  const [results, setResults] = useState([]);
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);
  const { setHide } = useNavVisibility();

  // [진행도 저장] - useProgress 훅과 동일한 스키마로 localStorage에 기록 (문제별 선택/정답 여부 저장)
  const persistProgress = (lvl, question, selectedOptionId, isCorrect, currentIndex) => {
    try {
      const key = `explorer:${lvl || 'default'}:progress`;
      const saved = JSON.parse(localStorage.getItem(key) || 'null') || { index: 0, answers: [] };
      const answers = Array.isArray(saved.answers) ? saved.answers.slice() : [];
      // 동일 qid가 이미 있으면 덮어쓰기, 없으면 추가
      const qid = question?.id ?? `${Date.now()}`;
      const existingIdx = answers.findIndex(a => String(a.qid) === String(qid));
      const record = { qid, choice: selectedOptionId, correct: !!isCorrect };
      if (existingIdx >= 0) answers[existingIdx] = record; else answers.push(record);
      const idx = Math.max(saved.index || 0, (Number.isFinite(currentIndex) ? currentIndex : 0) + 1);
      localStorage.setItem(key, JSON.stringify({ index: idx, answers }));
    } catch (_) { /* noop */ }
  };

  // [출석 기록] - 5단계(완료) 진입 시 오늘 날짜를 attendance에 기록 (중복 방지)
  useEffect(() => {
    if (step === 5) {
      const today = new Date();
      const z = (n) => (n < 10 ? `0${n}` : `${n}`);
      const key = `${today.getFullYear()}-${z(today.getMonth() + 1)}-${z(today.getDate())}`;
      try {
        const arr = JSON.parse(localStorage.getItem('attendance') || '[]');
        if (!arr.includes(key)) {
          arr.push(key);
          localStorage.setItem('attendance', JSON.stringify(arr));
        }
      } catch (_) { /* noop */ }
    }
  }, [step]);

  // [탐험/문제풀이 단계]에서는 하단 네비게이션 숨김 처리
  useEffect(() => {
    if (step === 4 || step === 5) setHide(true); else setHide(false);
    return () => setHide(false); 
  }, [step, setHide]);
  let content = null;

  // [1단계] 주제/서브주제 선택 화면
  if (step === 1) {
    content = (
      <TopicPicker
        onConfirm={(payload) => {
          // payload: { topicId, topicName, subTopicId, subTopicName }
          setMainTopic(payload?.topicName || null);
          setMainTopicId(payload?.topicId || null);
          setSubTopic(payload?.subTopicName || null);
          setSubTopicId(payload?.subTopicId || null);
          setStep(2); // 2단계(난이도 선택)로 이동
        }}
      />
    );
  }

  // [2단계] 난이도(레벨) 선택 화면
  if (step === 2) {
    content = (
      <LevelPicker
        mainTopic={mainTopic}
        subTopic={subTopic}
        onConfirm={async ({ levelId, levelName: lvName }) => {
          // [레벨ID 보정] 1,2,3 이외 값이면 1로 강제 (README 명세)
          let safeLevelId = Number(levelId);
          if (![1,2,3].includes(safeLevelId)) {
            console.warn('[LevelPicker] 잘못된 levelId 감지, 1로 보정:', levelId);
            safeLevelId = 1;
          }
          setLevel(safeLevelId);
          setLevelName(lvName || null);
          try {
            // [API 호출] /api/levels/{levelId}/quizzes → /api/quizzes/{quizId} 순서로만 문제 fetch
            console.log('🎯 [LevelPicker] 퀴즈 데이터 요청:', { topicId: mainTopicId, subTopicId, levelId: safeLevelId });
            setIsFetchingQuestions(true);
            const result = await apiGetQuestions({
              topicId: mainTopicId,
              subTopicId: subTopicId,
              levelId: safeLevelId
            });
            // [API 응답] 문제 배열/에러 모두 console.log로 출력
            console.log('📦 [LevelPicker] getQuestions 응답:', result);
            if (result && Array.isArray(result.questions) && result.questions.length) {
              // [문제 배열 상세 출력] type/sort_order/제목 등 한눈에 보기
              console.log('[LevelPicker] 문제 배열 상세:', result.questions.map((q, i) => ({
                idx: i+1, id: q.id, type: q.type, sort_order: q.sort_order, stem: q.stem_md?.slice?.(0, 30)
              })));
              setQuestions(result.questions);
              setQuizId(result.quizId || null);
              setQid(0);
              setStep(3); // 3단계(탐험메인)로 이동
            } else {
              // [에러/빈 배열] 명확한 안내 메시지 및 콘솔 출력
              console.warn('⚠️ [LevelPicker] 퀴즈 데이터가 비어있거나 오류:', result?.error, result);
              alert(result?.error || '문제를 불러오지 못했습니다. 다른 조합을 선택해 주세요.');
            }
          } catch (err) {
            // [API 에러] 콘솔 출력 및 안내
            console.error('❌ [LevelPicker] 문제 불러오기 실패:', err);
            alert('문제를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.');
          } finally {
            setIsFetchingQuestions(false);
          }
        }}
        onBack={() => setStep(1)}
      />
    );
  }

  // [3단계] 탐험 메인 화면 (진행도/레벨/주제 표시, 문제 재선택 등)
  if (step === 3) {
    content = (
      <ExploreMain
        total={questions.length}
        done={current - 1}
        selectedLevel={levelName || level}
        initialTopic={mainTopic}
        initialSubTopic={subTopic}
        isLoading={isFetchingQuestions}
        onSelectionConfirm={async ({ level: newLevel, topic: newTopic, subTopic: newSub, topicId: newTopicId, subTopicId: newSubTopicId, levelId: resolvedLevelId }) => {
          // [문제 재선택/레벨 변경] 시에도 동일하게 API 호출 및 문제 배열 저장
          setLevel(newLevel);
          setLevelName(typeof newLevel === 'number' ? null : newLevel);
          setMainTopic(newTopic);
          setSubTopic(newSub);
          if (newTopicId != null) setMainTopicId(newTopicId);
          if (newSubTopicId != null) setSubTopicId(newSubTopicId);
          try {
            console.log('🎯 [ExploreMain] 퀴즈 데이터 재요청:', { topicId: newTopicId || mainTopicId, subTopicId: newSubTopicId || subTopicId, levelId: resolvedLevelId || newLevel });
            setIsFetchingQuestions(true);
            const result = await apiGetQuestions({ levelId: resolvedLevelId || newLevel, subTopicId: newSubTopicId || subTopicId, topicId: newTopicId || mainTopicId });
            console.log('📦 [ExploreMain] getQuestions 응답:', result);
            if (result && Array.isArray(result.questions) && result.questions.length) {
              // [문제 배열 상세 출력] type/sort_order/제목 등 한눈에 보기
              console.log('[ExploreMain] 문제 배열 상세:', result.questions.map((q, i) => ({
                idx: i+1, id: q.id, type: q.type, sort_order: q.sort_order, stem: q.stem_md?.slice?.(0, 30)
              })));
              setQuestions(result.questions);
              setQuizId(result.quizId || null);
              setQid(0);
              setResults([]);
            } else {
              console.warn('⚠️ [ExploreMain] 질문 재조회 실패/빈 결과:', result?.error, result);
              alert(result?.error || '문제가 없습니다. 다른 조합을 선택해 주세요.');
            }
          } catch (e) {
            console.warn('❌ [ExploreMain] 질문 재조회 실패:', e);
            alert('문제 재조회 실패. 다시 시도해주세요.');
          } finally { setIsFetchingQuestions(false); }
        }}
        onStart={() => setStep(4)}
      />
    );
  }

  // [4단계] 실제 문제 풀이 화면 (questions 배열을 순서대로 QuizQuestion에 전달)
  if (step === 4) {
    // [문제풀이 단계] - questions 배열을 current 인덱스 기준으로 QuizQuestion에 전달
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
        // [문제 선택] - 선택지 클릭 시 결과 갱신
        onSelect={(idx) => {
          const newResults = [...results];
          newResults[current] = { ...currentResult, selected: idx };
          setResults(newResults);
        }}
        // [정답 체크] - postAttempt로 서버 채점, 결과/진행도/오답노트 반영
        onCheck={async () => {
          const qList = questions || [];
          const question = qList[current];
          const selectedIdx = currentResult.selected;
          if (!question || selectedIdx == null || selectedIdx < 0) return;

          const selectedOption = question.options?.[selectedIdx];
          const selectedOptionId = selectedOption?.id ?? (selectedIdx + 1);

          let backendCorrectIdx = -1;
          try {
            // [정답 채점] - postAttempt API 호출 (README 명세)
            const resp = await postAttempt({
              quizId: quizId ?? undefined,
              questionId: question.id,
              articleId: question.articleId || question.article_id || undefined,
              selectedOptionId,
              userId: localStorage.getItem('userId') || undefined,
              token: localStorage.getItem('accessToken') || undefined,
            });

            // [서버 응답 파싱] - 다양한 스키마 지원 (id/index/text/letter)
            const opts = question.options || [];
            // 중첩 응답 평탄화: { data: {...} } 또는 { result: {...} }
            const flatten = (r) => {
              if (!r || typeof r !== 'object') return {};
              const a = r.data && typeof r.data === 'object' ? r.data : {};
              const b = r.result && typeof r.result === 'object' ? r.result : {};
              return { ...r, ...a, ...b };
            };
            const toIdxById = (id) => opts.findIndex(o => String(o.id) === String(id));
            const toIdxByText = (txt) => opts.findIndex(o => String(o.text).trim() === String(txt).trim());
            const clamp = (n) => Math.max(0, Math.min(opts.length - 1, n));
            const asNum = (v) => {
              if (typeof v === 'number' && Number.isFinite(v)) return v;
              if (typeof v === 'string') { const n = parseInt(v, 10); return Number.isFinite(n) ? n : NaN; }
              return NaN;
            };

            const r = flatten(resp || {});
            // 진단 로그: 백엔드 응답 주요 키 요약
            try { console.log('📥 postAttempt 응답 키:', Object.keys(r)); } catch (_) {}
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

            // [정답 옵션 반영] - 서버 기준 정답을 옵션에 반영
            if (opts.length && backendCorrectIdx >= 0) {
              const updatedOptions = opts.map((o, i) => ({ ...o, isCorrect: i === backendCorrectIdx }));
              const updatedQuestions = qList.slice();
              updatedQuestions[current] = { ...question, options: updatedOptions };
              setQuestions(updatedQuestions);
            }

            const localIdx = opts.findIndex(o => o.isCorrect);
            const finalCorrectIdx = backendCorrectIdx >= 0 ? backendCorrectIdx : localIdx;
            // 우선순위: 백엔드 인덱스 > 로컬 isCorrect > r.correct(boolean)
            let isCorrect = false;
            if (Number.isInteger(finalCorrectIdx) && finalCorrectIdx >= 0) {
              isCorrect = (Number.isInteger(selectedIdx) && selectedIdx === finalCorrectIdx);
            } else if (typeof r?.correct === 'boolean') {
              isCorrect = r.correct;
            }

            const newResults = [...results];
            newResults[current] = { ...currentResult, checked: true, correct: isCorrect };
            setResults(newResults);
            // [진행도 저장] - 로컬에도 반영 (ExploreMain의 useProgress에서 읽어 반영)
            persistProgress(level, question, selectedOptionId, isCorrect, current);
            // [오답노트 기록] - 오답일 경우 즉시 로컬+백엔드 기록
            if (!isCorrect) {
              try {
                // 로컬 즉시 반영
                const correctOpt = (opts && opts.length) ? opts[backendCorrectIdx >= 0 ? backendCorrectIdx : opts.findIndex(o=>o.isCorrect)] : null;
                addWrongNoteImmediate({
                  question,
                  userAnswer: selectedOption?.text ?? String(selectedOptionId),
                  correctAnswer: correctOpt?.text ?? null,
                  category: question?.category || subTopic || mainTopic || '기타',
                  meta: { quizId: quizId ?? undefined, questionId: question.id }
                });
                // 백엔드 저장 시도
                const token = localStorage.getItem('accessToken');
                const userId = localStorage.getItem('userId') || undefined;
                await createWrongNote({
                  userId,
                  quizId: quizId ?? undefined,
                  questionId: question.id,
                  selectedOptionId,
                  correctOptionId: correctOpt?.id ?? undefined,
                  category: question?.category || undefined,
                  meta: { topic: mainTopic, subTopic }
                }, token);
              } catch (_) { /* ignore */ }
            }
          } catch (e) {
            // [백엔드 채점 실패] - 로컬 판정으로 폴백
            console.warn('⚠️ 백엔드 채점 실패, 로컬 판정으로 폴백:', e);
            const correctOption = question.options?.find(o => o.isCorrect);
            const localCorrectIdx = correctOption ? question.options.indexOf(correctOption) : -1;
            const isCorrect = selectedIdx === localCorrectIdx;
            const newResults = [...results];
            newResults[current] = { ...currentResult, checked: true, correct: isCorrect };
            setResults(newResults);
            // 백엔드 실패 시에도 로컬 진행도 저장
            persistProgress(level, question, selectedOptionId, isCorrect, current);
            // 오답 로컬 기록 (백엔드 실패 케이스)
            if (!isCorrect) {
              try {
                const correctOption = question.options?.find(o => o.isCorrect);
                addWrongNoteImmediate({
                  question,
                  userAnswer: selectedOption?.text ?? String(selectedOptionId),
                  correctAnswer: correctOption?.text ?? null,
                  category: question?.category || subTopic || mainTopic || '기타',
                  meta: { quizId: quizId ?? undefined, questionId: question.id }
                });
              } catch (_) { /* ignore */ }
            }
          }
        }}
        onComplete={() => setStep(5)}
        onBack={handleBack}
      />
    );
  }

  // [5단계] 완료 화면 (정답 개수/결과 표시, 재도전/탐험 재시작)
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

  // [화면 렌더] - 단계별 content + 하단 카테고리 네비게이션(1~3단계)
  return (
    <>
      {content}
      {(step === 1 || step === 2 || step === 3) && <CategoryNav />}
    </>
  );
}
