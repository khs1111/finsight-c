const BASE = process.env.REACT_APP_API_BASE || '';

async function apiGet(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) {
    throw new Error(`GET ${path} ${res.status}`);
  }
  return res.json();
}

async function apiPost(path) {
  const res = await fetch(BASE + path, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`POST ${path} ${res.status}`);
  }
  return res.json();
}

export async function fetchLetterLatest(sector, key) {
  return apiGet(`/api/letters/${sector}/${key}`);
}

export async function fetchLetterHistory(sector, key) {
  return apiGet(`/api/letters/${sector}/${key}/history`);
}

export async function publishLetter(sector, key, batchId) {
  return apiPost(`/api/letters/${sector}/${key}/${batchId}/publish`);
}

export async function fetchPendingLetters(sector) {
  const qs = sector ? `?sector=${encodeURIComponent(sector)}` : '';
  return apiGet(`/api/letters/pending${qs}`);
}

export async function publishLatest(sector, key) {
  return apiPost(`/api/letters/${sector}/${key}/publish-latest`);
}

export async function publishAll(sector, key) {
  return apiPost(`/api/letters/${sector}/${key}/publish-all`);
}
