// Study-related API (wrong notes)
import { API_BASE } from './config';

async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    return null;
  }
}

// GET /api/study/wrong-notes/stats
export async function getWrongNoteStats() {
  const data = await safeFetch(`${API_BASE}/study/wrong-notes/stats`);
  // expected shape: { total: number, byCategory: Array<{ category: string, count: number }> }
  return data;
}

// GET /api/study/wrong-notes?category=...
export async function getWrongNotes(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/study/wrong-notes${query ? `?${query}` : ''}`;
  const data = await safeFetch(url);
  // expected shape: { items: Array<WrongNote> }
  return data;
}

const studyApi = {
  getWrongNoteStats,
  getWrongNotes,
};

export default studyApi;
