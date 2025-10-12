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

import {getQuestions as apiGetQuestions, postAttempt, getQuizIdForSelection, completeQuiz } from "../api/explore";
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
  const [level, setLevel] = useState(null);               // 레벨ID (실제 PK)
  const [levelNumber, setLevelNumber] = useState(null);   // 난이도 번호(1/2/3)
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
        onConfirm={async ({ levelId, levelNumber, levelName: lvName }) => {
          setLevel(levelId); // 실제 PK 저장
          setLevelNumber(levelNumber || null);
          setLevelName(lvName || null);
          try {
            console.log('🎯 [LevelPicker] 퀴즈 데이터 요청:', { topicId: mainTopicId, subTopicId, levelId });
            setIsFetchingQuestions(true);
            const qid = await getQuizIdForSelection({ subTopicId, levelId });
            const result = await apiGetQuestions({ quizId: qid, topicId: mainTopicId, subTopicId, levelId });
            console.log('📦 [LevelPicker] getQuestions 응답:', result);
            if (result && Array.isArray(result.questions) && result.questions.length) {
              console.log('[LevelPicker] 문제 배열 상세:', result.questions.map((q, i) => ({
                idx: i+1, id: q.id, type: q.type, sort_order: q.sort_order, stem: q.stem_md?.slice?.(0, 30)
              })));
              setQuestions(result.questions);
              setQuizId(result.quizId || null);
              setQid(0);
              setStep(3);
            } else {
              console.warn('⚠️ [LevelPicker] 퀴즈 데이터가 비어있거나 오류:', result?.error, result);
              alert(result?.error || '문제를 불러오지 못했습니다. 다른 조합을 선택해 주세요.');
            }
          } catch (err) {
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
        selectedLevel={levelName || levelNumber || level}
        initialTopic={mainTopic}
        initialSubTopic={subTopic}
        isLoading={isFetchingQuestions}
        onSelectionConfirm={async ({ level: newLevel, levelNumber: newLevelNumber, topic: newTopic, subTopic: newSub, topicId: newTopicId, subTopicId: newSubTopicId, levelId: resolvedLevelId }) => {
          setLevel(resolvedLevelId || newLevel);
          setLevelNumber(newLevelNumber || null);
          setLevelName(typeof newLevel === 'number' ? null : newLevel);
          setMainTopic(newTopic);
          setSubTopic(newSub);
          if (newTopicId != null) setMainTopicId(newTopicId);
          if (newSubTopicId != null) setSubTopicId(newSubTopicId);
          try {
            console.log('🎯 [ExploreMain] 퀴즈 데이터 재요청:', { topicId: newTopicId || mainTopicId, subTopicId: newSubTopicId || subTopicId, levelId: resolvedLevelId || newLevel });
            setIsFetchingQuestions(true);
            const qid2 = await getQuizIdForSelection({ subTopicId: newSubTopicId || subTopicId, levelId: resolvedLevelId || newLevel });
            const result = await apiGetQuestions({ quizId: qid2 });
            console.log('📦 [ExploreMain] getQuestions 응답:', result);
            if (result && Array.isArray(result.questions) && result.questions.length) {
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
        // 문제별 완료 상태를 ExploreMain에서 받아서 전달
        quizCompletionArr={(() => {
          // ExploreMain에서 내려주는 backendProgress.quizzes의 isCompleted를 활용
          if (window.__EXPLORE_MAIN_PROGRESS && Array.isArray(window.__EXPLORE_MAIN_PROGRESS.quizzes)) {
            return window.__EXPLORE_MAIN_PROGRESS.quizzes.map(q => !!q.isCompleted);
          }
          return Array.isArray(questions) ? questions.map(() => false) : [];
        })()}
        // [문제 선택] - 선택지 클릭 시 결과 갱신
        onSelect={(idx) => {
          const newResults = [...results];
          newResults[current] = { ...currentResult, selected: idx };
          setResults(newResults);
        }}
        // [정답 체크] - GET으로 받은 정답값으로 로컬 채점, POST는 기록 용도만
        onCheck={async () => {
          const qList = questions || [];
          const question = qList[current];
          const selectedIdx = currentResult.selected;
          if (!question || selectedIdx == null || selectedIdx < 0) return;

          const selectedOption = question.options?.[selectedIdx];
          // 서버 호환: 가능하면 숫자 ID로 전송, 아니면 원본/인덱스 기반 폴백 (기록 용도)
          const selIdRaw = selectedOption?.id;
          const selIdNum = Number(selIdRaw);
          const selectedOptionId = Number.isFinite(selIdNum) ? selIdNum : (selIdRaw ?? (selectedIdx + 1));

          // 1) 로컬 기준 정답 인덱스 계산: 옵션 isCorrect > correctOptionId 매칭
          const opts = question.options || [];
          let localCorrectIdx = opts.findIndex(o => o && o.isCorrect === true);
          if (localCorrectIdx < 0 && question?.correctOptionId != null) {
            const cidStr = String(question.correctOptionId);
            const byStr = opts.findIndex(o => String(o?.id) === cidStr);
            if (byStr >= 0) localCorrectIdx = byStr;
            else if (Number.isFinite(Number(cidStr))) {
              const cidNum = Number(cidStr);
              const byNum = opts.findIndex(o => Number(o?.id) === cidNum);
              if (byNum >= 0) localCorrectIdx = byNum;
            }
          }

          // 2) 백엔드 판정 우선: 서버 응답이 있으면 그 결과를 사용하고, 없으면 로컬 기준 사용
          let serverIsCorrect = null;
          let serverFeedback = null;
          let serverCorrectOptionId = null;
          try {
            const resp = await postAttempt({
              quizId: quizId ?? undefined,
              questionId: question.id,
              articleId: question.articleId || question.article_id || undefined,
              selectedOptionId,
              userId: localStorage.getItem('userId') || undefined,
              token: localStorage.getItem('accessToken') || undefined,
            });
            // 정상화된 응답 필드 사용 (api.submitAnswer가 isCorrect/feedback/correctOptionId로 반환)
            if (resp) {
              if (typeof resp.isCorrect === 'boolean') serverIsCorrect = resp.isCorrect;
              else if (typeof resp.is_correct === 'boolean') serverIsCorrect = resp.is_correct;
              serverFeedback = resp.feedback ?? resp.explanation ?? resp.message ?? null;
              serverCorrectOptionId = resp.correctOptionId ?? resp.correct_option_id ?? null;
            }
          } catch (e) {
            console.warn('⚠️ postAttempt 기록/채점 실패, 로컬 판정으로 진행:', e?.message || e);
          }

          // 3) 최종 정오 판정
          const localIsCorrect = Number.isInteger(localCorrectIdx) && localCorrectIdx >= 0 && selectedIdx === localCorrectIdx;
          const isCorrect = (serverIsCorrect === null ? localIsCorrect : serverIsCorrect);

          // 4) UI 상태/진행도 반영 (서버 피드백/정답ID 보존)
          const newResults = [...results];
          newResults[current] = {
            ...currentResult,
            checked: true,
            correct: isCorrect,
            serverCorrect: serverIsCorrect,
            serverCorrectOptionId,
            serverFeedback,
          };
          setResults(newResults);
          persistProgress(level, question, selectedOptionId, isCorrect, current);

          // 5) 오답노트 기록 (로컬/백엔드)
          if (!isCorrect) {
            try {
              const correctOpt = localCorrectIdx >= 0 ? opts[localCorrectIdx] : null;
              addWrongNoteImmediate({
                question,
                userAnswer: selectedOption?.text ?? String(selectedOptionId),
                correctAnswer: correctOpt?.text ?? null,
                category: question?.category || subTopic || mainTopic || '기타',
                meta: { quizId: quizId ?? undefined, questionId: question.id }
              });
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
        }}
        answerResult={currentResult}
        onComplete={async () => {
          // 퀴즈 완료 POST를 즉시 실행 (인증 포함)
          const userId = localStorage.getItem('userId') || undefined;
          const token = localStorage.getItem('accessToken') || undefined;
          try {
            const data = await completeQuiz(quizId, userId, token);
            setQuizCompleteResult(data);
          } catch (e) {
            setQuizCompleteResult({ error: e?.message || '퀴즈 완료 처리 실패' });
          }
          setStep(5);
        }}
        onBack={handleBack}
      />
    );
  }

  // [5단계] 완료 화면 (정답 개수/결과 표시, 재도전/탐험 재시작)
  // 퀴즈 완료 POST 결과 상태 추가
  const [quizCompleteResult, setQuizCompleteResult] = useState(null);
  useEffect(() => {
    if (step === 5 && quizId && !quizCompleteResult) {
      // 퀴즈 완료 POST (인증 포함)
      const userId = localStorage.getItem('userId') || undefined;
      const token = localStorage.getItem('accessToken') || undefined;
      completeQuiz(quizId, userId, token)
        .then(data => setQuizCompleteResult(data))
        .catch(e => setQuizCompleteResult({ error: e?.message || '퀴즈 완료 처리 실패' }));
    }
    if (step !== 5 && quizCompleteResult) {
      setQuizCompleteResult(null); // 단계 이동 시 초기화
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, quizId]);

  if (step === 5) {
    const questionList = questions && questions.length > 0 ? questions : [];
    const fixedResults = Array.from({ length: questionList.length }, (_, idx) =>
      results[idx] ? results[idx] : { selected: null, checked: false }
    );
    // 서버 결과 우선, 없으면 기존 로컬 계산
    const correctCount = quizCompleteResult && typeof quizCompleteResult.correctAnswers === 'number'
      ? quizCompleteResult.correctAnswers
      : fixedResults.filter((r, idx) => {
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
        completeResult={quizCompleteResult}
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
