// src/components/useProgress.js
import { useEffect, useMemo, useState } from "react";
import { QUESTIONS } from "./exploreData";

export default function useProgress(levelId) {
  const total = QUESTIONS[levelId].length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // { qid, choice, correct }

  // 로드
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

  // 저장
  useEffect(() => {
    const key = `explorer:${levelId}:progress`;
    try {
      localStorage.setItem(key, JSON.stringify({ index, answers }));
    } catch {}
  }, [levelId, index, answers]);

  const currentQ = useMemo(() => QUESTIONS[levelId][index], [levelId, index]);

  const setAnswer = (choice) => {
    const q = QUESTIONS[levelId][index];
    const correct = choice === q.answer;
    const next = [...answers, { qid: q.id, choice, correct }];
    setAnswers(next);
    const nextIndex = index + 1;
    setIndex(nextIndex);
    return nextIndex; // 다음 인덱스 반환 (완료 체크용)
  };

  const resetProgress = () => {
    setIndex(0);
    setAnswers([]);
    try {
      localStorage.removeItem(`explorer:${levelId}:progress`);
    } catch {}
  };

  return { total, index, currentQ, answers, setAnswer, resetProgress };
}
