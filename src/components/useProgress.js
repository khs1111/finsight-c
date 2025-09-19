// 진행도 관리 훅 (문제 리스트 진행/저장)
import { useEffect, useState } from "react";

// useProgress: 레벨(또는 세트)별 퀴즈 진행 상태(localStorage 저장 포함)
export default function useProgress(levelId, totalQuestions = 0) {
  // 서버에서 받아온 총 질문 수
  const [total, setTotal] = useState(totalQuestions);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // { qid, choice, correct }

  // totalQuestions 변경 시 total 업데이트
  useEffect(() => {
    setTotal(totalQuestions);
  }, [totalQuestions]);

  // 초기 로드: 저장된 진행 상태 복구
  useEffect(() => {
    const key = `explorer:${levelId}:progress`;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (saved) {
        setIndex(saved.index || 0);
        setAnswers(saved.answers || []);
      } else {
        setIndex(0);
        setAnswers([]);
      }
    } catch {
      setIndex(0);
      setAnswers([]);
    }
  }, [levelId]);

  // 상태 변경 시 저장
  useEffect(() => {
    const key = `explorer:${levelId}:progress`;
    try {
      localStorage.setItem(key, JSON.stringify({ index, answers }));
    } catch {}
  }, [levelId, index, answers]);

  // setAnswer: 사용자가 선택 시 정답 여부 계산 후 다음 인덱스로 이동
  const setAnswer = (questionId, choice, isCorrect) => {
    const next = [...answers, { qid: questionId, choice, correct: isCorrect }];
    setAnswers(next);
    const nextIndex = index + 1;
    setIndex(nextIndex);
    return nextIndex; // 다음 인덱스 반환 (완료 체크용)
  };

  // resetProgress: 진행 상태 초기화 및 저장소 제거
  const resetProgress = () => {
    setIndex(0);
    setAnswers([]);
    try {
      localStorage.removeItem(`explorer:${levelId}:progress`);
    } catch {}
  };

  return { total, index, answers, setAnswer, resetProgress };
}
