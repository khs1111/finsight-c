// 간단한 게스트 로그인 API 래퍼
// 백엔드 연결 시 /api/auth/guest 를 호출해 세션/토큰을 세팅하고 true 반환
// 실패 시 폴백 토큰을 저장하고 true 반환하여 UX를 유지합니다.
import { API_BASE } from './config';


// 안전하게 토큰 저장
const saveToken = (token) => {
  localStorage.setItem('accessToken', token);
  sessionStorage.setItem('accessToken', token);
};


// 게스트 로그인 처리 (기존 계정 재사용, robust 저장)
export async function guestLogin(baseOverride) {
  try {
    let userId = localStorage.getItem('guestUserId');
    const base = baseOverride || API_BASE;
    // /api prefix 자동 보정
    const url = /\/api\/?$/.test(base) ? `${base.replace(/\/$/,'')}/auth/guest` : `${base.replace(/\/$/,'')}/api/auth/guest`;

    if (userId) {
      try {
        // 기존 계정 재사용 시도
        const reuseRes = await fetch(`${url}?userId=${userId}`, { method: 'POST', credentials: 'include', headers: { 'Accept': 'application/json' } });
        if (reuseRes.ok) {
          const data = await reuseRes.json();
          saveToken(data.accessToken || data.token);
          localStorage.setItem('guestUserId', data.userId);
          sessionStorage.setItem('userId', data.userId);
          return data;
        }
      } catch (error) {
        // 기존 사용자 ID 제거
        localStorage.removeItem('guestUserId');
      }
    }

    // 새 게스트 로그인
    const res = await fetch(url, { method: 'POST', credentials: 'include', headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('게스트 로그인 실패');
    const data = await res.json();
    saveToken(data.accessToken || data.token);
    localStorage.setItem('guestUserId', data.userId);
    sessionStorage.setItem('userId', data.userId);
    return data;
  } catch (error) {
    // Fallback: set dummy token so UX continues even if backend rejects
    const dummy = 'guest_' + Date.now();
    saveToken(dummy);
    if (!sessionStorage.getItem('userId')) sessionStorage.setItem('userId', '64');
    if (!localStorage.getItem('guestUserId')) localStorage.setItem('guestUserId', '64');
    return { accessToken: dummy, userId: '64', fallback: true };
  }
}
