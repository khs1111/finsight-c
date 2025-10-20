import { useEffect, useState } from 'react';
import { getWrongNotes } from '../../api/explore';

// In-memory wrong note (틀린문제) store
// Each item: { id, question, userAnswer, correctAnswer, explanation?, addedAt }
// Start empty; populate from server and/or immediate adds.
let wrongState = [];

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
  // const token = localStorage.getItem('accessToken'); // 미사용 변수 삭제
        const userId = localStorage.getItem('userId') || undefined;
        // 새 API 구조에 맞게 파싱
  const listResp = await getWrongNotes(userId, 0, 50, 'all');
  console.log('[오답노트 API 응답]', listResp);
  const items = Array.isArray(listResp?.wrongNotes) ? listResp.wrongNotes : [];
  const statData = listResp?.statistics;
  const subsectorStatistics = Array.isArray(listResp?.subsectorStatistics) ? listResp.subsectorStatistics : undefined;
  const levelStatistics = Array.isArray(listResp?.levelStatistics) ? listResp.levelStatistics : undefined;
  console.log('[오답노트 subsectorStatistics]', subsectorStatistics);
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
          // Only use API response for stats, never overwrite with fallback if API gave any stats
          if (statData || subsectorStatistics || levelStatistics) {
            setStats({
              statistics: statData ?? { totalCount: items.length },
              subsectorStatistics: subsectorStatistics ?? [],
              levelStatistics: levelStatistics ?? [],
              wrongNotes: items,
            });
            console.log('[오답노트 setStats.subsectorStatistics]', subsectorStatistics);
          } else {
            // Fallback: only if API gave nothing at all
            const totals = items.length;
            setStats({ statistics: { totalCount: totals }, subsectorStatistics: [], levelStatistics: [] });
            console.log('[오답노트 setStats.subsectorStatistics fallback]', []);
          }
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

// Normalize various possible stats payload shapes
