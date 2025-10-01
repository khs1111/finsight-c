// src/api/profile.js
// 프로필 정보 및 활동(출석) API 래퍼

import axios from 'axios';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8081/api';

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
  try {
    const data = await http('/profile');
    return { data };
  } catch (e) {
    // 안전한 폴백
    return {
      data: {
        nickname: localStorage.getItem('username') || '퍼니의 동료',
        tier: 'EMERALD',
        tierImageUrl: '',
      },
      isDummy: true,
    };
  }
}

// 프로필 활동(출석) 정보: YYYY-MM-DD 문자열 배열을 반환한다고 가정
export async function fetchProfileActivity() {
  try {
    const data = await http('/profile/activity');
    return { data };
  } catch (e) {
    // 오늘 날짜만 출석으로 폴백
    const today = new Date();
    const z = (n) => (n < 10 ? `0${n}` : `${n}`);
    const key = `${today.getFullYear()}-${z(today.getMonth() + 1)}-${z(today.getDate())}`;
    return { data: { attendance: [key] }, isDummy: true };
  }
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

export function fetchBadges(userId, token) {
  return getAxios(token).get(`/badges/user/${userId}`);
}

// 주의: 구 경로(/api/user/*) 기반의 중복 export는 제거했습니다.
