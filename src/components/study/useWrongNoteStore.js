import { useEffect, useState } from 'react';
import {
  fetchWrongNoteStatistics,
  fetchWrongNotes
} from '../../api/community';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: local.length, byCategory: [] });
  if (!wrongListeners.has(setLocal)) wrongListeners.add(setLocal);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId') || undefined;
        // 1) stats
        const { data: statData } = await fetchWrongNoteStatistics(userId, token);
        if (mounted && statData) setStats(statData);
        // 2) list (first page)
        const { data: listResp } = await fetchWrongNotes({ userId, page: 0, size: 50, filter: 'all', token });
        const items = Array.isArray(listResp?.items) ? listResp.items : Array.isArray(listResp) ? listResp : [];
        if (mounted) {
          // Merge with existing local state (avoid losing locally added notes)
          setWrongState(prev => {
            const byId = new Map();
            const push = (arr) => arr.forEach(it => { const id = String(it.id ?? it.noteId ?? it.questionId ?? Math.random()); byId.set(id, { ...it, id }); });
            push(prev);
            push(items);
            // newest first
            return Array.from(byId.values()).sort((a,b) => (b.addedAt||0) - (a.addedAt||0));
          });
        }
      } catch (e) {
        if (mounted) setError(e?.message || '오답노트 불러오기 실패');
      }
      setLoading(false);
    })().catch(err => {
      if (mounted) { setError(err?.message || '오답노트 불러오기 실패'); setLoading(false); }
    });
    return () => { mounted = false; };
  }, []);

  // recalc stats on local change if API not provided
  useEffect(() => {
    // If API did not provide stats, derive from local list
    const noApiStats = !stats || !Array.isArray(stats.byCategory) || stats.total == null;
    if (noApiStats) {
      const totals = local.length;
      const byCategory = local.reduce((acc, cur) => {
        const key = cur.category || '기타';
        const found = acc.find(a => a.category === key);
        if (found) found.count += 1; else acc.push({ category: key, count: 1 });
        return acc;
      }, []);
      setStats({ total: totals, byCategory });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  const add = (item) => {
    setWrongState(prev => [{ id: Date.now().toString(), addedAt: Date.now(), category: item.category || '기타', ...item }, ...prev]);
  };
  const remove = (id) => {
    setWrongState(prev => prev.filter(i => i.id !== id));
  };
  const clear = () => setWrongState([]);

  return { wrongNotes: local, add, remove, clear, loading, error, stats };
}

export function _resetWrong(list) { setWrongState(list); }

// 외부에서 즉시 추가할 수 있는 헬퍼 (퀴즈 제출 시 오답 기록 등)
export function addWrongNoteImmediate({ question, userAnswer, correctAnswer, category, meta }) {
  const item = {
    question: question?.question || question?.stemMd || '',
    userAnswer,
    correctAnswer,
    category: category || question?.category || '기타',
    meta,
  };
  setWrongState(prev => [{ id: Date.now().toString(), addedAt: Date.now(), ...item }, ...prev]);
}
