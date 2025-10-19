import { API_BASE } from './config';

/*
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
}*/
/*
@param {number|null} userId - 기존 사용자 ID (선택사항)
@returns {Promise<Object>} - { accessToken, userId }
*/ 
export const guestLogin = async (userId = null) => {
  try {
    const url = userId 
      ? `${API_BASE}/auth/guest?userId=${userId}`
      : `${API_BASE}/auth/guest`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 토큰과 사용자 ID를 로컬 스토리지에 저장
    if (data.accessToken && data.userId) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userId', data.userId.toString());
      console.log('게스트 로그인 성공:', data);

      // --- 프로필 캐시 시드 (백그라운드) ---
      try {
        seedProfileCacheAfterLogin(data.userId, data.accessToken);
      } catch (_) {
        // 캐시 시드는 실패해도 로그인 플로우에 영향 주지 않음
      }
    }

    return data;
  } catch (error) {
    console.error('게스트 로그인 실패:', error);
    throw error;
  }
};

/**
 * 기존 게스트 계정 재사용
 * @param {number} userId - 재사용할 사용자 ID
 * @returns {Promise<Object>} - { accessToken, userId }
 */
export const reuseGuestAccount = async (userId) => {
  return await guestLogin(userId);
};

/**
 * 새 게스트 계정 생성
 * @returns {Promise<Object>} - { accessToken, userId }
 */
export const createNewGuestAccount = async () => {
  return await guestLogin();
};

// ========================================
// 토큰 관리 유틸리티 함수들
// ========================================

/**
 * 저장된 액세스 토큰 가져오기
 * @returns {string|null} - 액세스 토큰 또는 null
 */
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * 저장된 사용자 ID 가져오기
 * @returns {number|null} - 사용자 ID 또는 null
 */
export const getUserId = () => {
  const userId = localStorage.getItem('userId');
  return userId ? parseInt(userId, 10) : null;
};

/**
 * 로그인 상태 확인
 * @returns {boolean} - 로그인 여부
 */
export const isLoggedIn = () => {
  return !!(getAccessToken() && getUserId());
};

/**
 * 로그아웃 (토큰 제거)
 */
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userId');
  try {
    // 프로필 즉시 렌더 캐시 제거
    const KEY = 'profile.cache.v1';
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
  } catch (_) {}
  console.log('게스트 로그아웃 완료');
};

/**
 * API 호출용 헤더 생성
 * @returns {Object} - Authorization 헤더가 포함된 헤더 객체
 */
export const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// ========================================
// 자동 로그인 로직
// ========================================

/**
 * 페이지 로드 시 자동 게스트 로그인
 * - 기존 토큰이 있으면 재사용 시도
 * - 없으면 새 계정 생성
 */
export const autoGuestLogin = async () => {
  try {
    const existingUserId = getUserId();
    
    if (existingUserId) {
      // 기존 사용자 ID로 재사용 시도
      console.log('기존 게스트 계정 재사용 시도:', existingUserId);
      return await reuseGuestAccount(existingUserId);
    } else {
      // 새 게스트 계정 생성
      console.log('새 게스트 계정 생성');
      return await createNewGuestAccount();
    }
  } catch (error) {
    console.error('자동 게스트 로그인 실패:', error);
    // 재사용 실패 시 새 계정 생성
    try {
      return await createNewGuestAccount();
    } catch (newAccountError) {
      console.error('새 계정 생성도 실패:', newAccountError);
      throw newAccountError;
    }
  }
};

// ==============================
// 내부 유틸: 프로필 캐시 시드
// ==============================
const PROFILE_CACHE_KEY = 'profile.cache.v1';
function writeProfileCache(patch) {
  try {
    const raw = sessionStorage.getItem(PROFILE_CACHE_KEY) || localStorage.getItem(PROFILE_CACHE_KEY);
    const base = raw ? (JSON.parse(raw) || {}) : {};
    const next = { ...base, ...patch, updatedAt: Date.now() };
    const serialized = JSON.stringify(next);
    sessionStorage.setItem(PROFILE_CACHE_KEY, serialized);
    localStorage.setItem(PROFILE_CACHE_KEY, serialized);
  } catch (_) {}
}

function buildUrl(path) {
  try {
    const base = String(API_BASE || '').replace(/\/+$/, '');
    const baseHasApi = /\/api$/i.test(base);
    let p = String(path || '');
    if (!p.startsWith('/')) p = `/${p}`;
    if (baseHasApi && p.startsWith('/api/')) p = p.replace(/^\/api/, '');
    if (!baseHasApi && !p.startsWith('/api/')) p = `/api${p}`;
    return `${base}${p}`;
  } catch (_) {
    return `${API_BASE}${path}`;
  }
}

async function seedProfileCacheAfterLogin(userId, token) {
  if (!userId || !token) return;
  // 사용자 ID만으로도 캐시 스켈레톤 생성
  writeProfileCache({ userId });

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // 대시보드: 닉네임/점수
  try {
    const dashUrl = buildUrl(`/dashboard?userId=${userId}`);
    const res = await fetch(dashUrl, { method: 'GET', headers, credentials: 'include' });
    if (res.ok) {
      const dash = await res.json().catch(() => ({}));
      const ui = dash?.userInfo || dash?.profile || dash || {};
      const nickname = ui?.nickname || '';
      if (nickname) writeProfileCache({ nickname, userId });
      const cand = [
        ui?.score, ui?.points, ui?.point, ui?.totalScore, ui?.totalPoints, ui?.xp, ui?.exp,
        dash?.score, dash?.points, dash?.totalScore, dash?.totalPoints, dash?.xp, dash?.exp,
      ];
      for (const v of cand) {
        if (v == null) continue;
        const n = typeof v === 'number' ? v : Number(v);
        if (!Number.isNaN(n)) { writeProfileCache({ score: n, userId }); break; }
      }
    }
  } catch (_) {}

  // 현재 배지: 티어명/아이콘
  try {
    const badgeUrl = buildUrl(`/badges/user/${userId}/current`);
    const res = await fetch(badgeUrl, { method: 'GET', headers, credentials: 'include' });
    if (res.ok) {
      const raw = await res.json().catch(() => null);
      if (raw && typeof raw === 'object') {
        const icon = raw?.iconUrl || raw?.icon_url || raw?.badge?.iconUrl || raw?.badge?.icon_url;
        const name = raw?.name || raw?.badge?.name || raw?.title || raw?.badge?.title;
        const patch = { userId };
        if (icon) patch.tierImageUrl = icon;
        if (name) patch.tier = name;
        writeProfileCache(patch);
      }
    }
  } catch (_) {}
}
