// src/api/explore.js - 백엔드 API 연동
import { API_BASE } from './config';
import { guestLogin } from './auth';

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
  const lower = s.toLowerCase();
  if (map[lower]) return map[lower];
  console.warn('⚠️ 알 수 없는 levelId, 기본값 1로 대체됨:', s);
  return 1;
}

// Normalize any label/number to canonical level number (1..3)
function toLevelNumber(level) {
  return coerceLevelId(level);
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

  // 경로 보정: API_BASE(/api 여부)와 path(/api 여부) 중복/누락 없이 합치기
  const base = String(API_BASE || '').replace(/\/+$/, ''); // 끝 슬래시 제거
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

  const res = await fetch(`${base}${p}`, {
    headers,
    credentials: 'include',
    ...opts,
  });
  if (!res.ok) {
    let bodyText = '';
    try { bodyText = await res.text(); } catch (_) {}
    const msg = bodyText ? `${res.statusText} ${bodyText}` : res.statusText;
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }
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
    return await http(`/levels/${lid}/progress${qs}`, {}, token);
  } catch {
    return null;
  }
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
  if (!raw) return { questions: [] };
  // 다양한 백엔드 스키마 대응: questions, items, data, content, results 중 첫 배열 선택
  const qs = Array.isArray(raw.questions)
    ? raw.questions
    : Array.isArray(raw.items)
      ? raw.items
      : Array.isArray(raw.data)
        ? raw.data
        : Array.isArray(raw.content)
          ? raw.content
          : Array.isArray(raw.results)
            ? raw.results
            : [];
  const articles = Array.isArray(raw.articles) ? raw.articles : [];
  const aMap = articles.reduce((m, a) => { if (a?.id != null) m[a.id] = a; return m; }, {});
  return {
    id: raw.id,
    questions: qs.map((q, i) => {
      const art = q.articleId ? aMap[q.articleId] : (q.article_id ? aMap[q.article_id] : undefined);
      // articleId/article_id가 있으면 무조건 ARTICLE로 강제
      let type = q.type;
      if (!type) {
        if (q.articleId || q.article_id) type = 'ARTICLE';
        else if (q.story || q.storyTitleMd || q.story_body_md || q.storyBodyMd) type = 'STORY';
        else type = 'CONCEPT';
      }
      // options의 isCorrect가 1개만 true가 되도록 보정
      let options = Array.isArray(q.options) ? q.options.map((o, oi) => ({
        id: o.id || o.optionId || (oi + 1),
        label: o.label || ['A','B','C','D','E','F'][oi] || null,
        text: o.content_md || o.contentMd || o.content || o.text || o.label || '',
        isCorrect: !!(o.isCorrect || o.is_correct),
      })) : [];
      // isCorrect가 여러 개이거나 0개면 첫 번째만 true로 보정
      if (options.length) {
        const correctCount = options.filter(o => o.isCorrect).length;
        if (correctCount !== 1) {
          options = options.map((o, oi) => ({ ...o, isCorrect: oi === 0 }));
        }
      }
      return {
        id: q.id ?? i + 1,
        type,
        question: q.stem_md || q.stemMd || q.stem || q.question || '',
        stemMd: q.stem_md || q.stemMd || q.stem || q.question || '',

        // 기사형 필드
        articleId: q.articleId || q.article_id || null,
        articleTitleMd: art?.title_md || art?.titleMd || art?.title || null,
        articleBodyMd: art?.body_md || art?.bodyMd || art?.body || null,
        image: art?.image_url || art?.imageUrl || q.image_url || q.imageUrl || null,

        // 스토리형(Story) 필드 매핑
        storyTitleMd: q.story_title_md || q.storyTitleMd || q.storyTitle || null,
        storyBodyMd: q.story_body_md || q.storyBodyMd || q.story || null,

        // 학습/힌트/핵심/해설 (README 스키마 반영)
        teachingExplainerMd: q.teaching_explainer_md || q.teachingExplainerMd || q.learning_md || q.learningMd || null,
        solvingKeypointsMd: q.solving_keypoints_md || q.solvingKeypointsMd || q.keypoints_md || q.keypointsMd || null,
        answerExplanationMd: q.answer_explanation_md || q.answerExplanationMd || q.explanation_md || q.explanationMd || null,
        hintMd: q.hint_md || q.hintMd || q.hint || null,

        // 선택지
        options,
      };
    }),
  };
}
// 내부 헬퍼: subsector 기준으로 라벨/숫자 레벨을 실제 레벨 엔티티 ID로 변환
async function resolveLevelEntityId({ subTopicId, level }) {
  try {
    // 이미 엔티티 ID 형태로 들어온 경우(숫자 > 3 또는 숫자형 문자열 > 3)는 그대로 사용
    if (typeof level === 'number' && level > 3) return level;
    if (typeof level === 'string') {
      const asN = Number(level);
      if (Number.isFinite(asN) && asN > 3) return asN;
    }
    if (!subTopicId) return typeof level === 'number' ? level : toLevelNumber(level);
    const list = await getLevelsBySubsector(subTopicId);
    const want = toLevelNumber(level);
    // 0) 전달된 level 값이 실제 엔티티 id와 정확히 일치하는 경우 우선 반환 (id가 1/2/3인 백엔드 대비)
    if (typeof level === 'number') {
      const byExactId = list.find(l => Number(l.id) === Number(level));
      if (byExactId?.id != null) return byExactId.id;
    } else if (typeof level === 'string') {
      const asN = Number(level);
      if (Number.isFinite(asN)) {
        const byExactIdStr = list.find(l => Number(l.id) === asN);
        if (byExactIdStr?.id != null) return byExactIdStr.id;
      }
    }
    // 1) levelNumber 일치
    const hit = list.find(l => Number(l.levelNumber) === Number(want));
    if (hit?.id != null) return hit.id;
    // 2) 제목 키워드 매칭 (초/중/고 혹은 en)
    const wantKey = want === 1 ? /(초|입문|beginner|easy)/i : want === 2 ? /(중|intermediate|medium)/i : /(고|advanced|hard)/i;
    const byKeyword = list.find(l => wantKey.test(String(l.title || l.name || '')));
    if (byKeyword?.id != null) return byKeyword.id;
    // 3) 제목 끝의 숫자 매칭
    const byTitle = list.find(l => new RegExp(`${want}$`).test(String(l.title || '')));
    if (byTitle?.id != null) return byTitle.id;
    // 매칭 실패 시 fallback하지 않고 null 반환 (정확한 매핑 실패시 문제 호출 X)
    return null;
  } catch (_) {
    return null;
  }
}

