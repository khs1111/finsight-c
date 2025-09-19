import { useState } from 'react';

const LS_KEY = 'vocabWords';

// 기본 초기 단어
const defaultWords = [
  { id: 'w1', term: '장 초반', meaning: '주식 시장 개장 직후의 시간대 (보통 오전 9시~10시 사이)', bookmarked: false },
  { id: 'w2', term: '매수세', meaning: '주식을 사려는 흐름. 강할수록 주가 상승 가능성이 높음', bookmarked: true }
];

// 초기 로드: localStorage 있으면 사용, 오류/없으면 기본값
function loadInitial() {
  if (typeof window === 'undefined') return defaultWords;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return defaultWords;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultWords;
    // 최소 필드 검증
    return parsed.every(w => w && w.id && w.term) ? parsed : defaultWords;
  } catch (e) {
    return defaultWords;
  }
}

let wordState = loadInitial();

const listeners = new Set();

function persist(next) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_KEY, JSON.stringify(next));
    }
  } catch (e) {
    // 저장 실패는 무시
  }
}

function setWordState(updater) {
  const next = typeof updater === 'function' ? updater(wordState) : updater;
  wordState = next;
  persist(wordState);
  listeners.forEach(l => l(wordState));
}

export function useWordStore() {
  const [local, setLocal] = useState(wordState);
  if (!listeners.has(setLocal)) listeners.add(setLocal);

  const add = (term, meaning) => {
    setWordState(prev => [{ id: Date.now().toString(), term, meaning, bookmarked: false }, ...prev]);
  };
  const toggleBookmark = (id) => {
    setWordState(prev => prev.map(w => w.id === id ? { ...w, bookmarked: !w.bookmarked } : w));
  };
  const removeMany = (ids) => {
    setWordState(prev => prev.filter(w => !ids.includes(w.id)));
  };

  return { words: local, add, toggleBookmark, removeMany };
}

export function _resetWords(list) { 
  if (!Array.isArray(list)) return;
  setWordState(list);
}