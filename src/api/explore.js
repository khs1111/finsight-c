// src/api/explore.js - 백엔드 API 연동
import { API_BASE, IMAGE_BASE } from './config';
import { guestLogin } from './auth';

// 백엔드 연결 상태 확인 (정보용)
let isBackendConnected = true; // 낙관적으로 시작하여 건강 체크 실패로 기능이 막히지 않게 함
let authInitialized = false;

// 백엔드 연결 상태 체크 함수
async function checkBackendConnection() {
  // 모든 건강 체크 엔드포인트는 백엔드 표준 prefix /api 사용
  const candidates = [
    '/api/health',
    '/api/actuator/health',
  ];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);
  try {
    for (const path of candidates) {
      try {
        const res = await fetch(`${API_BASE}${path}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
          credentials: 'include',
          method: 'GET',
        });
        if (res.ok) {
          isBackendConnected = true;
          console.log(`✅ 백엔드 서버 연결됨 (${path}) - 실제 API 사용`);
          clearTimeout(timeoutId);
          return true;
        }
      } catch (_) { /* try next */ }
    }
  } finally {
    clearTimeout(timeoutId);
  }
  isBackendConnected = false;
  console.log('🔄 백엔드 서버 연결 안됨 - 더미 데이터로 디자인 확인 모드');
  console.log(`   API_BASE: ${API_BASE}`);
  return false;
}

// 앱 시작시 백엔드 연결 상태 확인
checkBackendConnection();

// 백엔드 연결 상태를 수동으로 다시 확인하는 함수 (필요시 사용)
export const recheckBackendConnection = async () => {
  const wasConnected = isBackendConnected;
  const nowConnected = await checkBackendConnection();
  
  if (wasConnected !== nowConnected) {
    console.log(`🔄 백엔드 연결 상태 변경: ${wasConnected ? '연결됨' : '연결안됨'} → ${nowConnected ? '연결됨' : '연결안됨'}`);
  }
  
  return nowConnected;
};

// 현재 백엔드 연결 상태 확인
export const isBackendOnline = () => isBackendConnected;

// 공통 유틸: userId 보정 (로컬스토리지 fallback)
const withUserId = (userId) => {
  const stored = Number(localStorage.getItem('userId'));
  return userId ?? (Number.isFinite(stored) ? stored : undefined);
};

// 레벨 키(한글 라벨)를 백엔드에서 기대하는 숫자 ID로 보정
function coerceLevelId(levelId) {
  if (typeof levelId === 'number') return levelId;
  if (!levelId) return 1;
  const s = String(levelId).trim();
  const map = {
    '초보자': 1, '초급자': 1, '기초': 1, 'beginner': 1, 'easy': 1,
    '중급': 2, '중급자': 2, 'intermediate': 2, 'medium': 2,
    '고급': 3, '고급자': 3, 'advanced': 3, 'hard': 3,
  };
  const n = Number(s);
  if (Number.isFinite(n) && n >= 1 && n <= 3) return n;
  return map[s.toLowerCase()] || 1;
}

// JWT 토큰을 자동으로 헤더에 포함하는 fetch 함수
async function ensureAuth() {
  if (authInitialized) return;
  const hasToken = !!localStorage.getItem('accessToken');
  if (!hasToken) {
    // 게스트 로그인 시도 (실패해도 진행)
    try { await guestLogin(API_BASE); } catch (_) {}
  }
  authInitialized = true;
}

async function http(path, opts = {}, token) {
  // 게스트 로그인 토큰 확보 (최초 1회)
  await ensureAuth();
  const jwt = opts.token || token || localStorage.getItem('accessToken');
  // /api prefix 자동 보정: 호출자가 /api/ 생략해도 안전하게 붙여줌
  let finalPath = path;
  if (!/^\/api\//.test(path)) {
    const baseHasApiSuffix = /\/api\/?$/.test(API_BASE);
    if (!baseHasApiSuffix) {
      finalPath = `/api${path.startsWith('/') ? path : '/' + path}`;
    }
  }
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
  const res = await fetch(`${API_BASE}${finalPath}`, {
    headers,
    credentials: 'include',
    ...opts,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

// ========================================
// � 백엔드 API 엔드포인트들

// =============================
// Finsight 백엔드 API 엔드포인트
// =============================

// 1. 섹터(대분류) 목록 조회
export const getSectors = async () => {
  try { return await http('/sectors'); } catch { return []; }
};

// 2. 서브섹터(소분류) 상세 조회
export const getSubsector = async (id) => {
  try { return await http(`/subsectors/${id}`); } catch { return null; }
};

// 보강: 단일 섹터 상세(서브섹터 포함 가능) 조회 시도
export const getSector = async (id) => {
  try { return await http(`/sectors/${id}`); } catch { return null; }
};

// 섹터별 서브섹터 목록 조회: 다양한 백엔드 변형에 대응
export const getSubsectorsBySectorId = async (sectorId) => {
  // 1) /sectors/{id} 에 subsectors 포함되어 오는 경우
  try {
    const s = await getSector(sectorId);
    if (Array.isArray(s?.subsectors) && s.subsectors.length) return s.subsectors;
  } catch (_) {}
  // 2) /sectors/{id}/subsectors
  try {
    const arr = await http(`/sectors/${sectorId}/subsectors`);
    if (Array.isArray(arr)) return arr;
  } catch (_) {}
  // 3) /subsectors?sectorId=
  try {
    const arr = await http(`/subsectors?sectorId=${encodeURIComponent(sectorId)}`);
    if (Array.isArray(arr)) return arr;
  } catch (_) {}
  return [];
};

// 섹터 + 서브섹터 트리를 한 번에 구성
export const getSectorsWithSubsectors = async () => {
  const sectors = await getSectors();
  const list = Array.isArray(sectors) ? sectors : [];
  const enriched = await Promise.all(list.map(async (sec) => {
    const id = sec.id ?? sec.sectorId ?? sec.code;
    let subsectors = Array.isArray(sec.subsectors) ? sec.subsectors : [];
    if (!subsectors.length && id != null) subsectors = await getSubsectorsBySectorId(id);
    // 표준화: id/name 필드 보정
    const normSubs = subsectors.map(ss => ({
      id: ss.id ?? ss.subsectorId ?? ss.code,
      name: ss.name ?? ss.title ?? ss.subsectorName ?? ss.label ?? String(ss.id ?? ''),
    }));
    return {
      id: id,
      name: sec.name ?? sec.title ?? sec.sectorName ?? sec.label ?? String(id ?? ''),
      subsectors: normSubs,
    };
  }));
  return enriched;
};

// 3. 레벨별 퀴즈 목록 및 상태 조회
export const getLevelQuizzes = async (levelId, userId, token) => {
  const uid = withUserId(userId);
  const lid = coerceLevelId(levelId);
    try { 
    const levelData = await http(`/levels/${lid}/quizzes?userId=${uid}`);
      const quizzes = Array.isArray(levelData?.quizzes)
        ? levelData.quizzes
        : (Array.isArray(levelData) ? levelData : []);
      return quizzes;
    } catch { return []; }
};

// 4. 레벨별 진행도 조회
export const getLevelProgress = async (levelId, userId, token) => {
  const uid = withUserId(userId);
  const lid = coerceLevelId(levelId);
  try { return await http(`/levels/${lid}/progress?userId=${uid}`, {}, token); } catch { return null; }
};

// (이전 submitAnswer / completeQuiz / progress 관련 구버전 함수 제거됨)

// 회원가입 - 백엔드: POST /api/auth/signup
export const signup = async (username, email, password) => {
  try {
    const result = await http("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        username: username,
        email: email,
        password: password
      })
    });
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.log('🎯 더미 회원가입 응답 사용:', error.message);
    return {
      success: true,
      data: {
        id: Date.now(),
        username: username,
        email: email,
        message: "더미 데이터로 회원가입 성공"
      },
      isDummy: true
    };
  }
};

// 로그인 - 백엔드: POST /api/auth/login
export const login = async (username, password) => {
  try {
    const result = await http("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: username,
        password: password
      })
    });
    
    // JWT 토큰 저장
    if (result.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('username', result.username);
    }
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.log('🎯 더미 로그인 응답 사용:', error.message);
    
    // 더미 토큰 저장
    const dummyToken = 'dummy_jwt_token_' + Date.now();
    localStorage.setItem('accessToken', dummyToken);
    localStorage.setItem('username', username);
    
    return {
      success: true,
      data: {
        accessToken: dummyToken,
        username: username,
        message: "더미 데이터로 로그인 성공"
      },
      isDummy: true
    };
  }
};

// ========================================
// 🔄 기존 함수들 (호환성 유지)
// ========================================

// 기존 getQuestions 함수 -> 더미 데이터 우선 사용
// Always fetch 4 questions per topic/subtopic/level, matching backend contract
export const getQuestions = async ({ levelId }) => {
  if (!levelId) return { questions: [], totalCount: 0, quizId: null };
  try {
    // 1) 레벨의 퀴즈 목록 조회
    const meta = await http(`/api/levels/${levelId}/quizzes`);
    const quizList = Array.isArray(meta?.quizzes) ? meta.quizzes : (Array.isArray(meta) ? meta : []);
    if (!quizList.length) return { questions: [], totalCount: 0, quizId: null };
    // 첫 번째 퀴즈 ID 선택 (필요시 우선순위 로직 향후 확장 가능)
    const quizId = quizList[0].id || quizList[0].quizId;
    if (!quizId) return { questions: [], totalCount: 0, quizId: null };
    // 2) 퀴즈 상세 조회
    const detail = await http(`/api/quizzes/${quizId}`);
    const norm = normalizeQuizPayload(detail) || { questions: [] };
    const questions = Array.isArray(norm.questions) ? norm.questions : [];
    return { questions, totalCount: questions.length, quizId };
  } catch (e) {
    console.error('getQuestions API 호출 실패:', e.message);
    return { questions: [], totalCount: 0, quizId: null, error: e.message };
  }
};

// getLevelMeta / getKeyPoints 제거 → 퀴즈 상세 응답에 포함된 필드 직접 사용

// Subsector -> Levels 목록 조회 (예상 엔드포인트 구조)
export const getLevelsBySubsector = async (subsectorId) => {
  if (!subsectorId) return [];
  try {
    const detail = await http(`/api/subsectors/${subsectorId}`);
    return Array.isArray(detail?.levels) ? detail.levels : [];
  } catch { return []; }
};

// 답안 제출 (사양: POST /api/quizzes/submit-answer)
export const submitAnswer = async ({ quizId, questionId, selectedOptionId }) => {
  return await http('/api/quizzes/submit-answer', {
    method: 'POST',
    body: JSON.stringify({ quizId, questionId, selectedOptionId }),
  });
};

// 퀴즈 완료 (사양: POST /api/quizzes/{id}/complete)
export const completeQuiz = async (quizId) => {
  return await http(`/api/quizzes/${quizId}/complete`, { method: 'POST' });
};

// 폴백 함수들 (하위 호환성) - 더미 데이터 사용
export const getTopics = async () => {
  // 현재 백엔드 스펙에 /topics는 없음 → 빈 배열 반환
  return [];
};

export const getLevels = async () => {
  // 백엔드에는 "레벨 목록" 전용 엔드포인트가 명세되어 있지 않음 → 빈 배열 반환
  return [];
};

// UI 편의 래퍼: 단일 문항 답안 제출
export const postAttempt = ({ quizId, questionId, selectedOptionId, userId, token }) =>
  submitAnswer({ quizId, questionId, selectedOptionId, userId, token });

// 토픽별 통계 조회
export const getTopicStats = async () => {
  // 백엔드 스펙에 /topic-stats 없음 → 빈 객체/배열 반환
  return [];
};
