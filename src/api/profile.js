// src/api/profile.js
// 프로필 정보 및 활동(출석) API 래퍼

import axios from 'axios';
import { API_BASE, HAS_PROFILE_ENDPOINTS, HAS_BADGE_ENDPOINTS } from './config';
import { IMAGE_BASE } from './config';

// Normalize API base and path similar to other modules
function buildUrl(path) {
  const base = String(API_BASE || '').replace(/\/+$/, '');
  const baseHasApi = /\/api$/i.test(base);
  let p = String(path || '');
  if (!p.startsWith('/')) p = `/${p}`;
  if (baseHasApi && p.startsWith('/api/')) p = p.replace(/^\/api/, '');
  if (!baseHasApi && !p.startsWith('/api/')) p = `/api${p}`;
  return `${base}${p}`;
}

async function http(path, opts = {}) {
  const token = sessionStorage.getItem('accessToken');
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

// Ensure image URLs are absolute to avoid broken icons when backend returns relative paths
function toAbsoluteUrl(url) {
  try {
    if (!url) return null;
    const s = String(url);
    if (/^https?:\/\//i.test(s)) return s;
    const base = String(IMAGE_BASE || '').replace(/\/$/, '');
    if (!base) return s;
    if (s.startsWith('/')) return `${base}${s}`;
    return `${base}/${s}`;
  } catch (_) {
    return url;
  }
}

// 프로필 기본 정보: 닉네임/티어/티어 이미지
export async function fetchProfile() {
  // 1) 대시보드 기반 우선 시도 (404 소음 방지)
  try {
    const userId = Number(sessionStorage.getItem('userId')) || undefined;
    if (userId) {
      const dash = await http(`/dashboard?userId=${userId}`);
  const nickname = dash?.userInfo?.nickname || sessionStorage.getItem('username') || '피니';
      // 가능한 위치에서 티어 문자열 추출 시도
      const fromObj = (obj) => {
        if (!obj || typeof obj !== 'object') return undefined;
        // 우선순위: tierName > tier > rank.name > level.name > grade > badge.tier
        const t1 = obj.tierName || obj.tier || obj.rank?.name || obj.level?.name || obj.grade || obj.badge?.tier;
        if (typeof t1 === 'string' && t1.trim()) return t1;
        // 객체형이면 name/title 필드 시도
        if (typeof obj.rank === 'object') {
          const t2 = obj.rank?.title || obj.rank?.label || obj.rank?.code;
          if (typeof t2 === 'string' && t2.trim()) return t2;
        }
        return undefined;
      };
      const tierRaw = fromObj(dash?.userInfo) || fromObj(dash) || fromObj(dash?.profile) || 'EMERALD';
  // Prefer badge icon from userInfo.badge.iconUrl if present
  const badgeIconUrl = dash?.userInfo?.badge?.iconUrl || dash?.userInfo?.badge_icon_url || dash?.badgeIconUrl || dash?.badge_icon_url;
  const tierImageUrl = badgeIconUrl || dash?.userInfo?.tierImageUrl || dash?.tierImageUrl || dash?.profile?.tierImageUrl || '';
  return { data: { nickname, tier: tierRaw, tierImageUrl }, isFallback: true };
    }
  } catch (_) {}

  // 2) 환경에서 /profile 엔드포인트 제공 시 직접 호출
  if (HAS_PROFILE_ENDPOINTS) {
    try {
      const data = await http('/profile');
      return { data };
    } catch (_) {}
  }

  // 3) 최종 안전 폴백
  return {
    data: {
      nickname: sessionStorage.getItem('username') || '퍼니의 동료',
      tier: 'EMERALD',
      tierImageUrl: '',
    },
    isDummy: true,
  };
}

// 프로필 활동(출석) 정보: YYYY-MM-DD 문자열 배열을 반환한다고 가정
export async function fetchProfileActivity() {
  // 1) 대시보드 기반 우선 시도 (404 소음 방지)
  try {
    const userId = Number(sessionStorage.getItem('userId')) || undefined;
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

  // 2) 환경에서 /profile/activity 엔드포인트 제공 시 직접 호출
  if (HAS_PROFILE_ENDPOINTS) {
    try {
      const data = await http('/profile/activity');
      return { data };
    } catch (_) {}
  }

  // 3) 최종 폴백: 오늘 날짜만 출석으로 처리
  const today = new Date();
  const z = (n) => (n < 10 ? `0${n}` : `${n}`);
  const key = `${today.getFullYear()}-${z(today.getMonth() + 1)}-${z(today.getDate())}`;
  return { data: { attendance: [key] }, isDummy: true };
}

// (선택) 대시보드/배지 Axios 래퍼
const BASE_URL = String(API_BASE || '').replace(/\/+$/, '');

export function getAxios(token) {
  // Include credentials so cookie-based sessions work across origins
  const instance = axios.create({ baseURL: BASE_URL, withCredentials: true });
  if (token) {
    instance.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }
  // Ensure path normalization for requests starting without '/api' when baseURL lacks it
  instance.interceptors.request.use((config) => {
    try {
      const baseHasApi = /\/api$/i.test(BASE_URL);
      let url = config.url || '';
      if (!url.startsWith('http')) {
        if (!url.startsWith('/')) url = `/${url}`;
        if (!baseHasApi && !url.startsWith('/api/')) url = `/api${url}`;
        if (baseHasApi && url.startsWith('/api/')) url = url.replace(/^\/api/, '');
        config.url = url;
      }
    } catch (_) {}
    return config;
  });
  return instance;
}

export function fetchDashboard(userId, token) {
  return getAxios(token).get('/dashboard', { params: { userId } });
}

// 배지 초기화: POST /api/badges/init
export function initBadges(token) {
  return getAxios(token).post('/badges/init');
}

// 배지 업데이트: POST /api/badges/update/{userId}
export function updateBadges(userId, token) {
  return getAxios(token).post(`/badges/update/${userId}`);
}

// 사용자 배지 목록 조회 (다양한 백엔드 경로에 대응하는 폴백 포함)
// 반환 형태를 { data: Badge[] }로 통일합니다.
export async function fetchBadges(userId, token) {
  // 404 소음 제거: 대시보드만 확인하고, 없으면 빈 배열 반환
  const ax = getAxios(token);
  try {
    const dash = await ax.get('/dashboard', { params: { userId } }).then(r => r?.data).catch(() => null);
    if (dash && typeof dash === 'object') {
      // 후보 위치: badges, userBadges, user_badges, achievements, awards 등
      let badges = dash.badges || dash.userBadges || dash.user_badges || dash.achievements || dash.awards || null;
      if (!badges) {
        // 객체 맵 형태인 경우 values 추출
        const maybeObj = dash.badgeMap || dash.userBadgeMap || dash.achievementMap;
        if (maybeObj && typeof maybeObj === 'object') badges = Object.values(maybeObj);
      }
      if (Array.isArray(badges)) return { data: badges };
      // 단일 현재 배지 정보만 있는 경우 배열로 래핑
      const current = dash.currentBadge || dash.userInfo?.badge || dash.profile?.badge || dash.badge;
      if (current && typeof current === 'object') return { data: [current] };
    }
  } catch (_) {}
  return { data: [] };
}

// 단일 배지 조회 (아이콘 등 메타 용도)
export async function fetchBadgeById(badgeId, token) {
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

// 현재 대표 배지 조회: GET /api/badges/user/{userId}/current
// 반환 형태 예: { id, name, iconUrl, ... }
export async function fetchCurrentBadgeByUser(userId, token) {
  const tk = token || sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') || undefined;
  const ax = getAxios(tk);
  const dbg = typeof window !== 'undefined' && (window.__FIN_DEBUG || window.__QUIZ_DEBUG || window.__BADGE_DEBUG);
  const path = `/badges/user/${userId}/current`;
  // Helper: dashboard-based fallback normalization
  const fallbackFromDashboard = async () => {
    try {
      const dashRes = await getAxios(tk).get('/dashboard', { params: { userId } });
      const dash = dashRes?.data || {};
      const ui = dash.userInfo || dash.profile || dash;
      const icon = ui?.badge?.iconUrl || ui?.badge?.icon_url || dash.badgeIconUrl || dash.badge_icon_url || null;
      const name = ui?.currentLevelTitle || ui?.tierName || ui?.tier || '';
      const levelNumber = ui?.currentLevelNumber || ui?.levelNumber || ui?.level || null;
      const norm = {
        id: ui?.displayed_badge_id || ui?.badge?.id || null,
        name: name || '',
        iconUrl: toAbsoluteUrl(icon),
        levelNumber: levelNumber ?? null,
        description: name ? `${name} 배지` : '',
        isAchieved: true,
        progress: 100,
      };
      if (dbg) console.log('[Badge][fallback][dashboard][normalized]', norm);
      return norm;
    } catch (_) {
      return null;
    }
  };
  // Fast exit if feature flag disabled or previous hard 404 observed in this session
  if (!HAS_BADGE_ENDPOINTS) {
    if (dbg) console.log('[Badge][skip] HAS_BADGE_ENDPOINTS=false; using dashboard fallback');
    return await fallbackFromDashboard();
  }
  const seen = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('badge.endpoint.404') : null;
  if (seen === '1') {
    if (dbg) console.log('[Badge][skip] cached 404; using dashboard fallback');
    return await fallbackFromDashboard();
  }
  try {
    if (dbg) console.log('[Badge][request] GET', buildUrl(path));
    const res = await ax.get(path);
    const raw = res?.data || res;
    if (!raw || typeof raw !== 'object') return null;
    // Normalize to expected shape
    const norm = {
      id: raw.id ?? raw.badgeId ?? raw.badge_id ?? null,
      name: raw.name ?? raw.badgeName ?? raw.badge_name ?? '',
      iconUrl: toAbsoluteUrl(raw.iconUrl ?? raw.icon_url ?? raw.icon ?? null),
      levelNumber: raw.levelNumber ?? raw.level_number ?? raw.level ?? null,
      description: raw.description ?? '',
      isAchieved: (raw.isAchieved ?? raw.is_achieved ?? raw.achieved ?? true) === true,
      progress: raw.progress ?? raw.completion ?? raw.percent ?? null,
    };
    // If endpoint succeeded but lacks icon/id, softly enrich from dashboard
    if (!norm.iconUrl || norm.id == null) {
      try {
        const dashRes = await getAxios(tk).get('/dashboard', { params: { userId } });
        const dash = dashRes?.data || {};
        const ui = dash.userInfo || dash.profile || dash;
        const fallbackIcon = ui?.badge?.iconUrl || ui?.badge?.icon_url || dash.badgeIconUrl || dash.badge_icon_url || null;
        const fallbackId = ui?.displayed_badge_id || ui?.badge?.id || null;
        norm.iconUrl = norm.iconUrl || toAbsoluteUrl(fallbackIcon);
        norm.id = norm.id ?? fallbackId;
        if (dbg) console.log('[Badge][enrich][dashboard]', { after: norm });
      } catch (_) { /* ignore enrichment failures */ }
    }
    if (dbg) console.log('[Badge][response][normalized]', norm);
    return norm;
  } catch (err) {
    // Quiet on 404; only log in debug
    const status = err?.response?.status;
    if (status === 404) {
      try { sessionStorage.setItem('badge.endpoint.404', '1'); } catch (_) {}
    }
    if (dbg) console.warn('[Badge][error]', { status, message: err?.message, url: buildUrl(path) });
    return await fallbackFromDashboard();
  }
}

// 간단한 현재 배지 조회 (요청 샘플과 동일한 형태): GET /api/badges/user/{userId}/current
// - 상대 경로 사용
// - 본문 없음, Content-Type 헤더만 전송
// - 200 아닐 경우 에러를 throw
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

export async function fetchAchievedBadges(userId, token) {
  const tk = token || sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  const ax = getAxios(tk);
  const path = `/badges/user/${userId}/achieved`;
  try {
    const resolved = buildUrl(path);
    console.log('[Badge][achieved][request]', {
      method: 'GET',
      url: path,
      resolved,
      baseURL: BASE_URL,
      headers: { Authorization: tk ? 'Bearer ***' : undefined },
    });
  } catch (_) {}

  try {
    const res = await ax.get(path);
    // eslint-disable-next-line no-console
    console.log('[Badge][achieved][response]', res?.status, res?.data);
    // 백엔드가 배열 형태로 리턴한다고 가정
    return res?.data || [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Badge][achieved][error]', {
      status: err?.response?.status,
      message: err?.message,
      url: `${API_BASE}${path}`,
    });

    // ✅ 폴백: 대시보드에서 뱃지 목록 추정
    try {
      const dashRes = await getAxios(tk).get('/dashboard', { params: { userId } });
      const dash = dashRes?.data || {};
      const inferred =
        dash.badges ||
        dash.userBadges ||
        dash.user_badges ||
        dash.achievements ||
        dash.awards ||
        [];
      return inferred;
    } catch (e) {
      console.error('[Badge][achieved][fallback][dash][error]', e?.message);
    }

    return [];
  }
}
// 주의: 구 경로(/api/user/*) 기반의 중복 export는 제거했습니다.
