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

// GET /api/wrong-notes/statistics?userId=...
export async function getWrongNoteStats(userId) {
  const qp = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const data = await safeFetch(`${API_BASE}/wrong-notes/statistics${qp}`);
  return data;
}

// GET /api/wrong-notes?userId=&page=&size=&filter=
export async function getWrongNotes(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/wrong-notes${query ? `?${query}` : ''}`;
  const data = await safeFetch(url);
  return data;
}

const studyApi = {
  getWrongNoteStats,
  getWrongNotes,
};

export default studyApi;
