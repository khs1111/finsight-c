// src/api/explore.js - 백엔드 API 연동
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
    // 더미 데이터 사용 제거: 실패 시 null 반환
    return null;
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
  // 백엔드 응답 변형 대응: data.questions 등 다양한 래핑을 허용
  const articlesArray = Array.isArray(raw?.articles)
    ? raw.articles
    : (Array.isArray(raw?.data?.articles) ? raw.data.articles : (Array.isArray(raw?.result?.articles) ? raw.result.articles : []));
  const questionsArray = Array.isArray(raw?.questions)
    ? raw.questions
    : (Array.isArray(raw?.data?.questions) ? raw.data.questions : (Array.isArray(raw?.result?.questions) ? raw.result.questions : []));

  // 미리 기사 맵 구성: id->article 매핑
  const articlesMap = Array.isArray(articlesArray)
    ? articlesArray.reduce((acc, a) => { const id = a?.id ?? a?.articleId ?? a?.article_id; if (id != null) acc[String(id)] = a; return acc; }, {})
    : {};
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
        // 이미지 베이스(명시된 경우 우선) 또는 오리진에 바로 결합 (API 경로는 붙이지 않음)
        const base = (IMAGE_BASE || origin).replace(/\/$/, '');
        const abs = `${base}/${normalized}`;
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
  // 스토리형 판별 보조 함수
  const looksStoryType = (t) => {
    if (!t) return false;
    const s = String(t).trim().toLowerCase();
    return s.includes('story') || s.includes('case') || s.includes('scenario');
  };


  const questions = (questionsArray || []).map((q) => {
    // 이미지 후보 키들(백엔드 다양성 대응): 가장 먼저 매칭되는 값을 사용
    const nestedArticle = (() => {
      // 다양한 키, 대소문자, 중첩 위치 대응
      const cands = [
        q.article, q.Article, q.news, q.News,
        q.articleObj, q.articleObject,
        q.context?.article, q.payload?.article,
        Array.isArray(q.articles) ? q.articles[0] : undefined
      ];
      return cands.find(v => v && typeof v === 'object') || null;
    })();
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
      const artImg = nestedArticle.image_url || nestedArticle.imageUrl || nestedArticle.image_path || nestedArticle.imagePath || nestedArticle.img || nestedArticle.thumbnail;
      image = sanitizeImageUrl(artImg);
    }
    // raw.articles에서 보강
    if (!image) {
      const aId = q.articleId ?? q.article_id;
      if (aId != null && articlesMap && articlesMap[String(aId)]) {
        const art = articlesMap[String(aId)];
        const artImg = art?.image_url || art?.imageUrl || art?.image_path || art?.imagePath || art?.img || art?.thumbnail;
        image = sanitizeImageUrl(artImg);
      }
    }
  const rawType = q.type ?? q.questionType ?? q.kind;
  const hasArticleId = q.articleId != null || q.article_id != null;
  // 기사형 판정: 명시적 type 기사, 이미지가 있거나, article_id 또는 중첩 기사객체가 있는 경우 모두 인정
  const isArticleLike = looksArticleType(rawType) || !!nestedArticle || hasArticleId;
  // 스토리형 판정: 명시적 type 또는 스토리 관련 필드가 있는 경우
  const storyTitleCand = (
    q.storyTitleMd ?? q.story_title_md ?? q.storyTitle ?? q.story_title ??
    q.caseTitle ?? q.case_title ?? q.scenarioTitle ?? q.scenario_title ?? null
  );
  const storyBodyCand = (
    q.storyBodyMd ?? q.story_body_md ?? q.story ?? q.storyMd ??
    q.caseBody ?? q.case_body ?? q.scenarioBody ?? q.scenario_body ??
    q.scenarioMd ?? q.scenario_md ?? q.contextStory ?? q.context_story ?? null
  );
  const isStoryLike = looksStoryType(rawType) || !!(storyTitleCand || storyBodyCand);
  const articleIdFromNested = nestedArticle?.id ?? nestedArticle?.articleId ?? nestedArticle?.article_id;
      const aFromMap = (() => {
        const key = q.articleId ?? q.article_id ?? articleIdFromNested;
        if (key == null) return null;
        return articlesMap[String(key)] || null;
      })();
      const articleSource = aFromMap || nestedArticle || {};
      const articleTitleNorm = (
        articleSource?.title_md || articleSource?.titleMd || articleSource?.title || null
      );
      const articleBodyNorm = (
        articleSource?.body_md || articleSource?.bodyMd || articleSource?.body || articleSource?.content || null
      );
      const articleImageRaw = (
        articleSource?.image_url || articleSource?.imageUrl || articleSource?.image_path || articleSource?.imagePath || null
      );
      const articleImageAbs = articleImageRaw ? sanitizeImageUrl(articleImageRaw) : null;
      const mapped = {
      ...q,
      // 질문 본문/지문 매핑 보강
      question: (
        q.question ?? q.questionText ?? q.prompt ?? q.title ?? q.text ?? q.stem ?? q.stemMd ?? ''
      ),
      stemMd: (
        q.stemMd ?? q.stem ?? q.questionText ?? q.prompt ?? q.text ?? q.question ?? ''
      ),
      // 스토리형 본문/제목 매핑 (백엔드 다양한 키 대응)
      storyTitleMd: (
        storyTitleCand ?? null
      ),
      storyBodyMd: (
        storyBodyCand ?? null
      ),
      // 기사형 본문/제목 매핑 (백엔드 다양한 키 대응)
      articleTitleMd: (
        q.articleTitleMd ?? q.article_title_md ?? articleTitleNorm
      ),
      articleBodyMd: (
        q.articleBodyMd ?? q.article_body_md ?? q.articleBody ?? q.article_body ??
        q.articleMd ?? q.article_md ?? articleBodyNorm
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
  type: (rawType ? String(rawType).toUpperCase() : (isArticleLike ? 'ARTICLE' : (isStoryLike ? 'STORY' : 'CONCEPT'))),
      layout: isArticleLike ? 'article' : 'default',
      // articleId 표준화
      articleId: q.articleId ?? q.article_id ?? articleIdFromNested ?? undefined,
      articleTitle: (q.articleTitle || q.article_title || articleTitleNorm || undefined),
      articleBody: (q.articleBody || q.article_body || articleBodyNorm || undefined),
      articleImage: (q.articleImage || q.article_image || articleImageAbs || undefined),
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

    // 진단 로그: 기사형 감지 여부
    try {
      if (mapped?.type === 'ARTICLE') {
        const t = mapped?.articleTitleMd || '';
        const imgFlag = !!(mapped?.image);
        console.log(`📰 [ARTICLE DETECTED] id=${mapped?.id ?? q?.id}, type=${rawType}, image=${imgFlag}, articleId=${mapped?.articleId ?? q?.article_id}, title='${String(t).slice(0,30)}'`);
      } else {
        console.log(`ℹ️ [TYPE] id=${mapped?.id ?? q?.id}, type=${mapped?.type}`);
      }
    } catch (_) { /* noop log */ }

    return mapped;
  });
  return { ...raw, questions };
}

