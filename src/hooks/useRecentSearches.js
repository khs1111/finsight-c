import { useCallback, useEffect, useState } from 'react';

// New storage format: [{ term: string, ts: number }]
const NEW_KEY = 'recentSearches';
// Legacy storage format: [string]
const LEGACY_KEY = 'recent_search_keywords';
const MAX_ITEMS = 20;

function migrateLegacy() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // Map legacy strings to new objects; most recent first
    return arr.filter(v => typeof v === 'string' && v.trim()).map((term, i) => ({ term, ts: Date.now() - i }));
  } catch {
    return [];
  }
}

function load() {
  try {
    const raw = localStorage.getItem(NEW_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.filter(x => x && typeof x.term === 'string');
    }
  } catch {}
  // fallback to legacy
  return migrateLegacy();
}

function save(items) {
  try { localStorage.setItem(NEW_KEY, JSON.stringify(items)); } catch {}
}

export default function useRecentSearches() {
  const [recent, setRecent] = useState(() => load());

  useEffect(() => { save(recent); }, [recent]);

  const add = useCallback((term) => {
    if (!term || typeof term !== 'string') return;
    const t = term.trim();
    if (!t) return;
    setRecent(prev => {
      const filtered = prev.filter(it => it.term !== t);
      const next = [{ term: t, ts: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      return next;
    });
  }, []);

  const remove = useCallback((term) => {
    setRecent(prev => prev.filter(it => it.term !== term));
  }, []);

  const clear = useCallback(() => setRecent([]), []);

  return { recent, add, remove, clear };
}
