//탐험지 화면
import { useState } from "react";
import TopicPicker from "../components/explore/TopicPicker";
import LevelPicker from "../components/explore/LevelPicker";
import ExploreMain from "../components/explore/ExploreMain";
import QuizQuestion from "../components/explore/QuizQuestion";
import CompletionScreen from "../components/explore/CompletionScreen";
import CategoryNav from "../components/news/CategoryNav";

export default function Explore() {
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState(null);
  const [level, setLevel] = useState(null);
  const [current, setQid] = useState(1); 
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  let content = null;

  //주제 선택
  if (step === 1) {
    content = (
      <TopicPicker
        onConfirm={(t) => {
          setTopic(t);
          setStep(2);
        }}
      />
    );
  }

  //난이도 선택 
  if (step === 2) {
    content = (
      <LevelPicker
        subTopic={topic}
        onConfirm={async (lv) => {
          setLevel(lv);
          try {
            const res = await fetch(
              `/api/questions?topic=${topic?.id}&level=${lv}`
            );
            if (!res.ok) throw new Error("API 요청 실패");
            const data = await res.json();
            setQuestions(data);
          } catch (err) {
            console.error("문제 불러오기 실패:", err);
            setQuestions([]);
          }
          setQid(1);
          setStep(3); 
        }}
        onBack={() => setStep(1)}
      />
    );
  }

  //탐험지 메인
  if (step === 3) {
    content = (
      <ExploreMain
        topic={topic}
        level={level}
        total={questions.length}
        done={current - 1}
        onStart={() => setStep(4)}
      />
    );
  }

  //문제 
  if (step === 4) {
    content = (
      <QuizQuestion
        current={current} 
        questions={questions}
        onComplete={(res) => {
          setResults(res);            
          setStep(5);                  
        }}
        onBack={() => {
  if (current > 1) {
    setQid(current + 1);    
  } else {
    setStep(3);
  }
}}
setQid={setQid} 
      />
    );
  }

  //완료 화면
  if (step === 5) {
  const correctCount = results.filter(Boolean).length;
  content = (
    <CompletionScreen
      score={correctCount}
      total={results.length}
      results={results}  
      onRetry={() => {
        setQid(1);
        setResults([]);
        setStep(4);
      }}
      onExplore={() => setStep(1)}
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
