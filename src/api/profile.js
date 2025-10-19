// src/api/profile.js
// 프로필 정보 및 활동(출석) API 래퍼

import axios from 'axios';
import { API_BASE, HAS_PROFILE_ENDPOINTS, HAS_BADGE_ENDPOINTS } from './config';
// 👇 auth.js에서 data 대신 필요한 함수들을 직접 import (수정됨)
import { getAccessToken, getUserId } from './auth';

// Normalize API base and path similar to other modules
function buildUrl(path) {
  // ... (이 함수는 변경 없음)
  const base = String(API_BASE || '').replace(/\/+$/, '');
  const baseHasApi = /\/api$/i.test(base);
  let p = String(path || '');
  if (!p.startsWith('/')) p = `/${p}`;
  if (baseHasApi && p.startsWith('/api/')) p = p.replace(/^\/api/, '');
  if (!baseHasApi && !p.startsWith('/api/')) p = `/api${p}`;
  return `${base}${p}`;
}

async function http(path, opts = {}) {
  // 👇 getAccessToken() 함수 호출로 변경 (수정됨)
  const token = getAccessToken();
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const url = buildUrl(path);
  const res = await fetch(url, {
    credentials: 'include',
    ...opts,
    headers,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

// Ensure image URLs are absolute ...


// 프로필 기본 정보: 닉네임/티어/티어 이미지
export async function fetchProfile() {
  try {
    // 👇 getUserId() 함수 호출로 변경 (수정됨)
    const userId = getUserId(); // getUserId()가 숫자 또는 null/undefined를 반환한다고 가정
    if (!userId) {
      // userId 없으면 기본값 반환
      return { nickname: '안현진', tier: '브론즈', totalScore: 0, streak: 0 };
    }
    // API 호출 시 Number()로 변환할 필요 없음 (getUserId가 이미 처리 가정)
    const dash = await http(`/dashboard?userId=${userId}`);
    console.log('[프로필][대시보드][응답]', dash);
    return {
      nickname: dash?.userInfo?.nickname || '안현진',
      tier: dash?.userInfo?.currentLevelTitle || '브론즈',
      totalScore: dash?.userInfo?.totalScore || 0,
      streak: dash?.userInfo?.streak || 0,
    };
  } catch (error) {
    console.error('프로필 조회 실패:', error);
    return {
      nickname: '안현진',
      tier: '브론즈',
      totalScore: 0,
      streak: 0
    };
  }
}

// 프로필 활동(출석) 정보: YYYY-MM-DD 문자열 배열을 반환한다고 가정
export async function fetchProfileActivity() {
  // 1) 대시보드 기반 우선 시도
  try {
    // 👇 getUserId() 함수 호출로 변경 (수정됨)
    const userId = getUserId();
    if (userId) {
      const dash = await http(`/dashboard?userId=${userId}`);
      const arr = Array.isArray(dash?.weeklyProgress) ? dash.weeklyProgress : [];
      const attendance = arr
        .filter((d) => d?.completed)
        .map((d) => d?.date)
        .filter(Boolean);
      if (attendance.length) return { data: { attendance }, isFallback: true };
    }
  } catch (_) {}

  // 2) /profile/activity 엔드포인트 시도
  if (HAS_PROFILE_ENDPOINTS) {
    try {
      const profileData = await http('/profile/activity');
      return { data: profileData };
    } catch (_) {}
  }

  // 3) 최종 폴백
  const today = new Date();
  const z = (n) => (n < 10 ? `0${n}` : `${n}`);
  const key = `${today.getFullYear()}-${z(today.getMonth() + 1)}-${z(today.getDate())}`;
  return { data: { attendance: [key] }, isDummy: true };
}

// (선택) 대시보드/배지 Axios 래퍼
const BASE_URL = String(API_BASE || '').replace(/\/+$/, '');

// getAxios 함수는 token을 인자로 받으므로 내부 수정 불필요
export function getAxios(token) {
  // ... (이 함수는 변경 없음)
  const instance = axios.create({ baseURL: BASE_URL, withCredentials: true });
  if (token) {
    instance.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }
  instance.interceptors.request.use((config) => {
    try {
      const baseHasApi = /\/api$/i.test(BASE_URL);
      let url = config.url || '';
      if (!url.startsWith('http')) {
        if (!url.startsWith('/')) url = `/${url}`;
        if (baseHasApi && url.startsWith('/api/')) url = url.replace(/^\/api/, '');
        if (!baseHasApi && !url.startsWith('/api/')) url = `/api${url}`;
        config.url = url;
      }
    } catch (_) {}
    return config;
  });
  return instance;
}

// fetchDashboard 함수는 token을 인자로 받으므로 내부 수정 불필요
export function fetchDashboard(userId, token) {
  return getAxios(token).get('/dashboard', { params: { userId } });
}

// initBadges 함수는 token을 인자로 받으므로 내부 수정 불필요
export function initBadges(token) {
  return getAxios(token).post('/badges/init');
}

// updateBadges 함수는 token을 인자로 받으므로 내부 수정 불필요
export function updateBadges(userId, token) {
  return getAxios(token).post(`/badges/update/${userId}`);
}

// fetchBadges 함수는 token을 인자로 받으므로 내부 수정 불필요
export async function fetchBadges(userId, token) {
  // ... (이 함수는 변경 없음)
  const ax = getAxios(token);
  try {
    const dash = await ax.get('/dashboard', { params: { userId } }).then(r => r?.data).catch(() => null);
    if (dash && typeof dash === 'object') {
      let badges = dash.badges || dash.userBadges || dash.user_badges || dash.achievements || dash.awards || null;
      if (!badges) {
        const maybeObj = dash.badgeMap || dash.userBadgeMap || dash.achievementMap;
        if (maybeObj && typeof maybeObj === 'object') badges = Object.values(maybeObj);
      }
      if (Array.isArray(badges)) return { data: badges };
      const current = dash.currentBadge || dash.userInfo?.badge || dash.profile?.badge || dash.badge;
      if (current && typeof current === 'object') return { data: [current] };
    }
  } catch (_) {}
  return { data: [] };
}

// fetchBadgeById 함수는 token을 인자로 받으므로 내부 수정 불필요
export async function fetchBadgeById(badgeId, token) {
  // ... (이 함수는 변경 없음)
  const ax = getAxios(token);
  try {
    return await ax.get(`/badges/${badgeId}`);
  } catch (_) {
    try {
      return await ax.get(`/badges`, { params: { id: badgeId } });
    } catch (e) {
      throw e;
    }
  }
}

// 현재 대표 배지 조회
export async function fetchCurrentBadgeByUser(userId, token) {
  // 👇 getAccessToken() 함수 호출로 변경 (수정됨)
  const tk = token || getAccessToken() || undefined; // 인자로 받은 token 우선 사용
  const ax = getAxios(tk);
  const dbg = typeof window !== 'undefined' && (window.__FIN_DEBUG || window.__QUIZ_DEBUG || window.__BADGE_DEBUG);
  const path = `${BASE_URL}/badges/user/${userId}/current`;

  const fallbackFromDashboard = async () => {
    try {
      // tk 사용
      // ... (fallback 내부 로직은 변경 없음)
      const norm = { /* ... */ };
      if (dbg) console.log('[Badge][fallback][dashboard][normalized]', norm);
      return norm;
    } catch (_) {
      return null;
    }
  };

  // Feature flag 및 캐시 체크는 변경 없음
  if (!HAS_BADGE_ENDPOINTS) { /* ... */ return await fallbackFromDashboard(); }
  const seen = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('badge.endpoint.404') : null;
  if (seen === '1') { /* ... */ return await fallbackFromDashboard(); }

  try {
    if (dbg) console.log('[Badge][request] GET', buildUrl(path));
    const res = await ax.get(path);
    // ... (응답 처리 및 enrichment 로직은 변경 없음)
    const raw = res?.data || res;
    if (!raw || typeof raw !== 'object') return null;
    const norm = { /* ... */ };
    if (dbg) console.log('[Badge][response][normalized]', norm);
    return norm;
  } catch (err) {
    // ... (에러 처리 및 fallback 호출은 변경 없음)
    const status = err?.response?.status;
    if (status === 404) { /* ... */ }
    if (dbg || status !== 404) { /* ... */ }
    return await fallbackFromDashboard();
  }
}

// 간단한 현재 배지 조회 (토큰 불필요 가정)
// 이 함수는 auth.js와 직접적인 관련이 없으므로 변경 없음
export async function getCurrentBadge(userId) {
  const url = buildUrl(`/badges/user/${userId}/current`);
  const reqInit = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };
  try {
    console.log('[Badge][current][request]', { url, ...reqInit });
    const res = await fetch(url, reqInit);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.log('[Badge][current][raw-error]', { url, status: res.status, body: text || '(empty)' });
      const err = new Error(`뱃지 조회 실패 (HTTP ${res.status}) ${text}`);
      err.status = res.status;
      err.body = text;
      throw err;
    }
    const json = await res.json().catch(() => ({}));
    console.log('[Badge][current][raw-ok]', json);
    return json;
  } catch (err) {
    console.error('[Badge][current][fetch-error]', err);
    throw err;
  }
}