// =====================================================
// 추가: ARTICLE/STORY 정규화 및 최종 문제 선택 유틸
// =====================================================
const isArticleType = (q) => {
  const t = (q?.type || '').toString().toUpperCase();
  return t === 'ARTICLE' || t === 'ARTICLEIMAGE';
};


const normalizeQuestionLight = (server) => {
  const norm = {
    id: server?.id ?? server?.questionId ?? server?.question_id ?? null,
    quizId: server?.quizId ?? server?.quiz_id ?? null,
    type: (server?.type || '').toString().toUpperCase(),
    sortOrder: server?.sort_order ?? server?.sortOrder ?? null,
    stem: server?.stem_md ?? server?.stem ?? server?.question ?? '',
  };
  // 선택지: 기존 컴포넌트가 options[].text 사용하므로 text 채움
  const rawOpts = server?.options ?? [];
  norm.options = rawOpts.map((o, idx) => ({
    id: o?.id ?? o?.optionId ?? (idx + 1),
    text: o?.text ?? o?.content_md ?? o?.content ?? o?.optionText ?? '',
    isCorrect: !!(o?.isCorrect ?? o?.is_correct),
    sortOrder: o?.sort_order ?? o?.sortOrder ?? idx,
  })).sort((a,b)=>(a.sortOrder??a.id??0)-(b.sortOrder??b.id??0));

  if (isArticleType(norm) || isArticleType(server)) {
    const art = server?.article || {};
    norm.type = 'ARTICLE';
    norm.articleId = art?.id ?? server?.articleId ?? server?.article_id ?? null;
    norm.articleTitleMd = art?.title_md || art?.title || server?.articleTitleMd || '';
    norm.articleBodyMd = art?.body_md || art?.body || server?.articleBodyMd || '';
    norm.articleTitle = norm.articleTitleMd;
    norm.articleBody = norm.articleBodyMd;
    const imgRaw = art?.image_url || art?.imageUrl || server?.image_url || server?.imageUrl || null;
    norm.articleImage = imgRaw || null; // sanitize 이전 단계 (이미 상위 정규화에서 처리됨)
  }
  return norm;
};

const buildFinalQuestions = (quizQuestions) => {
  const qs = (quizQuestions || []).map(normalizeQuestionLight);
  // 정렬
  qs.sort((a,b)=>{
    const av = a.sortOrder ?? a.id ?? 0; const bv = b.sortOrder ?? b.id ?? 0; return av - bv;
  });
  // 기사 4번 슬롯 배치
  const articleIdx = qs.findIndex(isArticleType);
  if (articleIdx === -1) {
    return qs.slice(0,3); // 기사 없으면 3문항 제한 (요구사항에 맞춤)
  }
  const articleQ = qs[articleIdx];
  const others = qs.filter((_,i)=>i!==articleIdx);
  return [...others.slice(0,3), articleQ];
};

