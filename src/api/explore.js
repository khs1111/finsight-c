// ✅ explore.js — 완성 버전 (2025.10 기준)
// 게스트 로그인 / JWT 자동 / 주제-레벨 매핑 / 진행도 / 기사 문제 처리 완비

import { API_BASE } from './config';
import { guestLogin } from './auth';

// ───────────────────────────────
// 💬 1. 백엔드 연결 상태 및 인증 유틸
// ───────────────────────────────
let isBackendConnected = true;
let authInitialized = false;

async function checkBackendConnection() {
  const baseHasApiSuffix = /\/api\/?$/.test(API_BASE);
  const apiPrefix = baseHasApiSuffix ? '' : '/api';
  const candidates = [`${apiPrefix}/health`, `${apiPrefix}/actuator/health`];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);
  try {
    for (const path of candidates) {
      const res = await fetch(`${API_BASE}${path}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        isBackendConnected = true;
        console.log(`✅ 백엔드 연결됨 (${path})`);
        clearTimeout(timeoutId);
        return true;
      }
    }
  } catch (_) { /* ignore */ }
  clearTimeout(timeoutId);
  isBackendConnected = false;
  console.log('❌ 백엔드 연결 안됨 — 더미모드 사용');
  return false;
}
checkBackendConnection();

// JWT 헤더 포함 공통 fetch
async function ensureAuth() {
  if (authInitialized) return;
  const token = localStorage.getItem('accessToken');
  if (!token) {
    try { await guestLogin(API_BASE); } catch (_) {}
  }
  authInitialized = true;
}

async function http(path, opts = {}, token) {
  await ensureAuth();
  const jwt = token || opts.token || localStorage.getItem('accessToken');

  // URL 보정: API_BASE가 /api로 끝나든 아니든 중복/누락 없이 합치기
  const base = String(API_BASE || '').replace(/\/+$/, ''); // 끝 슬래시 제거
  const baseHasApi = /\/api$/i.test(base);

  let p = typeof path === 'string' ? path : '';
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.startsWith('/api/')) {
    // 호출 경로가 /api/로 시작하면, BASE가 이미 /api로 끝나는 경우 중복 제거
    if (baseHasApi) p = p.replace(/^\/api/, '');
  } else {
    // 호출 경로가 /api로 시작하지 않으면, BASE가 /api가 없는 경우에만 /api 붙임
    if (!baseHasApi) p = `/api${p}`;
  }

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;

  const res = await fetch(`${base}${p}`, {
    headers,
    credentials: 'include',
    ...opts,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }
  return res.json();
}

const withUserId = (userId) => {
  const stored = Number(localStorage.getItem('userId'));
  return userId ?? (Number.isFinite(stored) ? stored : undefined);
};

// ───────────────────────────────
// 🧭 2. 레벨/서브섹터/주제 API
// ───────────────────────────────
export const getSectors = async () => {
  try { return await http('/sectors'); } catch { return []; }
};

export const getSector = async (id) => {
  try { return await http(`/sectors/${id}`); } catch { return null; }
};

export const getSubsectorsBySectorId = async (sectorId) => {
  try {
    const sec = await getSector(sectorId);
    if (sec?.subsectors?.length) return sec.subsectors;
  } catch {}
  try { return await http(`/sectors/${sectorId}/subsectors`); } catch {}
  try { return await http(`/subsectors?sectorId=${encodeURIComponent(sectorId)}`); } catch {}
  return [];
};

export const getSubsector = async (id) => {
  try { return await http(`/subsectors/${id}`); } catch { return null; }
};

// subsector → levels
export const getLevelsBySubsector = async (subsectorId) => {
  if (!subsectorId) return [];
  try {
    let levels = [];
    try {
      const detail = await getSubsector(subsectorId);
      const keys = ['levels', 'levelList', 'levelDtos', 'levelResponses'];
      for (const k of keys) {
        if (Array.isArray(detail?.[k]) && !levels.length) levels = detail[k];
      }
    } catch {}
    if (!levels.length) {
      const res = await http(`/subsectors/${subsectorId}/levels`);
      if (Array.isArray(res)) levels = res;
    }
    if (!levels.length) {
      // 백엔드 변형 케이스 대비
      const tryQuery = await http(`/levels?subsectorId=${encodeURIComponent(subsectorId)}`).catch(() => []);
