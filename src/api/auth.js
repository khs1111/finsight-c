// 간단한 게스트 로그인 API 래퍼
// 백엔드 연결 시 /api/auth/guest 를 호출해 세션/토큰을 세팅하고 true 반환
// 실패 시 폴백 토큰을 저장하고 true 반환하여 UX를 유지합니다.
import { API_BASE } from './config';

export async function guestLogin(baseOverride) {
  try {
    const base = baseOverride || API_BASE;
    // /api prefix 자동 보정
    const url = /\/api\/?$/.test(base) ? `${base.replace(/\/$/,'')}/auth/guest` : `${base.replace(/\/$/,'')}/api/auth/guest`;
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      // Fallback: set dummy token so UX continues even if backend rejects
      const dummy = 'guest_' + Date.now();
      try { sessionStorage.setItem('accessToken', dummy); } catch (_) {}
      try { localStorage.setItem('accessToken', dummy); } catch (_) {}
      try { if (!sessionStorage.getItem('userId')) sessionStorage.setItem('userId', '64'); } catch (_) {}
      try { if (!localStorage.getItem('userId')) localStorage.setItem('userId', '64'); } catch (_) {}
      try { sessionStorage.setItem('guest', '1'); } catch (_) {}
      try { sessionStorage.setItem('guestLoginAt', String(Date.now())); } catch (_) {}
      try { localStorage.setItem('guestLoginAt', String(Date.now())); } catch (_) {}
      return true;
    }
    const data = await res.json();
    // Support both `token` and `accessToken` keys from backend
    const tok = data?.token || data?.accessToken;
    const uid = data?.userId != null ? String(data.userId) : undefined;
    if (tok) {
      try { sessionStorage.setItem('accessToken', tok); } catch (_) {}
      try { localStorage.setItem('accessToken', tok); } catch (_) {}
    }
    if (uid) {
      try { sessionStorage.setItem('userId', uid); } catch (_) {}
      try { localStorage.setItem('userId', uid); } catch (_) {}
    }
    try { sessionStorage.setItem('guest', '1'); } catch (_) {}
    try { sessionStorage.setItem('guestLoginAt', String(Date.now())); } catch (_) {}
    try { localStorage.setItem('guestLoginAt', String(Date.now())); } catch (_) {}
    return true;
  } catch (e) {
    const dummy = 'guest_' + Date.now();
    try { sessionStorage.setItem('accessToken', dummy); } catch (_) {}
    try { localStorage.setItem('accessToken', dummy); } catch (_) {}
    try { if (!sessionStorage.getItem('userId')) sessionStorage.setItem('userId', '64'); } catch (_) {}
    try { if (!localStorage.getItem('userId')) localStorage.setItem('userId', '64'); } catch (_) {}
    try { sessionStorage.setItem('guest', '1'); } catch (_) {}
    try { sessionStorage.setItem('guestLoginAt', String(Date.now())); } catch (_) {}
    try { localStorage.setItem('guestLoginAt', String(Date.now())); } catch (_) {}
    return true;
  }
}
