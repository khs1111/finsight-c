import { useState } from 'react';

const RECENT_KEY = 'recent_search_keywords';
function read() {
  try {
    const arr = JSON.parse(localStorage.getItem(RECENT_KEY));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default function useRecentSearches() {
  const [recent, setRecent] = useState(read());

  const add = (keyword) => {
    if (!keyword) return;
    let arr = read();
    arr = arr.filter(k => k !== keyword);
    arr.unshift(keyword);
    if (arr.length > 10) arr = arr.slice(0, 10);
    localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
    setRecent(arr);
  };

  const clear = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  return { recent, add, clear };
}
