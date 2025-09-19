// 탐험 페이지 
import { useState, useEffect } from "react";
import TopicPicker from "../components/explore/TopicPicker";
import LevelPicker from "../components/explore/LevelPicker";
import ExploreMain from "../components/explore/ExploreMain";
import QuizQuestion from "../components/explore/QuizQuestion";
import CompletionScreen from "../components/explore/CompletionScreen";

import { getQuiz, getQuestions as apiGetQuestions } from "../api/explore";
import CategoryNav from "../components/news/CategoryNav";
import { useNavVisibility } from "../components/navigation/NavVisibilityContext";

export default function Explore() {
  const [step, setStep] = useState(1);
  const [mainTopic, setMainTopic] = useState(null);
  const [subTopic, setSubTopic] = useState(null);
  const [level, setLevel] = useState(null);
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
          setLevel(lv);
          try {
            // 새로운 백엔드 API 사용 (퀴즈 ID 1로 테스트)
            const result = await getQuiz(1);
            if (result.success) {
              setQuestions(result.data.questions || []);
            } else {
              console.error("퀴즈 불러오기 실패:", result.error);
              // 백엔드 연결 실패시 빈 배열
              setQuestions([]);
            }
          } catch (err) {
            console.error("문제 불러오기 실패:", err);
            // 백엔드 연결 실패시 빈 배열
            setQuestions([]);
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
    const currentResult = results[current] || { selected: null, checked: false };
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
          newResults[current] = { ...currentResult, checked: true };
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
