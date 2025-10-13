// src/api/levels.js - Levels API wrappers per spec
import { API_BASE } from './config';

// Normalize path with API_BASE that may or may not already end with /api
function buildUrl(path) {
  const base = String(API_BASE || '').replace(/\/+$/, '');
  const baseHasApi = /\/api$/i.test(base);
  let p = String(path || '');
  if (!p.startsWith('/')) p = `/${p}`;
  if (baseHasApi && p.startsWith('/api/')) p = p.replace(/^\/api/, '');
  if (!baseHasApi && !p.startsWith('/api/')) p = `/api${p}`;
  return `${base}${p}`;
}

function getAuthHeaders(token) {
  const jwt = token || sessionStorage.getItem('accessToken');
  return jwt ? { Authorization: `Bearer ${jwt}` } : {};
}

function withUserId(userId) {
  const stored = Number(sessionStorage.getItem('userId'));
  return userId ?? (Number.isFinite(stored) ? stored : undefined);
}

// GET /api/levels/{id}/progress?userId=
export async function getProgress(levelId, userId, token) {
  const idNum = Number(levelId);
  if (!Number.isFinite(idNum)) throw new Error('Invalid levelId');
  const uid = withUserId(userId);
  const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
  const url = buildUrl(`/levels/${idNum}/progress${qs}`);
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json', ...getAuthHeaders(token) },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

// POST /api/levels/{id}/start?userId=
export async function startLevel(levelId, userId, token) {
  const idNum = Number(levelId);
  if (!Number.isFinite(idNum)) throw new Error('Invalid levelId');
  const uid = withUserId(userId);
  const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
  const url = buildUrl(`/levels/${idNum}/start${qs}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeaders(token) },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json().catch(() => ({}));
}

// POST /api/levels/{id}/complete?userId=
export async function completeLevel(levelId, userId, token) {
  const idNum = Number(levelId);
  if (!Number.isFinite(idNum)) throw new Error('Invalid levelId');
  const uid = withUserId(userId);
  const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
  const url = buildUrl(`/levels/${idNum}/complete${qs}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeaders(token) },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json().catch(() => ({}));
}
