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
    console.log('[API 요청]', {
      url: `${base}${p}`,
      method: opts.method || 'GET',
      body: opts.body ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : undefined,
      headers,
      token: jwt ? '***' : undefined
    });
  } catch (_) {}

  let res;
  try {
    res = await fetch(`${base}${p}`, {
      headers,
      credentials: 'include',
      ...opts,
    });
    // 응답 상태 출력
    console.log('[API 응답]', {
      url: `${base}${p}`,
      status: res.status,
      ok: res.ok,
      statusText: res.statusText
    });
    if (!res.ok) {
      let bodyText = '';
      try { bodyText = await res.text(); } catch (_) {}
      const msg = bodyText ? `${res.statusText} ${bodyText}` : res.statusText;
      console.error('[API 에러]', {
        url: `${base}${p}`,
        status: res.status,
        statusText: res.statusText,
        body: bodyText
      });
      throw new Error(`HTTP ${res.status}: ${msg}`);
    }
    // 응답 본문(json)도 출력
    let json;
    try {
      json = await res.clone().json();
      console.log('[API 응답 본문]', json);
    } catch (_) {}
    return await res.json();
  } catch (err) {
    console.error('[API fetch 실패]', err);
    throw err;
  }
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

// 레벨 상세 정보 조회: desc/goal/levelNumber/title 등 보강용
export const getLevelDetail = async (levelId) => {
  const id = coerceLevelId(levelId);
  if (!id) return null;
  const tryPaths = [
    `/levels/${id}`,
    `/levels/${id}/detail`,
    `/levels/detail/${id}`,
    `/levels/detail?id=${encodeURIComponent(id)}`,
  ];
  for (const p of tryPaths) {
    try {
      const res = await http(p);
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
    } catch (_) { /* try next */ }
  }
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


export const getQuestions = async ({ topicId, subTopicId, levelId, userId }) => {
  // 필수값 체크
  if (!topicId || !subTopicId || !levelId) {
    console.error('[getQuestions] 필수값 누락:', { topicId, subTopicId, levelId });
    return { questions: [], totalCount: 0, quizId: null, error: '주제/세부주제/레벨을 모두 선택해 주세요.' };
  }
  try {
    const uid = withUserId(userId);
    // levelId는 라벨/숫자/PK 모두 지원: resolveLevelEntityId로 robust하게 해석
    const resolvedLevelId = await resolveLevelEntityId({ subTopicId, level: levelId });
    if (!resolvedLevelId) {
      console.error('[getQuestions] levelId 해석 실패:', { subTopicId, levelId });
      return { questions: [], totalCount: 0, quizId: null, error: '레벨 정보가 올바르지 않습니다.' };
    }
  console.log('[getQuestions] level 해석', { inputLevel: levelId, subTopicId, resolvedLevelId });
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
      } catch (e) { console.warn('[getQuestions] start 호출 실패:', e); }
      try {
        const meta2 = await http(`/levels/${resolvedLevelId}/quizzes${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`);
        quizList = Array.isArray(meta2?.quizzes) ? meta2.quizzes : (Array.isArray(meta2) ? meta2 : []);
      } catch (e) { console.warn('[getQuestions] 두번째 퀴즈 fetch 실패:', e); }
    }
    if (!quizList.length) {
      console.error('[getQuestions] 퀴즈 없음:', { topicId, subTopicId, levelId, resolvedLevelId });
      return { questions: [], totalCount: 0, quizId: null, error: '해당 조합에 퀴즈가 없습니다.' };
    }
    // 여러 퀴즈가 있을 경우, 첫 번째 퀴즈의 모든 문제를 순서대로 반환 (임의 가공 금지)
    const firstQuiz = quizList[0];
    const qid = firstQuiz.id || firstQuiz.quizId;
    if (!qid) {
      console.error('[getQuestions] quizId 없음:', firstQuiz);
      return { questions: [], totalCount: 0, quizId: null, error: '퀴즈 ID가 올바르지 않습니다.' };
    }
    try {
      const detail = await http(`/quizzes/${qid}${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`);
      const norm = normalizeQuizPayload(detail) || { questions: [] };
      const all = Array.isArray(norm.questions) ? norm.questions : [];
      let questions = all.slice(0, 4);
      if (questions.length !== 4) {
        console.warn(`[getQuestions] 문제 개수 비정상: ${questions.length}개 (quizId: ${qid}, levelId: ${resolvedLevelId})`, questions);
      }
      // STORY/ARTICLE 위치 강제: 3번째 STORY, 4번째 ARTICLE
      const idxStory = questions.findIndex(q => q.type === 'STORY');
      const idxArticle = questions.findIndex(q => q.type === 'ARTICLE');
      // 3번째 STORY
      if (idxStory !== -1 && idxStory !== 2 && questions[2]) {
        const temp = questions[2];
        questions[2] = questions[idxStory];
        questions[idxStory] = temp;
      }
      // 4번째 ARTICLE
      if (idxArticle !== -1 && idxArticle !== 3 && questions[3]) {
        const temp = questions[3];
        questions[3] = questions[idxArticle];
        questions[idxArticle] = temp;
      }
      console.debug('[getQuestions] 반환 문제(quizId별 4개, 위치정렬):', questions);
      return { questions, totalCount: questions.length, quizId: qid };
    } catch (e) {
      console.error('[getQuestions] 퀴즈 상세 fetch 실패:', e);
      return { questions: [], totalCount: 0, quizId: qid, error: '퀴즈 상세 정보를 불러올 수 없습니다.' };
    }
  } catch (e) {
    console.error('getQuestions API 호출 실패:', e.message);
    return { questions: [], totalCount: 0, quizId: null, error: e.message };
  }
};

// getLevelMeta / getKeyPoints 제거 → 퀴즈 상세 응답에 포함된 필드 직접 사용

// Subsector -> Levels 목록 조회 (예상 엔드포인트 구조)
// ✅ levelId 자동 보정 + subsector별 레벨 구조 보강 버전
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
  // userId/token 보정
  const uid = userId ?? localStorage.getItem('userId') ?? undefined;
  const jwt = token ?? localStorage.getItem('accessToken') ?? undefined;
  const payload = { quizId, questionId, selectedOptionId };
  if (uid) payload.userId = uid;
  // Content-Type 항상 명시
  const headers = {
    'Content-Type': 'application/json',
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
  };
  return await http('/quizzes/submit-answer', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers,
  }, jwt);
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
// postAttempt도 userId/token 항상 전달
export const postAttempt = ({ quizId, questionId, selectedOptionId, userId, token }) =>
  submitAnswer({ quizId, questionId, selectedOptionId, userId, token });

// 토픽별 통계 조회
export const getTopicStats = async () => {
  // 백엔드 스펙에 /topic-stats 없음 → 빈 객체/배열 반환
  return [];
};
