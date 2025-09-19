import { useState } from 'react';

// In-memory wrong note (틀린문제) store
// Each item: { id, question, userAnswer, correctAnswer, explanation?, addedAt }
let wrongState = [
  { id: 'q1', category: '은행', question: 'PER가 의미하는 것은?', userAnswer: '주당 순이익 대비 배당', correctAnswer: '주가 / 주당순이익(EPS)', explanation: 'Price to Earnings Ratio = 현재 주가 / 주당순이익', addedAt: Date.now() - 86400000 },
  { id: 'q2', category: '은행', question: '채권 금리가 오르면 일반적으로 채권 가격은?', userAnswer: '같아진다', correctAnswer: '하락한다', explanation: '금리와 가격은 반비례 관계', addedAt: Date.now() - 3600000 }
];

const wrongListeners = new Set();

function setWrongState(updater) {
  const next = typeof updater === 'function' ? updater(wrongState) : updater;
  wrongState = next;
  wrongListeners.forEach(l => l(wrongState));
}

export function useWrongNoteStore() {
  const [local, setLocal] = useState(wrongState);
  if (!wrongListeners.has(setLocal)) wrongListeners.add(setLocal);

  const add = (item) => {
    setWrongState(prev => [{ id: Date.now().toString(), addedAt: Date.now(), category: item.category || '기타', ...item }, ...prev]);
  };
  const remove = (id) => {
    setWrongState(prev => prev.filter(i => i.id !== id));
  };
  const clear = () => setWrongState([]);

  return { wrongNotes: local, add, remove, clear };
}

export function _resetWrong(list) { setWrongState(list); }
