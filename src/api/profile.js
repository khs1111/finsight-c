// src/api/profile.js
// 프로필 정보 및 활동(출석) API 래퍼

import axios from 'axios';
import { API_BASE, HAS_PROFILE_ENDPOINTS } from './config';

async function http(path, opts = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
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

// 프로필 기본 정보: 닉네임/티어/티어 이미지
export async function fetchProfile() {
  // 1) 대시보드 기반 우선 시도 (404 소음 방지)
  try {
    const userId = Number(localStorage.getItem('userId')) || undefined;
    if (userId) {
      const dash = await http(`/dashboard?userId=${userId}`);
  const nickname = dash?.userInfo?.nickname || localStorage.getItem('username') || '퍼니의 동료';
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
      nickname: localStorage.getItem('username') || '퍼니의 동료',
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
    const userId = Number(localStorage.getItem('userId')) || undefined;
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
const BASE_URL = API_BASE;

export function getAxios(token) {
  const instance = axios.create({ baseURL: BASE_URL });
  if (token) {
    instance.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }
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

// 주의: 구 경로(/api/user/*) 기반의 중복 export는 제거했습니다.
