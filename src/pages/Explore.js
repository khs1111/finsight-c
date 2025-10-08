// 탐험 페이지 
import { useState, useEffect } from "react";
import TopicPicker from "../components/explore/TopicPicker";
import LevelPicker from "../components/explore/LevelPicker";
import ExploreMain from "../components/explore/ExploreMain";
import QuizQuestion from "../components/explore/QuizQuestion";
import CompletionScreen from "../components/explore/CompletionScreen";

import { getQuizzes, getQuizzesBySubsector, fetchQuizNormalized, postAttempt } from "../api/explore";
import { addWrongNoteImmediate } from "../components/study/useWrongNoteStore";
import CategoryNav from "../components/news/CategoryNav";
import { useNavVisibility } from "../components/navigation/NavVisibilityContext";

export default function Explore() {
  const [step, setStep] = useState(1);
  const [mainTopic, setMainTopic] = useState(null);      // name
  const [subTopic, setSubTopic] = useState(null);        // name
  // Topic IDs not used in quizId-based flow
  const [level, setLevel] = useState(null); // 난이도 상태 추가
  const [current, setQid] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [results, setResults] = useState([]);
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);
  const { setHide } = useNavVisibility();

  // 퀴즈 진행도 저장용: useProgress 훅이 읽는 키와 동일한 스키마로 localStorage에 기록
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

  // 완료 시(5단계 진입) 오늘 날짜를 attendance에 기록(중복 방지)
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

  useEffect(() => {
    if (step === 4 || step === 5) setHide(true); else setHide(false);
    return () => setHide(false); 
  }, [step, setHide]);
  let content = null;

  if (step === 1) {
    content = (
      <TopicPicker
        onConfirm={(tName, subName/*, tId, sId*/ ) => {
          setMainTopic(tName);
          setSubTopic(subName);
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
            // getQuestions API 사용 (더미 데이터 제거)
            console.log('🎯 레벨별 퀴즈 목록 요청 중...');
            setIsFetchingQuestions(true);
            // README 설계: /subsectors/{subsectorId}/levels/{levelId}/quizzes 우선
            const list = await getQuizzesBySubsector(subTopic /* may be name */, lv).catch(() => getQuizzes(lv));
            const quizzes = Array.isArray(list) ? list : [];
            if (!quizzes.length) throw new Error('No quizzes for selected level');
            // 우선순위: NOT_STARTED → IN_PROGRESS → 그 외, 없으면 첫 번째
            const prioritized =
              quizzes.find(q => q.status === 'NOT_STARTED') ||
              quizzes.find(q => q.status === 'IN_PROGRESS') ||
              quizzes[0];
            const qid = prioritized?.id || prioritized?.quizId || quizzes[0]?.id;
            if (!qid) throw new Error('No quizId');
            const result = await fetchQuizNormalized(qid);
            if (result && result.questions && result.questions.length > 0) {
              console.log('✅ 퀴즈 로드 성공:', result.questions.length, '개 문제');
              setQuestions(result.questions);
              setQuizId(result.quizId || qid);
            } else {
              console.warn('⚠️ 퀴즈 데이터가 비어 있습니다.');
              setQuestions([]);
              setQuizId(qid);
            }
          } catch (err) {
            console.error("❌ 문제 불러오기 실패:", err);
            setQuestions([]);
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
            const list = await getQuizzesBySubsector(newSub, newLevel).catch(() => getQuizzes(newLevel));
            const quizzes = Array.isArray(list) ? list : [];
            if (!quizzes.length) throw new Error('No quizzes for selected level');
            const prioritized =
              quizzes.find(q => q.status === 'NOT_STARTED') ||
              quizzes.find(q => q.status === 'IN_PROGRESS') ||
              quizzes[0];
            const qid = prioritized?.id || prioritized?.quizId || quizzes[0]?.id;
            if (!qid) throw new Error('No quizId');
            const result = await fetchQuizNormalized(qid);
            if (result && Array.isArray(result.questions)) {
              setQuestions(result.questions);
              setQuizId(result.quizId || qid);
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
              articleId: question.articleId || question.article_id || undefined,
              selectedOptionId,
            });

            // 다양한 서버 응답 스키마 지원: id/index/text/letter
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

            // 서버 기준 정답을 옵션에 반영
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
            // 진행도 로컬 저장 (ExploreMain의 useProgress에서 읽어 반영)
            persistProgress(level, question, selectedOptionId, isCorrect, current);
            // 오답일 경우 즉시 오답노트에 기록 (로컬 + 백엔드)
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
                // 백엔드 오답 생성은 submit-answer 시점에 서버가 처리
                // 프론트에서는 별도 POST를 호출하지 않습니다.
              } catch (_) { /* ignore */ }
            }
          } catch (e) {
            console.warn('⚠️ 백엔드 채점 실패, 로컬 판정으로 폴백:', e);
            const correctOption = question.options?.find(o => o.isCorrect);
            const localCorrectIdx = correctOption ? question.options.indexOf(correctOption) : -1;
            const isCorrect = selectedIdx === localCorrectIdx;
            const newResults = [...results];
            newResults[current] = { ...currentResult, checked: true, correct: isCorrect };
            setResults(newResults);
            // 백엔드 실패 시에도 로컬 진행도 저장
            persistProgress(level, question, selectedOptionId, isCorrect, current);
            // 오답 로컬 기록 (백엔드 실패 케이스). 서버 POST는 호출하지 않음.
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