// 6. 답안 제출 (단일 시도 전용)
// 백엔드 스펙: POST /quizzes/submit-answer  { quizId, userId, questionId, selectedOptionId }
export const submitAnswer = async ({ quizId, userId, questionId, selectedOptionId, token }) => {
  const nQuizId = Number(quizId);
  if (!Number.isFinite(nQuizId)) return {};
  if (questionId == null || selectedOptionId == null) return {};
  const body = {
    quizId: nQuizId,
    userId: withUserId(userId),
    questionId,
    selectedOptionId,
  };
  console.log('📤 submitAnswer → POST /quizzes/submit-answer | keys=[' + Object.keys(body).join(', ') + ']');
  try {
    return await http('/quizzes/submit-answer', {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    }, token);
  } catch (e) {
    console.warn('❌ submitAnswer 실패:', e.message);
    return {};
  }
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
                const artImg = art?.image_url || art?.imageUrl || art?.image_path || art?.imagePath || art?.image || art?.img || art?.thumbnail;
                // Use same rules as sanitizeImageUrl (no API path leakage)
                const image = artImg ? (() => {
                  const s = String(artImg).trim();
                  if (/^(https?:\/\/|data:|blob:)/i.test(s)) return s;
                  try {
                    const apiUrl = new URL(API_BASE, (typeof window !== 'undefined' ? window.location.origin : undefined));
                    const origin = apiUrl.origin;
                    if (/^\//.test(s)) {
                      const base = IMAGE_BASE || origin;
                      return `${base}${s}`;
                    }
                    const normalized = s.replace(/^\/+/, '');
                    const base = (IMAGE_BASE || origin).replace(/\/$/, '');
                    return `${base}/${normalized}`;
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

    // 1순위: 주제 매칭 점수 우선 (기사형 여부와 무관) — 백엔드가 퀴즈 내부에서 3/4번 유형을 보장
    const withScores = details.map(d => ({ ...d, score: scoreOf(d.norm) }));
    const primaryEntry = withScores.find(d => d.id === prioritizedId && d.norm);
    // 우선 선택: 주제 매칭 점수가 양수인 것 중 최고점, 없으면 우선순위 퀴즈 유지
    const positive = withScores.filter(d => d.norm && d.score > 0);
    const bestByTopic = positive.sort((a,b) => (b.score - a.score))[0];
    const chosenEntry = bestByTopic || primaryEntry || withScores.find(d => d.norm) || null;

    const chosen = chosenEntry?.norm;
    const chosenId = chosenEntry?.id || prioritizedId;
    if (chosen) {
      console.log(`🧩 선택된 퀴즈 ${chosenId} | 주제 매칭 점수=${chosenEntry?.score||0}`);
    }

    const finalQuestions = buildFinalQuestions(chosen?.questions);
    console.log(`✅ 레벨 ${levelId} → 퀴즈 ${chosenId} 로드됨 (${finalQuestions.length}문항; 정렬됨; 주제 매칭 점수=${chosenEntry?.score||0})`);
    return { questions: finalQuestions, totalCount: finalQuestions.length, quizId: chosenId };
  } catch (error) {
    console.log('❌ 백엔드 로드 실패 (getQuestions):', error.message);
    // 더미 데이터 사용 제거: 빈 결과 반환
    return { questions: [], totalCount: 0 };
  }
};

// 레벨 메타데이터 조회 (설명/목표 등) - 존재하지 않으면 null 반환
// 현재 스펙에는 별도 Level 메타 조회 엔드포인트가 없으므로, 호출을 제거합니다.
export const getLevelMeta = async (_levelId) => ({})
// 기존 getKeyPoints 함수 -> 더미 데이터 우선 사용
export const getKeyPoints = async ({ questionId } = {}) => {
  console.log('🔑 getKeyPoints 호출됨 - questionId:', questionId);
  try {
    // 백엔드 연결된 경우 실제 API 호출
    const keypoints = await http(`/keypoints/${questionId}`);
    console.log('✅ 백엔드에서 keypoints 로드됨');
    return keypoints;
  } catch (error) {
    console.log('❌ 백엔드 연결 실패 (getKeyPoints):', error.message);
    // 더미 사용 제거: 최소 안전 형태 반환
    return { text: '', keypoints: '' };
  }
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
  submitAnswer({
    quizId,
    userId: withUserId(userId),
    questionId,
    selectedOptionId,
    token,
  });

export const getProgress = async () => {
  try {
    return await http('/progress');
  } catch (error) {
    console.log('❌ 백엔드 연결 실패 (getProgress)');
    return null;
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
    console.log('❌ 백엔드 연결 실패 (getBadges)');
    return [];
  }
};

// 토픽별 통계 조회
export const getTopicStats = async () => {
  // 백엔드 스펙에 /topic-stats 없음 → 빈 객체/배열 반환
  return [];
};
