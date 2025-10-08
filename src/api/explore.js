// src/api/explore.js - 백엔드 API 연동
import { 
  dummyQuizzes, 
  dummyProgress, 
  dummyBadges, 
  dummyTopicStats,
  dummyQuestionsData
} from '../utils/testData.js';
import { API_BASE, IMAGE_BASE } from './config';
import { guestLogin } from './auth';

// 백엔드 연결 상태 확인 (정보용)
let isBackendConnected = true; // 낙관적으로 시작하여 건강 체크 실패로 기능이 막히지 않게 함
let authInitialized = false;

// 백엔드 연결 상태 체크 함수
async function checkBackendConnection() {
  const candidates = [
    '/health',
    '/',
    '/actuator/health',
    '/dashboard',
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
  console.log(`   더미 퀴즈 ${dummyQuizzes.length}개 준비됨`);
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
  // 필요 시 게스트 로그인 수행 후 토큰 확보
  await ensureAuth();
  // 토큰 우선순위: opts.token > 파라미터 token > localStorage
  const jwt = opts.token || token || localStorage.getItem('accessToken');
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    credentials: "include",
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

// 5. 퀴즈 상세 조회
export const getQuiz = async (quizId) => {
  try {
    const raw = await http(`/quizzes/${quizId}`);
    return normalizeQuizPayload(raw);
  } catch {
    const dummyQuiz = dummyQuizzes.find(q => q.id === parseInt(quizId)) || dummyQuizzes[0];
    return dummyQuiz;
  }
};

// 서버 응답 키를 UI에서 쓰는 형태로 정규화 (questionText/optionText → question/text)
function parseBoolLoose(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  if (['true','1','y','yes','t','ok','correct'].includes(s)) return true;
  if (['false','0','n','no','f','x','wrong'].includes(s)) return false;
  return false;
}

function normalizeQuizPayload(raw) {
  if (!raw) return raw;
  // 이미지 URL 유효성 검사 및 보정: 숫자/불린 등은 무시하고,
  // 파일명/상대경로만 온 경우 API origin 기준 절대 URL로 변환하여 기사문제 표시를 지원
  const sanitizeImageUrl = (v) => {
    if (!v) return null;
    if (typeof v !== 'string') return null;
    const s = v.trim();
    if (!s) return null;
    // 절대 URL은 그대로 사용
    if (/^(https?:\/\/|data:|blob:)/i.test(s)) return s;
    // 파일명 또는 선행 슬래시가 없는 상대경로 처리 (예: "news.png" 또는 "uploads/news.png")
    const looksLikeImageFile = /\.(png|jpe?g|gif|webp|svg)$/i.test(s) && !/[\s"'<>]/.test(s);
    try {
      const apiUrl = new URL(API_BASE, (typeof window !== 'undefined' ? window.location.origin : undefined));
      const origin = apiUrl.origin;                  // https://host
      const basePath = apiUrl.pathname.replace(/\/$/, ''); // /api 또는 ''
      // 1) 루트 기준 경로("/uploads/x.png")는 origin과 결합 (대부분 정적 리소스 루트)
      if (/^\//.test(s)) {
        const base = IMAGE_BASE || origin;
        const abs = `${base}${s}`;
        console.log(`🖼️ 이미지 루트경로 보정: '${s}' -> '${abs}'`);
        return abs;
      }
      // 2) ./ 또는 ../ 로 시작하는 경로는 API_BASE 경로를 기준으로 결합
      if (/^(\.\/|\.\.\/)/.test(s)) {
        const base = `${(IMAGE_BASE || origin)}${basePath ? basePath + '/' : '/'}`;
        const normalized = s.replace(/^\.\//, '').replace(/^\.\.\//, '');
        const abs = `${base}${normalized}`;
        console.log(`🖼️ 이미지 상대경로 보정(./, ../): '${s}' -> '${abs}'`);
        return abs;
      }
      // 3) 단순 파일명 또는 슬래시 없는 상대경로
      if (looksLikeImageFile) {
        const normalized = s.replace(/^\/+/, '');
        const abs = `${(IMAGE_BASE || origin)}${basePath ? basePath + '/' : '/'}${normalized}`;
        console.log(`🖼️ 이미지 파일명 보정: '${s}' -> '${abs}'`);
        return abs;
      }
    } catch (_) {
      /* fallthrough */
    }
    return null;
  };

  // 백엔드가 type 값을 다양하게 줄 수 있으므로 기사형 판별 보조 함수
  const looksArticleType = (t) => {
    if (!t) return false;
    const s = String(t).trim().toLowerCase();
    return s === 'article' || s === 'articleimage' || s === 'news' || s === 'article_img' || s === 'article-img';
  };

  const questions = (raw.questions || []).map((q) => {
    // 이미지 후보 키들(백엔드 다양성 대응): 가장 먼저 매칭되는 값을 사용
    const nestedArticle = q.article || q.news || null;
    const img = (
      q.image ?? q.imageUrl ?? q.imageURL ?? q.imgUrl ?? q.img_url ??
      q.imagePath ?? q.image_path ?? q.mediaUrl ?? q.media_url ??
      q.articleImage ?? q.articleImageUrl ?? q.article_image_url ?? q.article_image ?? q.articleImg ??
      q.contentImageUrl ?? q.content_image_url ?? q.thumbnail ?? q.thumbnailUrl ?? q.thumbnailURL ??
      q.thumbUrl ?? q.thumb_url ?? q.newsImageUrl ?? q.news_image_url ?? q.newsImg ?? q.news_image ??
      q.picture ?? q.photo ?? q.coverImage ?? q.cover_image ?? q.coverImageUrl ?? q.cover_image_url ??
      null
    );
    // nested article 이미지 보강
    let image = sanitizeImageUrl(img);
    if (!image && nestedArticle) {
      const artImg = nestedArticle.image_url || nestedArticle.imageUrl || nestedArticle.image_path || nestedArticle.imagePath;
      image = sanitizeImageUrl(artImg);
    }
  const rawType = q.type ?? q.questionType ?? q.kind;
  // 기사형 판정은 보수적으로: 명시적 type이 기사이거나, 이미지 URL이 확보된 경우만
  const isArticleLike = looksArticleType(rawType) || !!image;
      const mapped = {
      ...q,
      // 질문 본문/지문 매핑 보강
      question: (
        q.question ?? q.questionText ?? q.prompt ?? q.title ?? q.text ?? q.stem ?? q.stemMd ?? ''
      ),
      stemMd: (
        q.stemMd ?? q.stem ?? q.questionText ?? q.prompt ?? q.text ?? q.question ?? ''
      ),
      // 기사형 본문/제목 매핑 (백엔드 다양한 키 대응)
      articleTitleMd: (
        q.articleTitleMd ?? q.article_title_md ?? q.articleTitle ?? q.article_title ??
        q.newsTitle ?? q.news_title ?? q.contextTitle ?? q.context_title ??
        nestedArticle?.title ?? null
      ),
      articleBodyMd: (
        q.articleBodyMd ?? q.article_body_md ?? q.articleBody ?? q.article_body ??
        q.articleMd ?? q.article_md ?? q.article ?? q.contentMd ?? q.content_md ?? q.content ??
        q.contextMd ?? q.context_md ?? q.context ?? q.passageMd ?? q.passage_md ?? q.passage ??
        nestedArticle?.body_md ?? nestedArticle?.bodyMd ?? nestedArticle?.body ?? null
      ),
      // 학습/핵심포인트/힌트 정규화
      solvingKeypointsMd: (
        q.solvingKeypointsMd ?? q.solvingKeypoints ?? q.keypointsMd ?? q.keyPointsMd ?? q.keypoints ?? q.keyPoints ?? q.key_points ??
        q.studyPointsMd ?? q.study_points_md ?? q.study_points ?? q.learnKeypointsMd ?? q.learningKeypointsMd ?? null
      ),
      teachingExplainerMd: (
        q.teachingExplainerMd ?? q.explainerMd ?? q.explainer ?? q.explanationMd ?? q.explanation ?? q.teachingMd ?? q.explainMd ?? null
      ),
      hintMd: (
        q.hintMd ?? q.hint ?? q.tipsMd ?? q.tips ?? q.helpMd ?? q.help ?? null
      ),
  // 기사형 문제 처리: 다양한 키에서 이미지 필드 정규화 (확장)
  image,
  // 기사형으로 보이는 경우(백엔드 type이 ARTICLE 또는 이미지가 있는 경우) UI 타입을 articleImage로 통일
  // 이미지가 없어도 placeholder + 폴백 이미지를 통해 동일한 렌더링을 보장
  type: isArticleLike ? 'articleImage' : (rawType ?? undefined),
      options: (q.options || []).map((o, i) => ({
        ...o,
        id: o.id ?? o.optionId ?? o.valueId ?? o.value ?? (i + 1),
        // 서버가 label("A"/"B"/...)와 실제 내용 분리 제공 시, 내용 필드 우선 사용
        text: (
          o.text ?? o.optionText ?? o.content ?? o.description ?? o.desc ?? o.body ??
          o.text_kr ?? o.option_text ?? o.option_text_kr ?? o.valueText ?? o.value_text ??
          o.title ?? o.name ?? o.label ?? ''
        ),
        // 다양한 백엔드 케이스 처리 (isCorrect/correct/is_correct/answer/isRight 등)
        isCorrect: parseBoolLoose(
          o.isCorrect ?? o.correct ?? o.is_correct ?? o.answer ?? o.isRight ?? o.is_right
        ),
      })),
    };

    // 옵션들에 정답 플래그가 하나도 없으면 질문 레벨의 정답 정보를 이용해 설정
    const anyCorrect = Array.isArray(mapped.options) && mapped.options.some((o) => o.isCorrect);
  if (!anyCorrect && Array.isArray(mapped.options) && mapped.options.length) {
      // 후보 키들: 인덱스/ID/텍스트
      const correctIndexRaw = (
        q.correctIndex ?? q.correctOptionIndex ?? q.correct_option_index ?? q.answerIndex ?? q.answer_index
      );
      const correctId = (
        q.correctOptionId ?? q.correct_option_id ?? q.answerId ?? q.answer_id
      );
      const correctText = (
        q.correctAnswer ?? q.answerText ?? q.correct_answer ?? q.answer
      );
      const correctLetter = (
        q.correctOption ?? q.correct_option ?? q.correctLetter ?? q.correct_letter
      );

      let idx = -1;
      const len = mapped.options.length;
      const toIdx = (n) => Math.max(0, Math.min(len - 1, n));
      // 숫자/문자 모두 고려한 인덱스 계산
      const asNumber = (v) => {
        if (typeof v === 'number' && Number.isFinite(v)) return v;
        if (typeof v === 'string') {
          const n = parseInt(v, 10);
          return Number.isFinite(n) ? n : NaN;
        }
        return NaN;
      };

      const nIdx = asNumber(correctIndexRaw);
      if (Number.isFinite(nIdx)) {
        // 0-based 우선, 아니면 1-based 해석
        if (nIdx >= 0 && nIdx < len) idx = toIdx(nIdx);
        else if (nIdx >= 1 && nIdx <= len) idx = toIdx(nIdx - 1);
      } else if (typeof correctId !== 'undefined' && correctId !== null) {
        const found = mapped.options.findIndex((o) => String(o.id) === String(correctId));
        if (found >= 0) idx = found;
      } else if (typeof correctText === 'string' && correctText.trim()) {
        const found = mapped.options.findIndex((o) => String(o.text).trim() === String(correctText).trim());
        if (found >= 0) idx = found;
      } else if (typeof correctLetter === 'string' && correctLetter.trim()) {
        const s = correctLetter.trim().toUpperCase();
        // 'A' -> 0, 'B' -> 1 ... 혹은 '1' -> 0
        if (/^[A-Z]$/.test(s)) {
          idx = toIdx(s.charCodeAt(0) - 'A'.charCodeAt(0));
        } else {
          const asN = asNumber(s);
          if (Number.isFinite(asN)) {
            if (asN >= 0 && asN < len) idx = toIdx(asN);
            else if (asN >= 1 && asN <= len) idx = toIdx(asN - 1);
          }
        }
      }
      if (idx >= 0) {
        mapped.options = mapped.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
      }
    }

    return mapped;
  });
  return { ...raw, questions };
}

// 6. 답안 제출
// 답안 제출 (백엔드 명세: quizId, userId, answers 배열, JWT 토큰)
export const submitAnswer = async ({ quizId, userId, answers, token }) => {
  // 퀴즈 ID가 없거나 비정상인 경우 백엔드 호출을 생략하고 로컬 판정 경로로 위임
  const nQuizId = Number(quizId);
  if (!Number.isFinite(nQuizId)) {
    // 빈 객체를 반환하면 상위 로직이 옵션의 isCorrect로 로컬 판정합니다.
    return {};
  }
  const payload = { quizId, userId: withUserId(userId), answers };
  const paths = [
    '/quizzes/submit-answer',
    '/quiz/submit',
    '/quiz/answers',
  ];
  // 일부 백엔드가 단일 답안 스키마를 기대하는 경우를 대비
  const single = answers && answers[0] ? {
    quizId,
    userId: withUserId(userId),
    questionId: answers[0].questionId,
    selectedOptionId: answers[0].selectedOptionId,
  } : null;
  const bodies = [payload, single].filter(Boolean);
  for (const p of paths) {
    for (const b of bodies) {
      try {
        return await http(p, {
          method: 'POST',
          body: JSON.stringify(b),
          token,
        }, token);
      } catch (e) {
        // 400류는 다음 변형으로 시도 계속
        continue;
      }
    }
  }
  // 백엔드 실패 시 임의 채점을 하지 않고, 프론트가 로컬 정답(옵션의 isCorrect)으로 판정하도록 최소 정보만 반환
  return { selectedOptionId: answers?.[0]?.selectedOptionId };
};

// 7. 퀴즈 결과 조회
export const getQuizResult = async (quizId, userId, token) => {
  const uid = withUserId(userId);
  try { return await http(`/quizzes/${quizId}/result?userId=${uid}`, {}, token); } catch { return null; }
};

// 8. 퀴즈 완료 처리
export const completeQuiz = async (quizId, userId, token) => {
  const uid = withUserId(userId);
  try { return await http(`/quizzes/${quizId}/complete?userId=${uid}`, { method: 'POST' }, token); } catch { return { success: true }; }
};

// 9. 레벨 완료 처리
export const completeLevel = async (levelId, userId, token) => {
  const uid = withUserId(userId);
  const lid = coerceLevelId(levelId);
  try { return await http(`/levels/${lid}/complete?userId=${uid}`, { method: 'POST' }, token); } catch { return { success: true }; }
};

// 10. 레벨 시작 처리
export const startLevel = async (levelId, userId, token) => {
  const uid = withUserId(userId);
  const lid = coerceLevelId(levelId);
  try { return await http(`/levels/${lid}/start?userId=${uid}`, { method: 'POST' }, token); } catch { return { success: true }; }
};

// 11. 대시보드 조회
export const getDashboard = async (userId, token) => {
  const uid = withUserId(userId);
  try { return await http(`/dashboard?userId=${uid}`, {}, token); } catch { return null; }
};

// 12. 뱃지 조회
export const getBadgesReal = async (userId, token) => {
  const uid = withUserId(userId);
  try { return await http(`/badges/user/${uid}`, {}, token); } catch { return []; }
};

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
export const getQuestions = async ({ topicId, subTopic, subTopicId, levelId } = {}) => {
  console.log('📚 getQuestions 호출됨 - topicId:', topicId, 'levelId:', levelId);
  const uid = withUserId();
  const lid = coerceLevelId(levelId);
  // If subTopic is numeric-like, treat it as subsectorId and pass it through when fetching quizzes
  const subsectorId = (subTopicId != null) ? subTopicId : ((typeof subTopic === 'number' || (typeof subTopic === 'string' && /^\d+$/.test(subTopic))) ? subTopic : undefined);
  try {
    // 1) 레벨별 퀴즈 목록 조회
    const qsParams = new URLSearchParams();
    if (uid != null) qsParams.set('userId', uid);
    if (subsectorId != null) qsParams.set('subsectorId', subsectorId);
    const levelData = await http(`/levels/${lid}/quizzes?${qsParams.toString()}`);
    const quizzes = Array.isArray(levelData?.quizzes) ? levelData.quizzes : (Array.isArray(levelData) ? levelData : []);
    if (!quizzes.length) throw new Error('No quizzes for level');

    // 2) 우선순위: NOT_STARTED → IN_PROGRESS → 그 외, 없으면 첫 번째
    const prioritized =
      quizzes.find(q => q.status === 'NOT_STARTED') ||
      quizzes.find(q => q.status === 'IN_PROGRESS') ||
      quizzes[0];
    const prioritizedId = prioritized?.id || prioritized?.quizId || quizzes[0]?.id;
    if (!prioritizedId) throw new Error('No quizId');

    // 3) 기사형 문제(이미지 포함)를 선호: 최대 5개 퀴즈 상세를 병렬 조회하여 이미지 포함 여부 확인
    const candidateIds = Array.from(new Set([
      prioritizedId,
      ...quizzes.map(q => q.id || q.quizId).filter(Boolean)
    ])).slice(0, 10);

    const details = await Promise.all(
      candidateIds.map(async (id) => {
        try {
          const rawQ = await http(`/quizzes/${id}`);
          const norm = normalizeQuizPayload(rawQ);
          // 기사 enrichment: 각 문항의 article_id가 있다면 기사 상세를 받아 이미지/제목/본문을 보강
          if (Array.isArray(norm?.questions)) {
            await Promise.all(norm.questions.map(async (q, idx) => {
              const aId = q.articleId ?? q.article_id;
              if (!aId) return;
              try {
                const art = await http(`/articles/${aId}`);
                const artImg = art?.image_url || art?.imageUrl || art?.image_path || art?.imagePath;
                const image = artImg ? ( () => {
                  const s = String(artImg).trim();
                  if (/^(https?:\/\/|data:|blob:)/i.test(s)) return s;
                  try {
                    const apiUrl = new URL(API_BASE, (typeof window !== 'undefined' ? window.location.origin : undefined));
                    const origin = apiUrl.origin;
                    const basePath = apiUrl.pathname.replace(/\/$/, '');
                    const normalized = s.replace(/^\/+/, '');
                    return `${(IMAGE_BASE || origin)}${basePath ? basePath + '/' : '/'}${normalized}`;
                  } catch { return null; }
                })() : null;
                norm.questions[idx] = {
                  ...q,
                  type: (String(q?.type||'').toLowerCase().includes('article') || image) ? 'articleImage' : q.type,
                  image: q.image || image || null,
                  articleTitleMd: q.articleTitleMd || art?.title || null,
                  articleBodyMd: q.articleBodyMd || art?.body_md || art?.bodyMd || art?.body || null,
                };
              } catch (_) { /* skip per-item failure */ }
            }));
          }
          return { id, norm };
        } catch (_) { return { id, norm: null }; }
      })
    );

    // 선호도 함수들
    const hasArticle = (norm) => Array.isArray(norm?.questions) && norm.questions.some(
      (q) => (String(q?.type||'').toLowerCase() === 'articleimage' || String(q?.type||'').toLowerCase() === 'article') && !!q?.image
    );

    // 주제/세부주제 관련 키워드 매칭 가중치
    const getKeywords = (topic, sub) => {
      const base = String(topic || '').trim();
      const subBase = String(sub || '').trim();
      const map = {
        '은행': ['은행','예금','적금','계좌','인터넷뱅킹','모바일 뱅킹','대출'],
        '카드': ['카드','신용카드','체크카드','혜택','수수료','한도','신용 점수','신용점수'],
        '세금/절세': ['세금','절세','영수증','연말정산','소득공제','세액공제'],
        '투자': ['투자','주식','채권','펀드','거래소']
      };
      const subMap = {
        '예금/적금': ['예금','적금','이자','만기','정기예금','자유적금'],
        '계좌의 종류와 기능': ['입출금계좌','통장','자유입출금','정기예금','계좌이체'],
        '인터넷/모바일 뱅킹': ['인터넷뱅킹','모바일뱅킹','공동인증서','토스','카카오뱅크'],
        '대출의 기초 이해': ['대출','원리금','금리','상환','담보','신용대출'],
        '카드의 종류': ['신용카드','체크카드','카드','후불','선불'],
        '카드 수수료 및 혜택 이해': ['수수료','혜택','적립','포인트','캐시백'],
        '카드 사용 전략': ['할부','한도','연회비','결제일'],
        '신용 점수와 카드 사용의 관계': ['신용 점수','신용점수','연체','신용등급'],
        '거래소 사용': ['거래소','매수','매도','호가','체결'],
        '주식': ['주식','배당','PER','PBR','시가총액'],
        '채권': ['채권','표면금리','만기수익률','국채','회사채'],
        '펀드': ['펀드','ETF','인덱스','수수료','환매'],
        '세금이란': ['세금','납부','국세','지방세'],
        '영수증과 세금 혜택': ['영수증','공제','현금영수증'],
        '연말정산': ['연말정산','소득공제','세액공제','환급']
      };
      const t = map[base] || (base ? [base] : []);
      const s = subMap[subBase] || (subBase ? [subBase] : []);
      return Array.from(new Set([...t, ...s]));
    };

    // 토픽 이름/ID 보정: 숫자 ID가 들어오면 키워드가 비게 되어 오선택될 수 있으므로
    // topicName/topic/subTopicName/subTopic 등 문자열 값을 우선 사용
    const topicStr = [topicId, (typeof topicId === 'object' ? null : undefined)]
      .filter(v => typeof v === 'string')?.[0] || topicId;
    const kw = getKeywords(topicStr, subTopic).map(k => String(k).toLowerCase());

    // 퀴즈 메타 텍스트 추출: 제목/설명/토픽명/태그 등을 모두 포함시켜 매칭 정확도 향상
    const metaTextOfQuiz = (norm) => {
      if (!norm) return '';
      const fields = [
        norm.title, norm.name, norm.quizTitle, norm.subtitle, norm.description,
        norm.topic, norm.topicName, norm.category, norm.categoryName,
        norm.subTopic, norm.subtopic, norm.subTopicName, norm.sectorName, norm.subsectorName,
      ];
      const tags = Array.isArray(norm.tags) ? norm.tags : (Array.isArray(norm.keywords) ? norm.keywords : []);
      return [...fields.filter(Boolean), ...tags].join(' ');
    };

    const textOfQuiz = (norm) => {
      if (!norm?.questions) return '';
      const qText = norm.questions.map(q => [q.question, q.stemMd, q.teachingExplainerMd, q.solvingKeypointsMd, ...(q.options||[]).map(o=>o.text)]
        .flat().filter(Boolean).join(' ')).join(' ');
      return `${metaTextOfQuiz(norm)} ${qText}`;
    };
    const scoreOf = (norm) => {
      if (!kw.length) return 0;
      const hay = textOfQuiz(norm).toLowerCase();
      return kw.reduce((s,k)=> s + (hay.includes(k) ? 1 : 0), 0);
    };

    // 1순위: 기사형 포함 퀴즈 우선 선택, 그 안에서 주제/세부주제 매칭 점수 높은 퀴즈
    const withScores = details.map(d => ({ ...d, score: scoreOf(d.norm), hasArticle: hasArticle(d.norm) }));
    const onlyArticle = withScores.filter(d => d.norm && d.hasArticle);
    let chosenEntry;
    if (onlyArticle.length) {
      // 키워드가 하나라도 매칭되는 후보가 있으면 그 안에서 선택
      const positive = onlyArticle.filter(d => d.score > 0);
      const pool = positive.length ? positive : onlyArticle;
      chosenEntry = pool.sort((a,b) => (b.score - a.score))[0];
    } else {
      // 기사형이 하나도 없으면 주제 매칭 점수 기준으로 선택 (백엔드 데이터 이슈 가능성 로그)
      const positive = withScores.filter(d => d.norm && d.score > 0);
      const pool = positive.length ? positive : withScores.filter(d => d.norm);
      chosenEntry = pool.sort((a,b) => (b.score - a.score))[0];
      console.log('ℹ️ 선택된 레벨 퀴즈들 중 기사형 문항이 없습니다. 백엔드에서 이미지가 포함된 문항을 제공하지 않는 상태일 수 있습니다.');
    }

    const chosen = chosenEntry?.norm;
    const chosenId = chosenEntry?.id || prioritizedId;
    if (chosen) {
      const hasAnyImg = Array.isArray(chosen.questions) && chosen.questions.some(q => !!q.image);
      console.log(`🧩 선택된 퀴즈 ${chosenId} | 기사문항 포함: ${hasAnyImg}`);
    }

    // 기사형 문항은 첫 번째 문제로 나오지 않도록 4번째(인덱스 3), 스토리텔링은 3번째(인덱스 2)
    let qs = Array.isArray(chosen?.questions) ? chosen.questions : [];
    const isArticleQ = (q) => {
      const t = String(q?.type||'').toLowerCase();
      return (t === 'articleimage' || t === 'article') && !!q?.image;
    };
    const isStoryQ = (q) => {
      const t = String(q?.type || q?.questionType || '').toLowerCase();
      if (t.includes('story')) return true;
      const text = [q?.question, q?.stemMd, q?.teachingExplainerMd].filter(Boolean).join(' ').toLowerCase();
      return /스토리|story|case|사례/.test(text);
    };
    const moveArticleToIndex = (arr, targetIdx = 3) => {
      if (!Array.isArray(arr) || arr.length === 0) return arr || [];
      const idx = arr.findIndex(isArticleQ);
      if (idx === -1) return arr;
      const ti = Math.min(targetIdx, Math.max(0, arr.length - 1));
      if (idx === ti) return arr;
      const clone = arr.slice();
      const [item] = clone.splice(idx, 1);
      clone.splice(ti, 0, item);
      console.log(`🔀 기사형 문항 위치 이동: 원래 인덱스 ${idx} → ${ti} (총 ${arr.length}문항)`);
      return clone;
    };
    const moveStoryToIndex = (arr, targetIdx = 2) => {
      if (!Array.isArray(arr) || arr.length === 0) return arr || [];
      const idx = arr.findIndex(isStoryQ);
      if (idx === -1) return arr;
      const ti = Math.min(targetIdx, Math.max(0, arr.length - 1));
      if (idx === ti) return arr;
      const clone = arr.slice();
      const [item] = clone.splice(idx, 1);
      clone.splice(ti, 0, item);
      console.log(`🔀 스토리 문항 위치 이동: 원래 인덱스 ${idx} → ${ti} (총 ${arr.length}문항)`);
      return clone;
    };
    // 순서: 먼저 스토리 2번 인덱스로, 그 다음 기사 3번 인덱스로 배치
    qs = moveStoryToIndex(qs, 2);
    qs = moveArticleToIndex(qs, 3);

    // 보강 1) 기사형 문항이 하나도 없으면 가상 문항을 추가하여 4번째에 배치
  let hasAnyArticle = qs.some(isArticleQ);
    if (!hasAnyArticle) {
      const virtualArticle = {
        id: `virtual-article-${Date.now()}`,
        type: 'articleImage',
        image: null, // UI에서 기본 대체 이미지를 사용
        stemMd: '다음 기사를 읽고 물음에 답하세요.',
        question: '기사 내용을 바탕으로 올바른 선택지를 고르세요.',
        options: [
          { id: 'A', text: '선택지 A', isCorrect: false },
          { id: 'B', text: '선택지 B', isCorrect: true },
          { id: 'C', text: '선택지 C', isCorrect: false },
          { id: 'D', text: '선택지 D', isCorrect: false },
        ],
      };
      const clone = qs.slice();
      const ti = Math.min(3, Math.max(0, clone.length));
      clone.splice(ti, 0, virtualArticle);
      qs = clone;
      hasAnyArticle = true;
      console.log('🧩 기사형 문항이 없어 가상 기사 문제를 4번째에 추가했습니다.');
    }

    // 보강 2) 총 문항 수가 4 미만이면 4개가 되도록 가상 문항(단답형)을 덧붙임
    while (qs.length < 4) {
      const filler = {
        id: `virtual-filler-${qs.length}-${Date.now()}`,
        type: qs.length === 3 ? 'articleImage' : undefined,
        image: null,
        stemMd: '학습 효과 점검용 보강 문항입니다.',
        question: '가장 적절한 선택지를 고르세요.',
        options: [
          { id: 1, text: '보기 1', isCorrect: true },
          { id: 2, text: '보기 2', isCorrect: false },
          { id: 3, text: '보기 3', isCorrect: false },
          { id: 4, text: '보기 4', isCorrect: false },
        ],
      };
      qs.push(filler);
    }

    console.log(`✅ 레벨 ${levelId} → 퀴즈 ${chosenId} 로드됨 (${qs.length}문항${hasAnyArticle?', 기사형 포함' : ''}; 주제 매칭 점수=${chosenEntry?.score||0})`);
    return { questions: qs, totalCount: qs.length, quizId: chosenId };
  } catch (error) {
    console.log('🎯 백엔드 로드 실패 - 더미 questions 사용:', error.message);
    return { questions: dummyQuizzes, totalCount: dummyQuizzes.length };
  }
};

// 레벨 메타데이터 조회 (설명/목표 등) - 존재하지 않으면 null 반환
export const getLevelMeta = async (levelId) => {
  const lid = coerceLevelId(levelId);
  // 여러 후보 엔드포인트를 시도하고, 공통 스키마로 정규화
  const tryPaths = [
    `/levels/${lid}`,
    `/levels/${lid}/detail`,
    `/levels/${lid}/meta`,
    `/levels/${lid}/info`,
  ];
  for (const p of tryPaths) {
    try {
      const res = await http(p);
      if (res) {
        const description = res.description || res.desc || res.summary || null;
        const learningGoal = res.learningGoal || res.goal || res.objectives || null;
        const title = res.title || res.name || res.levelTitle || null;
        return { ...res, description, learningGoal, title };
      }
    } catch (_) { /* try next */ }
  }
  return {};
};
// 기존 getKeyPoints 함수 -> 더미 데이터 우선 사용
export const getKeyPoints = async ({ questionId } = {}) => {
  console.log('🔑 getKeyPoints 호출됨 - questionId:', questionId);
  try {
    // 백엔드 연결된 경우 실제 API 호출
    const keypoints = await http(`/keypoints/${questionId}`);
    console.log('✅ 백엔드에서 keypoints 로드됨');
    return keypoints;
  } catch (error) {
    console.log('🎯 백엔드 연결 실패 - 더미 keypoints 데이터 사용:', error.message);
    const question = dummyQuestionsData.find(q => q.id === questionId) || dummyQuestionsData[0];
    return {
      text: question.teachingExplainerMd || "서버 연결 실패로 더미 데이터를 사용합니다.",
      keypoints: question.solvingKeypointsMd || "기본 학습 내용"
    };
  }
};

// 폴백 함수들 (하위 호환성) - 더미 데이터 사용
export const getTopics = async () => {
  // 현재 백엔드 스펙에 /topics는 없음 → 항상 더미 데이터 반환
  return dummyTopicStats.map(topic => ({
    id: topic.topicId,
    name: topic.topicName,
    completion: topic.completion,
    totalQuestions: topic.totalQuestions,
    completedQuestions: topic.completedQuestions
  }));
};

export const getLevels = async () => {
  // 백엔드에는 "레벨 목록" 전용 엔드포인트가 명세되어 있지 않음 → 더미 고정
  return [
    { id: 1, name: '기초', difficulty: 'easy' },
    { id: 2, name: '중급', difficulty: 'medium' },
    { id: 3, name: '고급', difficulty: 'hard' }
  ];
};

// UI 편의 래퍼: 단일 문항 답안 제출
export const postAttempt = ({ quizId, questionId, selectedOptionId, userId, token }) =>
  submitAnswer({
    quizId,
    userId: withUserId(userId),
    answers: [{ questionId, selectedOptionId }],
    token,
  });

export const getProgress = async () => {
  try {
    return await http('/progress');
  } catch (error) {
    console.log('🎯 백엔드 연결 실패 - 더미 진행률 데이터 사용');
    return dummyProgress;
  }
};

export const putProgress = async (progressData) => {
  try {
    return await http('/progress', {
      method: 'PUT',
      body: JSON.stringify(progressData)
    });
  } catch (error) {
    console.log('🎯 백엔드 연결 실패 - 더미 진행률 저장');
    return { success: true, message: '더미 모드 - 진행률 저장 시뮬레이션' };
  }
};

// 뱃지 데이터 조회
export const getBadges = async () => {
  try {
    return await http('/badges');
  } catch (error) {
    console.log('🎯 백엔드 연결 실패 - 더미 뱃지 데이터 사용');
    return dummyBadges;
  }
};

// 토픽별 통계 조회
export const getTopicStats = async () => {
  // 백엔드 스펙에 /topic-stats 없음 → 더미 고정
  return dummyTopicStats;
};