export const getQuestions = async ({ topicId, subTopicId, levelId, userId }) => {
  if (!levelId) return { questions: [], totalCount: 0, quizId: null, error: '레벨 정보가 올바르지 않습니다. 다른 난이도를 선택해 주세요.' };
  try {
    const uid = withUserId(userId);
    // 디버깅 로그: 입력값 확인
    console.debug('[getQuestions] input subTopicId=', subTopicId, 'levelId=', levelId);
    const resolvedLevelId = await resolveLevelEntityId({ subTopicId, level: levelId });
    if (!resolvedLevelId) return { questions: [], totalCount: 0, quizId: null };
    console.debug('[getQuestions] resolvedLevelId=', resolvedLevelId);
    // 1) 레벨의 퀴즈 목록
    const meta = await http(`/levels/${resolvedLevelId}/quizzes${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`);
    const quizCandidates = [
      ...(Array.isArray(meta?.quizzes) ? meta.quizzes : []),
      ...(Array.isArray(meta?.content) ? meta.content : []),
      ...(Array.isArray(meta?.data) ? meta.data : []),
      ...(Array.isArray(meta?.items) ? meta.items : []),
      ...(Array.isArray(meta?.results) ? meta.results : []),
      ...(Array.isArray(meta) ? meta : []),
    ];
    let quizList = quizCandidates.filter(Boolean);

    // 일부 백엔드는 레벨 시작 이후에만 퀴즈가 생성됨 → start 호출 후 재시도
    if (!quizList.length) {
      try {
        await http(`/levels/${resolvedLevelId}/start`, {
          method: 'POST',
          body: JSON.stringify(uid ? { userId: uid } : {}),
        });
      } catch (_) { /* ignore start failure; still retry list */ }
      try {
        const meta2 = await http(`/levels/${resolvedLevelId}/quizzes${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`);
        quizList = Array.isArray(meta2?.quizzes) ? meta2.quizzes : (Array.isArray(meta2) ? meta2 : []);
      } catch (_) { /* ignore second failure */ }
    }
    if (!quizList.length) return { questions: [], totalCount: 0, quizId: null };
    // 여러 퀴즈 중 4문항 이상 가진 퀴즈를 우선 선택, 없으면 ARTICLE/STORY 포함 퀴즈 우선
    let best = { quizId: null, questions: [], count: 0 };
    let bestWithSpecial = null;
    for (const q of quizList) {
      const qid = q.id || q.quizId;
      if (!qid) continue;
      try {
        const detail = await http(`/quizzes/${qid}${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`);
        const norm = normalizeQuizPayload(detail) || { questions: [] };
        const all = Array.isArray(norm.questions) ? norm.questions : [];
        if (all.length >= 4) {
          const questions = all.slice(0, 4);
          return { questions, totalCount: questions.length, quizId: qid };
        }
        // ARTICLE/STORY 포함 퀴즈 우선 저장 (여러 개면 가장 많은 문제)
        if (all.some(qq => qq.type === 'ARTICLE' || qq.type === 'STORY')) {
          if (!bestWithSpecial || all.length > bestWithSpecial.count) {
            bestWithSpecial = { quizId: qid, questions: all, count: all.length };
          }
        }
        if (all.length > best.count) best = { quizId: qid, questions: all, count: all.length };
      } catch (_) { /* try next quiz */ }
    }
    if (bestWithSpecial) {
      const questions = bestWithSpecial.questions.slice(0, 4);
      return { questions, totalCount: questions.length, quizId: bestWithSpecial.quizId };
    }
    if (best.quizId) {
      const questions = best.questions.slice(0, 4);
      return { questions, totalCount: questions.length, quizId: best.quizId };
    }
    return { questions: [], totalCount: 0, quizId: null };
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
    // 1) /subsectors/{id} 상세에서 levels 혹은 변형 키 탐색
    let raw = [];
    try {
      const detail = await http(`/subsectors/${subsectorId}`);
      const candidateKeys = ['levels','levelList','levelDtos','levelResponses'];
      for (const k of candidateKeys) {
        if (Array.isArray(detail?.[k]) && detail[k].length) { raw = detail[k]; break; }
      }
    } catch (e) { /* ignore single attempt */ }

    // 2) /subsectors/{id}/levels
    if (!raw.length) {
      try {
        const arr = await http(`/subsectors/${subsectorId}/levels`);
        if (Array.isArray(arr) && arr.length) raw = arr;
      } catch (_) {}
    }
    // 3) /levels?subsectorId=ID
    if (!raw.length) {
      try {
        const arr = await http(`/levels?subsectorId=${encodeURIComponent(subsectorId)}`);
        if (Array.isArray(arr) && arr.length) raw = arr;
      } catch (_) {}
    }
    // 4) /levels/search?subsectorId=ID (백엔드 검색 스타일 대비)
    if (!raw.length) {
      try {
        const arr = await http(`/levels/search?subsectorId=${encodeURIComponent(subsectorId)}`);
        if (Array.isArray(arr) && arr.length) raw = arr;
      } catch (_) {}
    }
    if (!raw.length) {
      console.warn('[getLevelsBySubsector] 레벨 데이터를 찾지 못했습니다. subsectorId=', subsectorId);
      return [];
    }
    return raw.map(l => {
      const entityId = l.id ?? l.levelId; // 실제 엔티티 ID만
      const levelNo = l.level_number ?? l.levelNumber ?? l.level_no ?? l.levelNo ?? l.number ?? l.difficulty ?? l.difficulty_level ?? l.difficultyLevel ?? l.rank; // 숫자 레벨 후보들
      const id = entityId ?? levelNo; // id/key는 엔티티 ID 우선, 없으면 임시로 번호 사용
      return {
        ...l,
        id,
        key: id,
        title: l.title || l.name || (levelNo ? `레벨 ${levelNo}` : `레벨 ${id}`),
        desc: l.description || l.desc || l.summary || '',
        goal: l.learning_goal || l.learningGoal || l.goal || '',
        levelNumber: (Number.isFinite(Number(levelNo)) ? Number(levelNo) : levelNo) ?? undefined,
      };
    });
  } catch (e) {
    console.warn('[getLevelsBySubsector] 실패:', e.message);
    return [];
  }
};

// 답안 제출 (사양: POST /api/quizzes/submit-answer)
export const submitAnswer = async ({ quizId, questionId, selectedOptionId }) => {
  return await http('/quizzes/submit-answer', {
    method: 'POST',
    body: JSON.stringify({ quizId, questionId, selectedOptionId }),
  });
};

// 퀴즈 완료 (사양: POST /api/quizzes/{id}/complete)
export const completeQuiz = async (quizId) => {
  return await http(`/quizzes/${quizId}/complete`, { method: 'POST' });
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
