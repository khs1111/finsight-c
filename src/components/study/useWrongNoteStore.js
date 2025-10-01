import { useEffect, useState } from 'react';
import api from '../../api';

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
      // 1) fetch stats
      const s = await api.getWrongNoteStats?.();
      if (mounted && s) setStats(s);
      // 2) fetch items (optional pageable; for now full list)
      const listData = await api.getWrongNotes?.();
      if (mounted && listData && Array.isArray(listData.items)) {
        setWrongState(listData.items);
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
