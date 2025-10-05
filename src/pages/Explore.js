// 탐험 페이지 
import { useState, useEffect } from "react";
import TopicPicker from "../components/explore/TopicPicker";
import LevelPicker from "../components/explore/LevelPicker";
import ExploreMain from "../components/explore/ExploreMain";
import QuizQuestion from "../components/explore/QuizQuestion";
import CompletionScreen from "../components/explore/CompletionScreen";

import {getQuestions as apiGetQuestions } from "../api/explore";
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
  const [results, setResults] = useState([]);
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
            const result = await apiGetQuestions({ 
              topicId: mainTopic, 
              subTopic: subTopic,
              levelId: lv 
            });
            if (result && result.questions && result.questions.length > 0) {
              console.log('✅ 퀴즈 데이터 로드 성공:', result.questions.length, '개 문제');
              setQuestions(result.questions);
            } else {
              console.log('🔄 더미 퀴즈 데이터 사용');
              setQuestions(dummyQuizzes);
            }
          } catch (err) {
            console.error("❌ 문제 불러오기 실패:", err);
            console.log('🔄 더미 퀴즈 데이터로 폴백');
            setQuestions(dummyQuizzes);
          }
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
        onSelectionConfirm={async ({ level: newLevel, topic: newTopic, subTopic: newSub }) => {
          // 부모 상태 업데이트
          setLevel(newLevel);
          setMainTopic(newTopic);
          setSubTopic(newSub);
          // 질문 재조회
          try {
            const result = await apiGetQuestions({ topicId: newTopic, subTopic: newSub, levelId: newLevel });
            if (result && Array.isArray(result.questions)) {
              setQuestions(result.questions);
            }
          } catch (e) {
            console.warn('질문 재조회 실패:', e);
          }
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
        onCheck={() => {
          const newResults = [...results];
          // Determine correctness
          const question = questions[current];
          let correctIdx = -1;
          if (question && question.options) {
            const correctOption = question.options.find(option => option.isCorrect);
            correctIdx = correctOption ? question.options.indexOf(correctOption) : -1;
          }
          const isCorrect = currentResult.selected === correctIdx;
          newResults[current] = { ...currentResult, checked: true, correct: isCorrect };
          setResults(newResults);
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
    
    // 백엔드 구조에 맞게 정답 확인 로직 수정
    const correctCount = fixedResults.filter((r, idx) => {
      const question = questionList[idx];
      if (!question?.options) return false;
      const correctOption = question.options.find(option => option.isCorrect);
      const correctIdx = correctOption ? question.options.indexOf(correctOption) : -1;
      return r.selected === correctIdx;
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
