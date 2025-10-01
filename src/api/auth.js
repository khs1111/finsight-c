// 간단한 게스트 로그인 API 래퍼
// 백엔드 연결 시 /api/auth/guest 를 호출해 세션/토큰을 세팅하고 true 반환
// 실패 시 false 반환. 현재는 연결 전이므로 항상 true를 반환하게 구성해두고,
// 연결되면 fetch 부분 주석 해제하세요.

export async function guestLogin() {
  try {
    // const res = await fetch('/api/auth/guest', { method: 'POST', credentials: 'include' });
    // if (!res.ok) return false;
    // const data = await res.json();
    // TODO: 토큰/쿠키 처리 등 필요 시 여기서 수행
    return true; // 현재는 무조건 성공 처리
  } catch (e) {
    return false;
  }
}
