// src/api/explore.js - 백엔드 API 연동
import { API_BASE } from './config';
import { guestLogin } from './auth';

// [ARTICLE STATIC MAP] (id, title, image_url)
const ARTICLE_STATIC_MAP = {
  '1_1_1': { title: '금융권1', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/1/1-1/banking_finance-jobs_ARTICLE_1.png' },
  '1_1_2': { title: '금융권2', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/1/1-1/banking_finance-jobs_ARTICLE_2.png' },
  '1_1_3': { title: '금융권3', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/1/1-1/banking_finance-jobs_ARTICLE_3.png' },
  '1_2_1': { title: '예금/적금1', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/1/1-2/banking_deposits_ARTICLE_1.png' },
  '1_2_2': { title: '예금/적금2', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/1/1-2/banking_deposits_ARTICLE_2.png' },
  '1_2_3': { title: '예금/적금3', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/1/1-2/banking_deposits_ARTICLE_3.png' },
  '1_3_1': { title: '계좌1', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/1/1-3/banking_accounts_ARTICLE_1.png' },
  '1_3_2': { title: '계좌2', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/1/1-3/banking_accounts_ARTICLE_2.png' },
  '1_3_3': { title: '계좌3', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/1/1-3/banking_accounts_ARTICLE_3.png' },
  '1_4_1': { title: '대출1', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/1/1-5/banking_loans_ARTICLE_1.png' },
  '1_4_2': { title: '대출2', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/1/1-5/banking_loans_ARTICLE_2.png' },
  '1_4_3': { title: '대출3', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/1/1-5/banking_loans_ARTICLE_3.png' },
  '2_1_1': { title: '카드1', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/2/2-1/card_card_ARTICLE_1.png' },
  '2_1_2': { title: '카드2', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/2/2-1/card_card_ARTICLE_2.png' },
  '2_1_3': { title: '카드3', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/2/2-1/card_card_ARTICLE_3.png' },
  '3_1_1': { title: '투자1', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/3/3-1/investment_investment_ARTICLE_1.png' },
  '3_1_2': { title: '투자2', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/3/3-1/investment_investment_ARTICLE_2.png' },
  '3_1_3': { title: '투자3', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/3/3-1/investment_investment_ARTICLE_3.png' },
  '4_1_1': { title: '세금1', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/4/4-1/tax_tax_ARTICLE_1.png' },
  '4_1_2': { title: '세금2', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/4/4-1/tax_tax_ARTICLE_2.png' },
  '4_1_3': { title: '세금3', imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/fin.img99/4/4-1/tax_tax_ARTICLE_3.png' },
};

// 백엔드 연결 상태 확인 (정보용)
let isBackendConnected = true; // 낙관적으로 시작하여 건강 체크 실패로 기능이 막히지 않게 함
let authInitialized = false;

// 백엔드 연결 상태 체크 함수
async function checkBackendConnection() {
  // 모든 건강 체크 엔드포인트는 백엔드 표준 prefix /api 사용
  const baseHasApiSuffix = /\/api\/?$/.test(API_BASE);
  const apiPrefix = baseHasApiSuffix ? '' : '/api';
  const candidates = [
    `${apiPrefix}/health`,
    `${apiPrefix}/actuator/health`,
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

// ✅ 레벨 키(한글/영문 라벨 포함) → 백엔드에서 기대하는 숫자 ID로 보정
function coerceLevelId(levelId) {
  if (typeof levelId === 'number' && Number.isFinite(levelId)) return levelId;
  if (!levelId) return null;

  const s = String(levelId).trim().toLowerCase();
  if (!s) return null;

  // 한글/영문 난이도 라벨 매핑
  if (/초|입문|beginner|easy/.test(s)) return 1;
  if (/중|intermediate|medium/.test(s)) return 2;
  if (/고|advanced|hard/.test(s)) return 3;

  const n = Number(s);
  if (Number.isFinite(n)) return n;

  console.warn('⚠️ 알 수 없는 levelId, 기본값 1로 대체됨:', s);
  return 1;
}

// JWT 토큰을 자동으로 헤더에 포함하는 fetch 함수
async function ensureAuth() {
  if (authInitialized) return;
  const hasToken = !!localStorage.getItem('accessToken');
  const isGuestSession = sessionStorage.getItem('guest') === '1';
  // TTL(24h) 만료 여부
  let ttlExpired = false;
  try {
    const at = Number(localStorage.getItem('guestLoginAt')) || 0;
    if (at > 0) {
      const elapsedMs = Date.now() - at;
      const DAY_MS = 24 * 60 * 60 * 1000;
      ttlExpired = elapsedMs >= DAY_MS;
    }
  } catch (_) {}

  // 게스트 세션이면 매 진입 시 갱신, 아니면 토큰 없거나 TTL 만료 시 로그인
  if (isGuestSession || !hasToken || ttlExpired) {
    try { await guestLogin(API_BASE); } catch (_) {}
  }
  authInitialized = true;
}

async function http(path, opts = {}, token) {
  // 게스트 로그인 토큰 확보 (최초 1회)
  await ensureAuth();
  const jwt = opts.token || token || localStorage.getItem('accessToken');
  const silent = !!opts.silent;

  // 경로 보정: API_BASE(/api 여부)와 path(/api 여부) 중복/누락 없이 합치기
  // 끝 슬래시 제거 (윈도우/리눅스 모두 호환)
  const base = String(API_BASE || '').replace(/\/+$/, '');
  const baseHasApi = /\/api$/i.test(base);
  let p = typeof path === 'string' ? path : '';
  if (!p.startsWith('/')) p = `/${p}`;
  // base가 /api로 끝나고 p가 /api/...로 시작하면 p의 /api 제거
  if (baseHasApi && p.startsWith('/api/')) {
    p = p.replace(/^\/api/, '');
  }
  // base가 /api로 끝나지 않고 p가 /api로 시작하지 않으면 /api 접두사 추가
  if (!baseHasApi && !p.startsWith('/api/')) {
    p = `/api${p}`;
  }

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;

  // 콘솔에 모든 요청 정보 출력
  try {
    if (!silent) {
      console.log('[API 요청]', {
        url: `${base}${p}`,
        method: opts.method || 'GET',
        body: opts.body ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : undefined,
        headers,
        token: jwt ? '***' : undefined
      });
    }
  } catch (_) {}

  let res;
  try {
    res = await fetch(`${base}${p}`, {
      headers,
      credentials: 'include',
      ...opts,
    });
    // 응답 상태 출력
    if (!silent) {
      console.log('[API 응답]', {
        url: `${base}${p}`,
        status: res.status,
        ok: res.ok,
        statusText: res.statusText
      });
    }
    if (!res.ok) {
      let bodyText = '';
      try { bodyText = await res.text(); } catch (_) {}
      const msg = bodyText ? `${res.statusText} ${bodyText}` : res.statusText;
      if (!silent) {
        console.error('[API 에러]', {
          url: `${base}${p}`,
          status: res.status,
          statusText: res.statusText,
          body: bodyText
        });
      }
      throw new Error(`HTTP ${res.status}: ${msg}`);
    }
    // 응답 본문(json)도 출력
    let json;
    try {
      json = await res.clone().json();
      if (!silent) console.log('[API 응답 본문]', json);
    } catch (_) {}
    return await res.json();
  } catch (err) {
    if (!silent) console.error('[API fetch 실패]', err);
    throw err;
  }
}

// ========================================
// 📰 기사 정보 직접 조회 유틸 (id / code / slug / path 모두 시도)
// ========================================
async function fetchArticleByRef({ id, code, slug, path }) {
  // 이미 충분한 정보가 없으면 조기 종료
  if (id == null && !code && !slug && !path) return null;

  const tryList = [];
  const enc = encodeURIComponent;

  // 1) ID로 직접 조회
  if (id != null) {
    const numId = Number(id);
    if (Number.isFinite(numId)) {
      tryList.push(`/articles/${numId}`);
      tryList.push(`/article/${numId}`);
      tryList.push(`/articles/detail/${numId}`);
      tryList.push(`/articles?id=${enc(numId)}`);
    } else {
      // 문자열 ID인 경우도 대비
      tryList.push(`/articles/${enc(String(id))}`);
      tryList.push(`/articles?id=${enc(String(id))}`);
    }
  }

  // 2) 코드 기반 조회
  if (code) {
    tryList.push(`/articles/by-code/${enc(code)}`);
    tryList.push(`/articles?code=${enc(code)}`);
    tryList.push(`/articles/search?code=${enc(code)}`);
  }

  // 3) 슬러그 기반 조회
  if (slug) {
    tryList.push(`/articles/by-slug/${enc(slug)}`);
    tryList.push(`/articles?slug=${enc(slug)}`);
    tryList.push(`/articles/search?slug=${enc(slug)}`);
  }

  // 4) 경로 기반 조회
  if (path) {
    tryList.push(`/articles/by-path?path=${enc(path)}`);
    tryList.push(`/articles?path=${enc(path)}`);
    tryList.push(`/articles/search?path=${enc(path)}`);
  }

  for (const p of tryList) {
    try {
      const res = await http(p);
      if (res && typeof res === 'object') {
        // 배열로 내려오는 경우 첫 요소 사용
        if (Array.isArray(res)) {
          if (res.length === 0) continue;
          return res[0];
        }
        return res;
      }
    } catch (_) {
      // 다음 시도
    }
  }
  return null;
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
    const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
    const levelData = await http(`/levels/${lid}/quizzes${qs}`, {}, token);
    const quizzes = Array.isArray(levelData?.quizzes)
      ? levelData.quizzes
      : (Array.isArray(levelData) ? levelData : []);
    return quizzes;
  } catch {
    return [];
  }
};

// 4. 레벨별 진행도 조회
export const getLevelProgress = async (levelId, userId, token) => {
  const uid = withUserId(userId);
  const lid = coerceLevelId(levelId);
  try {
    const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
    const data = await http(`/levels/${lid}/progress${qs}`, {}, token);
    try {
      console.log('[Progress] getLevelProgress URL:', `/levels/${lid}/progress${qs}`);
      console.log('[Progress] getLevelProgress raw:', data);
      const summary = data && typeof data === 'object' ? {
        isCompleted: !!data.isCompleted,
        completionRate: Number(data.completionRate ?? data.rate ?? 0),
        completedQuizzes: Number(data.completedQuizzes ?? data.done ?? 0),
        totalQuizzes: Number(data.totalQuizzes ?? data.total ?? 0),
        quizzesSample: Array.isArray(data.quizzes) ? data.quizzes.slice(0, 5).map(q => ({ id: q.id, isCompleted: !!q.isCompleted })) : [],
      } : null;
      console.log('[Progress] getLevelProgress summary:', summary);
      if (typeof window !== 'undefined') {
        window.__LEVEL_PROGRESS_LAST = { url: `/levels/${lid}/progress${qs}`, raw: data, summary };
      }
    } catch (_) {}
    return data;
  } catch {
    return null;
  }
};

// 4b. 서브섹터 진행도 조회: GET /api/subsectors/{id}/progress?userId=
export const getSubsectorProgress = async (subsectorId, userId, token) => {
  const uid = withUserId(userId);
  const sid = Number(subsectorId);
  if (!Number.isFinite(sid)) return null;
  try {
    const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
    const data = await http(`/subsectors/${sid}/progress${qs}`, {}, token);
    try {
      console.log('[Progress] getSubsectorProgress raw:', data);
      if (typeof window !== 'undefined') {
        window.__SUBSECTOR_PROGRESS_LAST = { subsectorId: sid, userId: uid, raw: data };
      }
    } catch (_) {}
    return data;
  } catch (e) {
    console.warn('[Progress] getSubsectorProgress failed:', e?.message || e);
    return null;
  }
};

// 7️⃣ 사용자 전체 진행 상황 조회: GET /api/users/{userId}/progress
export const getUserProgress = async (userId, token) => {
  const uid = withUserId(userId);
  if (!uid) return null;
  try {
    const data = await http(`/users/${encodeURIComponent(uid)}/progress`, {}, token);
    try {
      console.log('[UserProgress] /users/{id}/progress raw:', data);
      if (typeof window !== 'undefined') {
        window.__USER_PROGRESS_LAST = { userId: uid, raw: data };
      }
    } catch (_) {}
    return data;
  } catch (e) {
    console.warn('[UserProgress] fetch failed:', e?.message || e);
    return null;
  }
};

// 레벨 상세 정보 조회: desc/goal/levelNumber/title 등 보강용
export const getLevelDetail = async (levelId) => {
  const id = coerceLevelId(levelId);
  if (!id) return null;
  try {
    const p = `/levels/${id}`;
    const res = await http(p, { silent: true });
    if (res && typeof res === 'object') {
      const pick = (...keys) => {
        for (const k of keys) {
          const v = res?.[k];
          if (v != null && v !== '') return v;
        }
        return undefined;
      };
      const entityId = res.id ?? res.levelId ?? id;
      const levelNo = pick('level_number','levelNumber','level_no','levelNo','number','difficulty','rank');
      const title = pick('title','name','levelTitle') ?? (levelNo ? `레벨 ${levelNo}` : `레벨 ${entityId}`);
      const goal = pick('learning_goal','learningGoal','goal','objective','objective_md','objectiveMd','learningGoalMd');
      const desc = pick('description','desc','summary','overview','description_md','desc_md','summary_md','overview_md','details','details_md');
      return {
        id: entityId,
        title,
        levelNumber: Number.isFinite(Number(levelNo)) ? Number(levelNo) : undefined,
        goal: goal ?? '',
        desc: desc ?? '',
        raw: res,
      };
    }
  } catch (_) { /* ignore */ }
  return null;
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
// 최소 정규화: 백엔드 응답을 UI에서 기대하는 필드로 얇게 변환
function normalizeQuizPayload(raw) {
  if (!raw) return null;

  const firstArray = (...cands) => cands.find(Array.isArray) || [];

  // 1) 질문 배열 추출
  let qs = firstArray(
    raw.questions,
    raw.items,
    raw.data?.questions,
    raw.content?.questions,
    raw.results?.questions,
    raw.data,
    raw.content,
    raw.results
  );

  // 2) 기사 배열 매핑(aMap) 제거: 백엔드가 각 질문에 article을 포함해 내려준다고 가정

  // 3) 키포인트 배열과 매핑 테이블 (옵션)
  const keyPoints = firstArray(
    raw.keyPoints,
    raw.data?.keyPoints,
    raw.content?.keyPoints,
    raw.results?.keyPoints
  );
  const kMap = keyPoints.reduce((m, k) => {
    const kid = k.id ?? k.keyPointId ?? k.key_point_id;
    if (kid != null) {
      m[Number(kid)] = {
        title: k.title || k.keyPointTitle,
        body: k.body || k.keyPointBody,
      };
    }
    return m;
  }, {});
  console.log('Normalized Key Points:', kMap);

  // 4) 정렬
  qs = Array.isArray(qs)
    ? [...qs].sort((a, b) => {
        const sa = Number(a?.sortOrder ?? a?.order ?? a?.sort_order ?? a?.id ?? 0);
        const sb = Number(b?.sortOrder ?? b?.order ?? b?.sort_order ?? b?.id ?? 0);
        return sa - sb;
      })
    : [];

  console.log('normalizeQuizPayload Input:', raw);
  console.log('normalizeQuizPayload Questions count:', Array.isArray(qs) ? qs.length : 0);

  // 5) 질문 정규화
  const normalizedQuestions = qs.map((q, i) => {
  // ✅ 백엔드가 주는 article 객체만 사용 (평탄화)
  if (q && typeof q.article === 'object' && q.article) {
    const a = q.article;
    q.articleId = a.id ?? a.articleId ?? a.articleCode ?? a.article_id;
    q.articleTitleMd = a.title ?? q.articleTitleMd;
    q.articleBodyMd = a.body ?? q.articleBodyMd;
    const img = a.imageUrl ?? a.image ?? a.image_url ?? a.thumbnail ?? a.coverImage;
    if (img) {
      q.image = q.image ?? img;
      q.imageUrl = q.imageUrl ?? img;
      q.articleImageUrl = q.articleImageUrl ?? img;
    }
    q.articleSource = a.sourceNote ?? a.source ?? q.articleSource;
  }
  // [가상 기사 보강] articleId만 있고 article 객체가 없거나, 이미지가 없으면 static map에서 보강
  if (
    (!q.article || typeof q.article !== 'object') &&
    (q.articleId || q.article_id) &&
    (q.type === 'article' || q.type === 'ARTICLE')
  ) {
    const aid = String(q.articleId ?? q.article_id);
    const staticArticle = ARTICLE_STATIC_MAP[aid];
    if (staticArticle) {
      q.article = { id: aid, ...staticArticle };
      q.articleTitleMd = q.articleTitleMd ?? staticArticle.title;
      q.articleImageUrl = q.articleImageUrl ?? staticArticle.imageUrl;
      q.imageUrl = q.imageUrl ?? staticArticle.imageUrl;
      q.image = q.image ?? staticArticle.imageUrl;
    }
  }
  // 🩶 Fallback: article 객체가 없고 articleId만 제공될 때 임시 article 구성
  if ((!q || !q.article) && (q?.articleId != null || q?.article_id != null)) {
    const aid = q.articleId ?? q.article_id;
    q.article = { id: aid };
  }
  const articleId = q?.articleId ?? q?.article_id ?? q?.article?.id ?? undefined;
  const articleFromQ = (q && typeof q.article === 'object') ? q.article : undefined;
    const storyId = Number(q.storyId ?? q.story_id ?? q.stoy_id ?? q.story?.id);
  const correctIdRaw = q.correctOptionId ?? q.correct_option_id ?? q.answerId ?? q.answer_id;
    const correctIdxRaw = q.correctIndex ?? q.correct_index ?? q.answerIndex ?? q.answer_index;
    const correctLetterRaw = q.correctOption ?? q.correct_option ?? q.correctLetter ?? q.correct_letter;
  const correctTextRaw = q.correctAnswer ?? q.correct_answer ?? q.answerText ?? q.correctText ?? q.correct_text;

    // 원시 옵션 목록 및 텍스트 도출 함수
    const rawOptions = Array.isArray(q.options) ? q.options : [];

    // 인덱스/레터/텍스트 기반 정답 인덱스 도출
    let derivedCorrectIdx = -1;
    if (Number.isFinite(Number(correctIdxRaw))) {
      const n = typeof correctIdxRaw === 'string' ? parseInt(correctIdxRaw, 10) : correctIdxRaw;
      if (Number.isFinite(n)) {
        if (n >= 1 && n <= rawOptions.length) derivedCorrectIdx = n - 1;
        else if (n >= 0 && n < rawOptions.length) derivedCorrectIdx = n;
      }
    }
    if (derivedCorrectIdx < 0 && typeof correctLetterRaw === 'string' && /^[A-Za-z]$/.test(correctLetterRaw.trim())) {
      const idx = correctLetterRaw.trim().toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
      if (idx >= 0 && idx < rawOptions.length) derivedCorrectIdx = idx;
    }
    if (derivedCorrectIdx < 0 && typeof correctTextRaw === 'string' && correctTextRaw.trim()) {
      const target = correctTextRaw.trim();
      const idx = rawOptions.findIndex((o) => (o?.text ?? o?.contentMd ?? o?.content ?? o?.content_md ?? '').trim() === target);
      if (idx >= 0) derivedCorrectIdx = idx;
    }

    const options = rawOptions.map((o, idx) => {
      const oidRaw = o.id ?? o.optionId ?? o.option_id;
      const oidNum = Number(oidRaw);
      // id 폴백: 원본 id가 없으면 1-based 인덱스를 id로 부여 (로컬 채점/기록 보강)
      const oid = Number.isFinite(oidNum) ? oidNum : (oidRaw != null ? String(oidRaw) : (idx + 1));
      const contentMd = o.contentMd ?? o.text ?? o.content ?? o.content_md;

      // ✅ 우선순위: isCorrect 필드군 → 없으면 correctOptionId 비교 → 최종 false
      let isCorrect;
      if (typeof o.isCorrect === 'boolean') {
        isCorrect = o.isCorrect;
      } else if (o.correct === true || o.is_answer === true) {
        isCorrect = true;
      } else if (correctIdRaw != null) {
        const a = String(oidRaw);
        const b = String(correctIdRaw);
        isCorrect = a === b;
      } else if (typeof correctTextRaw === 'string' && correctTextRaw.trim()) {
        const norm = (t) => (typeof t === 'string' ? t.trim() : '');
        const cand = norm(contentMd);
        const target = norm(correctTextRaw);
        isCorrect = cand && target && cand === target;
      } else if (derivedCorrectIdx >= 0) {
        isCorrect = idx === derivedCorrectIdx;
      } else {
        isCorrect = false;
      }

      return { id: oid, label: o.label, text: o.text ?? contentMd, contentMd, isCorrect };
    });

    // 보조: 정답 인덱스/레터를 통해 correctOptionId 추론
    let effectiveCorrectId = correctIdRaw;
    if (effectiveCorrectId == null && Array.isArray(q.options) && q.options.length) {
      const n = typeof correctIdxRaw === 'string' ? parseInt(correctIdxRaw, 10) : correctIdxRaw;
      if (Number.isFinite(n)) {
        // 1-based 우선 처리 후 0-based 처리
        if (n >= 1 && n <= q.options.length) effectiveCorrectId = q.options[n - 1]?.id ?? q.options[n - 1]?.optionId ?? q.options[n - 1]?.option_id;
        else if (n >= 0 && n < q.options.length) effectiveCorrectId = q.options[n]?.id ?? q.options[n]?.optionId ?? q.options[n]?.option_id;
      }
      if (effectiveCorrectId == null && typeof correctLetterRaw === 'string' && /^[A-Za-z]$/.test(correctLetterRaw.trim())) {
        const idx = correctLetterRaw.trim().toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
        if (idx >= 0 && idx < q.options.length) {
          effectiveCorrectId = q.options[idx]?.id ?? q.options[idx]?.optionId ?? q.options[idx]?.option_id;
        }
      }
      // 보조: 텍스트/인덱스 일치 기반 정답 id 추론
      if (effectiveCorrectId == null) {
        let idxByText = -1;
        if (typeof correctTextRaw === 'string' && correctTextRaw.trim()) {
          const target = correctTextRaw.trim();
          idxByText = options.findIndex(o => (o?.text ?? o?.contentMd ?? '').trim() === target);
        }
        const idx = derivedCorrectIdx >= 0 ? derivedCorrectIdx : idxByText;
        if (idx >= 0 && idx < options.length) {
          effectiveCorrectId = options[idx]?.id;
        }
      }
    }

    try {
      const qidLog = q.id ?? q.questionId ?? q.question_id ?? i;
      const qType = (q.type || '').toString();
      const hasImg = !!(q?.image || q?.imageUrl || q?.articleImageUrl || q?.article?.imageUrl);
      console.log('[normalize] question', { qid: qidLog, type: qType, articleId, hasImg });
    } catch (_) {}

    const normalized = {
      id: Number(q.id ?? q.questionId ?? q.question_id) || i,
      // Preserve original question_id/code string (e.g., "QST_04") for local mapping
      questionIdRaw: (q.questionId ?? q.question_id ?? q.code ?? q.questionCode ?? q.question_code ?? q.id) != null
        ? String(q.questionId ?? q.question_id ?? q.code ?? q.questionCode ?? q.question_code ?? q.id)
        : undefined,
      sortOrder: Number(q.sortOrder ?? q.order ?? q.sort_order ?? i),
      type: q.type || q.questionType || q.kind || undefined,
      stemMd: q.stemMd || q.stem_md || q.questionText || q.question_text || q.prompt || q.title || q.text,
      options,
      // 정답 ID는 원본 타입 보존(문자/숫자) + 인덱스/레터 기반 추론값 포함
      correctOptionId: effectiveCorrectId ?? undefined,
      // story/article
    storyId: Number.isFinite(storyId) ? storyId : undefined,
  storyTitleMd: q.storyTitleMd || q.storyTitle || q.story_title,
  storyBodyMd: q.storyBodyMd || q.storyBody || q.story_body,
  articleId: articleId,
      articleTitleMd: q.articleTitleMd || q.articleTitle || q.article?.title,
      articleBodyMd: q.articleBodyMd || q.articleBody || q.article?.body,
      image: (
        q.image || q.imageUrl || q.imageURL || q.articleImage || q.articleImageUrl || q.article_image_url ||
        q.article?.imageUrl || q.article?.image_url || q.article?.thumbnail || q.article?.coverImage
      ),
      imageUrl: (q.imageUrl || q.articleImageUrl || q.article_image_url || q.article?.imageUrl) ?? undefined,
      articleImageUrl: (q.articleImageUrl || q.imageUrl || q.article_image_url || q.article?.imageUrl) ?? undefined,
      article: articleFromQ,
      articleSource: q.articleSource || q.article?.sourceNote || q.article?.source || undefined,
      // learning/hints/explanations
      hintMd: q.hintMd || q.hint_md || q.hint,
      answerExplanationMd: q.answerExplanationMd || q.explanationMd || q.explanation || q.answer_explanation_md,
      solvingKeypointsMd: q.solvingKeypointsMd || q.keypointsMd || q.keyPointsMd || q.key_points_md,
      teachingExplainerMd: q.teachingExplainerMd || q.explainerMd || q.explainer_md,
      // keyPoint metadata (optional)
      keyPointId: Number(q.keyPointId ?? q.key_point_id),
      keyPointTitle: kMap[Number(q.keyPointId ?? q.key_point_id)]?.title,
      keyPointBody: kMap[Number(q.keyPointId ?? q.key_point_id)]?.body,
      // 🔎 원본 문항 메타데이터 보존: 섹터/서브주제/레벨 (ARTICLE 코드 계산용)
      mainSectorId: q.mainSectorId ?? q.categoryId ?? q.mainCategoryId,
      categoryId: q.categoryId,
      mainCategoryId: q.mainCategoryId,
      subsectorId: q.subsectorId ?? q.subsector_id ?? q.topicId ?? q.subCategoryId,
      topicId: q.topicId,
      subCategoryId: q.subCategoryId,
      levelId: q.levelId ?? q.level_id ?? q.levelNumber ?? q.stage,
      levelNumber: q.levelNumber ?? q.level_number ?? q.levelNo ?? q.level_no ?? q.stage,
    };

    // 디버그: 각 문제의 정답 요약 로그 (필요 시 주석처리 가능)
    try {
      const optSummary = (normalized.options || []).map(o => ({ id: o.id, label: o.label, isCorrect: o.isCorrect }));
      console.log('[정규화 정답 체크]', { qid: normalized.id, correctOptionId: normalized.correctOptionId, options: optSummary });
    } catch (_) {}

    return normalized;
  });

  return {
    id: Number(raw.id ?? raw.quizId ?? raw.quiz_id) || null,
    questions: normalizedQuestions,
  };
}


// 퀴즈 단건 상세 조회: quizId로 직접 호출 (백엔드가 기사 포함해 내려줌)
export const getQuizById = async (quizId, userId) => {
  const uid = withUserId(userId);
  const id = Number(quizId);
  if (!Number.isFinite(id)) {
    return { questions: [], totalCount: 0, quizId: null, error: '유효하지 않은 quizId' };
  }
  const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
  const tryPaths = [
    `/quizzes/${id}${qs}`,
    `/quiz/${id}${qs}`,
    `/quizzes/detail/${id}${qs}`,
    `/quizzes?id=${encodeURIComponent(id)}${uid ? `&userId=${encodeURIComponent(uid)}` : ''}`,
  ];
  for (const p of tryPaths) {
    try {
      console.log('[getQuizById] 요청 경로:', p);
      const response = await http(p);
      console.log('[getQuizById] Response:', response);
      if (response && typeof response === 'object') {
        const norm = normalizeQuizPayload(response);
        let questions = Array.isArray(norm?.questions) ? norm.questions.slice(0, 4) : [];

        // 🎯 ARTICLE_STATIC_MAP 자동 매핑 (문항별 계산: (대주제ID)(서브주제ID)(레벨ID))
        try {
          const normTo13 = (v) => {
            if (v == null) return undefined;
            const s = String(v).trim().toLowerCase();
            if (/고|상급|고급자|advanced|hard/.test(s)) return 3;
            if (/중|intermediate|medium/.test(s)) return 2;
            if (/초|입문|beginner|easy/.test(s)) return 1;
            const n = Number(s);
            if (Number.isFinite(n) && n >= 1 && n <= 3) return n;
            return undefined;
          };
          const num = (v) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : undefined;
          };
          // quizId → articleCode 매핑 테이블 (getQuestions와 동일하게 유지)
          const quizToArticleMap = {
            1: '1_1_1', 2: '1_1_2', 3: '1_1_3',
            4: '1_2_1', 5: '1_2_2', 6: '1_2_3',
            7: '1_3_1', 8: '1_3_2', 9: '1_3_3',
            10: '1_4_1', 11: '1_4_2', 12: '1_4_3',
            13: '2_1_1', 14: '2_1_2', 15: '2_1_3',
            16: '3_1_1', 17: '3_1_2', 18: '3_1_3',
            19: '4_1_1', 20: '4_1_2', 21: '4_1_3',
          };
          questions = questions.map((q, idx) => {
            if (String(q?.type || '').toLowerCase() === 'article') {
              // 우선 quizId 기반 articleCode 매핑
              let articleCode = quizToArticleMap[quizId];
              // quizId가 매핑되지 않으면 기존 방식 fallback
              if (!articleCode) {
                let mainId = num(q.mainSectorId) ?? num(q.categoryId) ?? num(q.mainCategoryId);
                if (!mainId) mainId = num(response?.mainSectorId) ?? num(response?.categoryId) ?? num(response?.sectorId) ?? num(response?.sector?.id) ?? 1;
                let subId = num(q.subsectorId) ?? num(q.topicId) ?? num(q.subCategoryId);
                if (!subId) subId = num(response?.subsectorId) ?? num(response?.subTopicId) ?? num(response?.topicId) ?? num(response?.subsector?.id) ?? num(response?.topic?.id) ?? 1;
                let level = (
                  normTo13(q.levelNumber) ?? normTo13(q.level_number) ?? normTo13(q.levelNo) ?? normTo13(q.level_no) ??
                  normTo13(q.level) ?? normTo13(q.levelId) ?? normTo13(q.stage) ?? normTo13(q.difficulty) ?? normTo13(q.rank) ??
                  normTo13(q.levelName) ?? normTo13(q.level_label) ?? normTo13(q.difficultyLabel) ??
                  normTo13(response?.levelNumber) ?? normTo13(response?.level?.levelNumber) ?? normTo13(response?.level?.number)
                );
                if (!level) level = (idx % 3) + 1;
                articleCode = `${mainId}_${subId}_${level}`;
              }

              try {
                console.log('[ARTICLE_CODE 계산]', {
                  qid: q.id,
                  quizId,
                  idx,
                  articleCode,
                });
              } catch (_) {}

              const staticArticle = ARTICLE_STATIC_MAP[articleCode];
              if (staticArticle) {
                const img = q.image || q.imageUrl || q.articleImageUrl || staticArticle.imageUrl;
                q = {
                  ...q,
                  article: { id: articleCode, code: articleCode, articleCode, ...staticArticle },
                  articleId: q.articleId ?? articleCode,
                  articleCode: q.articleCode ?? articleCode,
                  image: img,
                  imageUrl: staticArticle.imageUrl ?? img,
                  articleImageUrl: staticArticle.imageUrl ?? img,
                  articleTitleMd: staticArticle.title ?? q.articleTitleMd,
                };
                try {
                  console.log(`[ARTICLE 매핑 성공] id=${articleCode}`, { title: q.articleTitleMd, image: q.articleImageUrl });
                } catch (_) {}
              } else {
                try { console.warn(`[ARTICLE_MAP 누락] articleCode=${articleCode}`); } catch (_) {}
              }
            }
            return q;
          });
        } catch (_) {}

        // ✅ 기사/스토리 데이터 보강: article type은 article 테이블에서 직접 조회해 병합
        try {
          // 병렬로 각 문항에 대해 필요한 기사 조회 수행
          const enriched = await Promise.all(
            questions.map(async (q) => {
              // article 타입이 아니면 그대로 반환
              const qType = String(q?.type || '').toLowerCase();
              if (qType !== 'article') return q;

              const existingArticle = q?.article && typeof q.article === 'object' ? q.article : {};
              const hasEssential = !!(q?.articleTitleMd || q?.articleBodyMd || existingArticle?.title || existingArticle?.body);

              // 충분한 정보가 이미 있으면 패스하되 이미지만 보강 시도
              if (hasEssential && (q?.image || q?.imageUrl || q?.articleImageUrl || existingArticle?.imageUrl)) {
                return q;
              }

              const aIdRaw = q?.articleId ?? q?.article_id ?? existingArticle?.id ?? existingArticle?.articleId ?? existingArticle?.article_id;
              const aCode = existingArticle?.code ?? existingArticle?.articleCode;
              const aSlug = existingArticle?.slug ?? existingArticle?.articleSlug;
              const aPath = existingArticle?.path ?? existingArticle?.articlePath;

              let fetched = null;
              try {
                fetched = await fetchArticleByRef({ id: aIdRaw, code: aCode, slug: aSlug, path: aPath });
              } catch (e) {
                console.warn('[getQuizById] fetchArticleByRef 실패:', e?.message || e);
              }

              // static map 보강 (id가 1_1_1 같은 문자열일 수 있음)
              if (!fetched) {
                const aidKey = String(aIdRaw ?? '').trim();
                if (aidKey && ARTICLE_STATIC_MAP[aidKey]) {
                  fetched = { id: aidKey, ...ARTICLE_STATIC_MAP[aidKey] };
                }
              }

              if (!fetched) return q;

              const fetchedImage = fetched.imageUrl ?? fetched.image ?? fetched.image_url ?? fetched.thumbnail ?? fetched.coverImage;
              const mergedArticle = {
                ...(fetched || {}),
                ...(existingArticle || {}),
                id: existingArticle.id ?? fetched.id ?? aIdRaw,
                imageUrl: existingArticle.imageUrl ?? fetchedImage,
              };

              const finalImage = q.image || q.imageUrl || q.articleImageUrl || mergedArticle.imageUrl || fetchedImage;

              return {
                ...q,
                article: mergedArticle,
                articleId: mergedArticle.id ?? q.articleId ?? q.article_id,
                articleTitleMd: q.articleTitleMd ?? mergedArticle.title ?? fetched.title ?? fetched.titleMd ?? fetched.title_md,
                articleBodyMd: q.articleBodyMd ?? mergedArticle.body ?? fetched.body ?? fetched.bodyMd ?? fetched.body_md,
                image: finalImage,
                imageUrl: q.imageUrl ?? mergedArticle.imageUrl ?? finalImage,
                articleImageUrl: q.articleImageUrl ?? mergedArticle.imageUrl ?? finalImage,
                articleSource: q.articleSource ?? mergedArticle.sourceNote ?? mergedArticle.source ?? fetched.sourceNote ?? fetched.source,
              };
            })
          );

          questions = enriched;
        } catch (_) {}

        console.log(
          `[getQuizById] quizId=${id}, 기사 포함 여부:`,
          questions.map((q) => ({ id: q.id, type: q.type, hasArticle: !!q.article, hasImg: !!(q.image || q.imageUrl || q.articleImageUrl || q?.article?.imageUrl) }))
        );
        return { questions, totalCount: questions.length, quizId: id };
      }
    } catch (error) {
      console.error('[getQuizById] Error:', error);
    }
  }
  return { questions: [], totalCount: 0, quizId: id, error: '퀴즈 상세를 불러오지 못했습니다.' };
};

export const getQuestions = async ({ quizId, userId /* topicId, subTopicId, levelId intentionally unused here */ }) => {
  // Spec: GET /api/quizzes/{id} should return full question set, including ARTICLE content when applicable.
  if (!quizId) return { questions: [], totalCount: 0, quizId: null, error: 'quizId is required' };
  const detail = await getQuizById(quizId, userId);
  const questions = Array.isArray(detail?.questions) ? detail.questions : [];
  return { questions, totalCount: questions.length, quizId };
};
// =========================================================
export const getLevelsBySubsector = async (subsectorId) => {
  if (!subsectorId) return [];
  try {
    let raw = [];

    // 1️⃣ /subsectors/{id} 상세 내에 levels 배열이 포함된 경우
    try {
      const detail = await http(`/subsectors/${subsectorId}`);
      const candidateKeys = ['levels', 'levelList', 'levelDtos', 'levelResponses'];
      for (const key of candidateKeys) {
        if (Array.isArray(detail?.[key]) && detail[key].length) {
          raw = detail[key];
          break;
        }
      }
    } catch (e) {
      console.warn('[getLevelsBySubsector] 1단계 실패:', e.message);
    }

    // 2️⃣ /subsectors/{id}/levels
    if (!raw.length) {
      try {
        const arr = await http(`/subsectors/${subsectorId}/levels`);
        if (Array.isArray(arr) && arr.length) raw = arr;
      } catch (_) {}
    }

    // 3️⃣ /levels?subsectorId=
    if (!raw.length) {
      try {
        const arr = await http(`/levels?subsectorId=${encodeURIComponent(subsectorId)}`);
        if (Array.isArray(arr) && arr.length) raw = arr;
      } catch (_) {}
    }

    // 4️⃣ /levels/search?subsectorId=
    if (!raw.length) {
      try {
        const arr = await http(`/levels/search?subsectorId=${encodeURIComponent(subsectorId)}`);
        if (Array.isArray(arr) && arr.length) raw = arr;
      } catch (_) {}
    }

    if (!raw.length) {
      console.warn('[getLevelsBySubsector] subsectorId=', subsectorId, '레벨 데이터 없음');
      return [];
    }

    // ✅ 핵심: 엔티티 PK(id) 고정, levelNumber는 보조 정보
    const mapped = raw.map((l) => {
      const entityId = l.id ?? l.levelId ?? l.level_id; // DB PK
      const levelNo =
        l.level_number ??
        l.levelNumber ??
        l.level_no ??
        l.levelNo ??
        l.number ??
        l.rank ??
        l.difficulty ??
        l.difficulty_level ??
        l.difficultyLevel ??
        undefined;

      const levelNumber = Number.isFinite(Number(levelNo)) ? Number(levelNo) : undefined;
      const id = entityId; // id는 항상 엔티티 PK

      return {
        ...l,
        id,               // PK
        key: id,          // 선택 키도 PK로 고정
        entityId: id,     // 명시적 보존
        title: l.title || l.name || (levelNumber ? `레벨 ${levelNumber}` : `레벨 ${id}`),
        desc: l.description || l.desc || l.summary || '',
        goal: l.learning_goal || l.learningGoal || l.goal || '',
        levelNumber,
      };
    });

    console.log(`[getLevelsBySubsector] subsectorId=${subsectorId}`, mapped);
    return mapped;
  } catch (e) {
    console.warn('[getLevelsBySubsector] 실패:', e.message);
    return [];
  }
};

// Helper: Derive quizId from selection with one lightweight call
export const getQuizIdForSelection = async ({ subTopicId, levelId, userId }) => {
  if (!subTopicId || !levelId) return null;
  const uid = withUserId(userId);
  try {
    // 레벨 번호(1/2/3)를 subsector별 레벨 엔티티 PK로 변환
    const resolvedLevelEntityId = await resolveLevelEntityId({ subTopicId, level: levelId });
    if (!resolvedLevelEntityId) return null;
    const list = await http(`/levels/${resolvedLevelEntityId}/quizzes${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`);
    let arr = Array.isArray(list?.quizzes) ? list.quizzes : (Array.isArray(list) ? list : []);
    if (!arr.length) return null;
    // 1) subsector 우선 매칭 (가능한 경우)
    const toNum = (v) => (v == null ? undefined : Number(v));
    const subMatched = arr.filter((qz) => {
      const ss = toNum(qz.subsectorId ?? qz.subsector_id ?? qz.subsector?.id ?? qz.subTopicId ?? qz.topicId);
      return Number(ss) === Number(subTopicId);
    });
    if (subMatched.length) arr = subMatched;
    // 2) sortOrder 기준 정렬
    const sorted = arr.slice().sort((a,b) => Number(a.sortOrder ?? a.order ?? a.sort_order ?? 0) - Number(b.sortOrder ?? b.order ?? b.sort_order ?? 0));
    // 3) 상태 기반 선호도: IN_PROGRESS > not COMPLETED > fallback first
    const statusStr = (s) => (s ? String(s).toUpperCase() : '');
    const inProgress = sorted.find(q => statusStr(q.status) === 'IN_PROGRESS');
    const notCompleted = sorted.find(q => {
      const st = statusStr(q.status);
      return st && st !== 'COMPLETED' && st !== 'LOCKED';
    });
    const chosen = inProgress || notCompleted || sorted[0];
    const qid = chosen?.id ?? chosen?.quizId ?? chosen?.quiz_id ?? chosen?.quiz?.id ?? chosen?.quiz?.quizId;
    const finalQid = Number.isFinite(Number(qid)) ? Number(qid) : null;
    try { console.log('[getQuizIdForSelection]', { subTopicId, inputLevel: levelId, resolvedLevelEntityId, quizId: finalQid }); } catch (_) {}
    return finalQid;
  } catch (_) {
    return null;
  }
};

// =========================================================
// 레벨 ID 해석기 (엔티티 PK → levelNumber 자동 변환)
// =========================================================
export const resolveLevelEntityId = async ({ subTopicId, level }) => {
  // 숫자/라벨을 우선 숫자로 정규화 (라벨은 1/2/3으로)
  const num = coerceLevelId(level);
  try {
    const levels = await getLevelsBySubsector(subTopicId);
    // 1) num이 3보다 큰 경우 → 이미 엔티티 PK일 가능성 → 존재 여부 확인 후 그대로 반환
    if (Number.isFinite(num) && num > 3) {
      const foundById = levels.find((l) => Number(l.id) === Number(num) || Number(l.entityId) === Number(num));
      if (foundById) {
        return Number(foundById.id ?? foundById.entityId);
      }
    }
    // 2) num이 1/2/3인 경우 → subsector 내 같은 levelNumber의 엔티티를 찾아 PK 반환
    if ([1, 2, 3].includes(num)) {
      const foundByNo = levels.find((l) => Number(l.levelNumber) === Number(num));
      if (foundByNo) {
        return Number(foundByNo.id ?? foundByNo.entityId);
      }
    }
    // 3) 그 외 케이스: 첫 레벨의 PK로 폴백 (UX 보장)
    if (levels.length) {
      console.warn(`[resolveLevelEntityId] 일치하는 레벨 없음, 첫 레벨로 대체: ${levels[0].id}`);
      return Number(levels[0].id);
    }
  } catch (e) {
    console.warn('[resolveLevelEntityId] 변환 실패:', e.message);
  }
  console.warn(`⚠️ [resolveLevelEntityId] 매핑 실패 (${String(level)}), 1로 대체`);
  return 1;
};

// 답안 제출 (사양: POST /api/quizzes/submit-answer)

// 답안 제출 (userId/token 항상 포함)
export const submitAnswer = async ({ quizId, questionId, selectedOptionId, userId, token }) => {
  if (!quizId || !questionId || !selectedOptionId) {
    throw new Error('Missing required fields: quizId, questionId, or selectedOptionId');
  }

  let uid = userId ?? localStorage.getItem('userId') ?? undefined;
  const jwt = token ?? localStorage.getItem('accessToken') ?? undefined;

  // userId가 없으면 게스트 로그인 시도
  if (!uid) {
    console.warn('[submitAnswer] userId not found. Attempting guest login...');
    try {
      const guest = await guestLogin(API_BASE);
      if (guest?.userId) {
        uid = guest.userId;
        localStorage.setItem('userId', uid);
        console.log('[submitAnswer] Guest login successful. userId:', uid);
      } else {
        throw new Error('Guest login did not return a valid userId.');
      }
    } catch (error) {
      console.error('[submitAnswer] Guest login failed:', error);
      throw new Error('Unable to authenticate user. Please try again.');
    }
  }

  const num = (v) => (v == null ? v : (Number.isFinite(Number(v)) ? Number(v) : v));
  const qzIdNum = num(quizId);
  const qIdNum = num(questionId);
  const selIdNum = num(selectedOptionId);
  const uidNum = num(uid);

  const payload = {
    // camelCase 기본
    quizId: qzIdNum,
    questionId: qIdNum,
    selectedOptionId: selIdNum,
    userId: uidNum,
    // 호환 별칭 (다양한 백엔드 매핑 고려)
    optionId: selIdNum,
    answerId: selIdNum,
    // snake_case 중복 제공 (ORM/매퍼 호환)
    user_id: uidNum,
    question_id: qIdNum,
    selected_option_id: selIdNum,
    // answered_at은 서버에서 기록하도록 두되, 필요시 주석 해제
    // answered_at: new Date().toISOString(),
  };

  const headers = {
    'Content-Type': 'application/json',
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
  };

  console.log('[submitAnswer] Sending payload:', payload);

  try {
    const uid = withUserId(uidNum);
    const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
    let response;
    // 1) Preferred: quiz path + submit-answer
    try {
      response = await http(`/quizzes/${qzIdNum}/submit-answer${qs}`,
        { method: 'POST', body: JSON.stringify(payload), headers }, jwt);
    } catch (e1) {
      // 2) Alternative: quiz path + attempt
      try {
        response = await http(`/quizzes/${qzIdNum}/attempt${qs}`,
          { method: 'POST', body: JSON.stringify(payload), headers }, jwt);
      } catch (e2) {
        // 3) Body-driven endpoint
        try {
          response = await http('/quizzes/submit-answer',
            { method: 'POST', body: JSON.stringify(payload), headers }, jwt);
        } catch (e3) {
          // 4) Generic attempts endpoint
          response = await http('/attempts',
            { method: 'POST', body: JSON.stringify(payload), headers }, jwt);
        }
      }
    }

    console.log('[submitAnswer] Raw response:', response);

    // 응답 데이터 처리 및 정규화
    const rawIsCorrect = (
      response?.isCorrect ??
      response?.is_correct ??
      response?.correct ??
      response?.result ??
      response?.status
    );

    let isCorrect = null;
    if (typeof rawIsCorrect === 'boolean') {
      isCorrect = rawIsCorrect;
    } else if (typeof rawIsCorrect === 'number') {
      isCorrect = rawIsCorrect === 1;
    } else if (typeof rawIsCorrect === 'string') {
      const s = rawIsCorrect.trim().toLowerCase();
      if (s === 'true' || s === 'y' || s === 'yes' || s === '1') isCorrect = true;
      else if (s === 'false' || s === 'n' || s === 'no' || s === '0') isCorrect = false;
    }

    const correctOptionId = (
      response?.correctOptionId ??
      response?.correct_option_id ??
      response?.correctId ??
      response?.answerId ??
      null
    );
    const feedback = (
      response?.feedback ??
      response?.explanation ??
      response?.message ??
      null
    );

    console.log('[submitAnswer] Normalized:', { isCorrect, correctOptionId, feedback });
    return { isCorrect, correctOptionId, feedback };
  } catch (error) {
    console.error('[submitAnswer] Request failed:', error);

    // 400 에러 처리: userId가 유효하지 않을 경우 로컬 스토리지 초기화
    if (error.message.includes('User not found')) {
      console.warn('[submitAnswer] Invalid userId detected. Clearing localStorage and retrying guest login.');
      localStorage.removeItem('userId');
      localStorage.removeItem('accessToken');
      try {
        const guest = await guestLogin(API_BASE);
        if (guest?.userId) {
          localStorage.setItem('userId', guest.userId);
          console.log('[submitAnswer] Retried guest login successful. userId:', guest.userId);
        }
      } catch (guestError) {
        console.error('[submitAnswer] Retried guest login failed:', guestError);
      }
    }

    throw error;
  }
};

export const getLevels = async () => {
  // 백엔드에는 "레벨 목록" 전용 엔드포인트가 명세되어 있지 않음 → 빈 배열 반환
  return [];
};

// UI 편의 래퍼: 단일 문항 답안 제출
// postAttempt도 userId/token 항상 전달
export const postAttempt = ({ quizId, questionId, selectedOptionId, userId, token }) =>
  submitAnswer({ quizId, questionId, selectedOptionId, userId, token });

// 레벨 시작 처리: POST /api/levels/{id}/start?userId=...
export const startLevel = async (levelId, userId, token) => {
  const lid = coerceLevelId(levelId);
  if (!Number.isFinite(lid)) throw new Error('Invalid levelId for startLevel');
  const uid = withUserId(userId);
  const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
  return http(`/levels/${lid}/start${qs}`, { method: 'POST' }, token);
};

// 레벨 완료 처리: POST /api/levels/{id}/complete?userId=...
export const completeLevel = async (levelId, userId, token) => {
  const lid = coerceLevelId(levelId);
  if (!Number.isFinite(lid)) throw new Error('Invalid levelId for completeLevel');
  const uid = withUserId(userId);
  const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
  return http(`/levels/${lid}/complete${qs}`, { method: 'POST' }, token);
};

// 퀴즈 완료 처리 (인증 포함): POST /api/quizzes/{id}/complete?userId=...
export const completeQuiz = async (quizId, userId, token) => {
  const id = Number(quizId);
  if (!Number.isFinite(id)) throw new Error('Invalid quizId for completeQuiz');
  const uid = withUserId(userId);
  const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';

  const jwt = token ?? localStorage.getItem('accessToken') ?? undefined;
  const headers = {
    'Content-Type': 'application/json',
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
  };
  const body = JSON.stringify({ quizId: id, userId: uid, user_id: uid });

  // 1) 스펙: POST /quizzes/{id}/complete?userId=
  try {
    return await http(`/quizzes/${id}/complete${qs}`, { method: 'POST', headers }, jwt);
  } catch (e1) {
    // 2) 변형: POST /quizzes/{id}/complete (body에 userId 포함)
    try {
      return await http(`/quizzes/${id}/complete`, { method: 'POST', headers, body }, jwt);
    } catch (e2) {
      // 3) 변형: POST /quizzes/complete (body에 quizId,userId)
      try {
        return await http(`/quizzes/complete`, { method: 'POST', headers, body }, jwt);
      } catch (e3) {
        // 4) 구버전: POST /quizzes/{id}/done
        try {
          return await http(`/quizzes/${id}/done${qs}`, { method: 'POST', headers }, jwt);
        } catch (e4) {
          // 마지막 실패 시 최초 에러 전달
          throw e1;
        }
      }
    }
  }
};

// 사용자 퀴즈 시도 이력 조회: 서버에 저장된 정오답/선택지를 가져와 UI에 반영
export const fetchQuizAttempts = async (quizId, userId, token) => {
  const id = Number(quizId);
  if (!Number.isFinite(id)) return [];
  const uid = withUserId(userId);
  const qsUid = uid ? `userId=${encodeURIComponent(uid)}` : '';
  const qsQuiz = `quizId=${encodeURIComponent(id)}`;
  const candidates = [
    `/quizzes/${id}/attempts${uid ? `?${qsUid}` : ''}`,
    `/quizzes/${id}/answers${uid ? `?${qsUid}` : ''}`,
    `/attempts?${qsQuiz}${uid ? `&${qsUid}` : ''}`,
    uid ? `/users/${uid}/attempts?${qsQuiz}` : null,
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      const res = await http(p, {}, token);
      const list = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : null));
      if (!Array.isArray(list)) continue;
      const norm = list.map((it) => {
        const qid = it.questionId ?? it.question_id ?? it.question?.id ?? it.qid ?? it.problemId;
        const sel = it.selectedOptionId ?? it.selected_option_id ?? it.optionId ?? it.answerId ?? it.answer_id ?? it.chosenOptionId;
        const raw = it.isCorrect ?? it.is_correct ?? it.correct ?? it.result ?? it.status;
        let isCorrect = null;
        if (typeof raw === 'boolean') isCorrect = raw;
        else if (typeof raw === 'number') isCorrect = raw === 1;
        else if (typeof raw === 'string') {
          const s = raw.trim().toLowerCase();
          if (['true','y','yes','1','correct','right','ok','pass','passed','success'].includes(s)) isCorrect = true;
          if (['false','n','no','0','wrong','fail','failed','error'].includes(s)) isCorrect = false;
        }
        const corr = it.correctOptionId ?? it.correct_option_id ?? it.correctId ?? it.answerKeyId ?? null;
        const feedback = it.feedback ?? it.explanation ?? it.message ?? null;
        return {
          questionId: Number.isFinite(Number(qid)) ? Number(qid) : qid,
          selectedOptionId: Number.isFinite(Number(sel)) ? Number(sel) : sel,
          isCorrect,
          correctOptionId: Number.isFinite(Number(corr)) ? Number(corr) : corr,
          feedback,
          createdAt: it.createdAt ?? it.created_at ?? it.answeredAt ?? it.answered_at ?? null,
        };
      });
      return norm;
    } catch (_) {
      // try next
    }
  }
  return [];
};

// 토픽별 통계 조회
export const getTopicStats = async () => {
  // 백엔드 스펙에 /topic-stats 없음 → 빈 객체/배열 반환
  return [];
};
