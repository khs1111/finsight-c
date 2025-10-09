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
    if (!res.ok) return false;
    const data = await res.json();
    if (data?.token) localStorage.setItem('accessToken', data.token);
    if (data?.userId != null) localStorage.setItem('userId', String(data.userId));
    return true;
  } catch (e) {
    const dummy = 'guest_' + Date.now();
    localStorage.setItem('accessToken', dummy);
    if (!localStorage.getItem('userId')) localStorage.setItem('userId', '64');
    return true;
  }
}
