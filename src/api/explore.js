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
  const isArticleLike = looksArticleType(rawType) || !!image || !!nestedArticle || hasArticleId;
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
        q.articleTitleMd ?? q.article_title_md ?? q.articleTitle ?? q.article_title ??
        q.newsTitle ?? q.news_title ?? q.contextTitle ?? q.context_title ??
        nestedArticle?.title ?? (articlesMap[String(q.articleId ?? q.article_id)]?.title) ?? null
      ),
      articleBodyMd: (
        q.articleBodyMd ?? q.article_body_md ?? q.articleBody ?? q.article_body ??
        q.articleMd ?? q.article_md ?? q.article ?? q.contentMd ?? q.content_md ?? q.content ??
        q.contextMd ?? q.context_md ?? q.context ?? q.passageMd ?? q.passage_md ?? q.passage ??
        nestedArticle?.body_md ?? nestedArticle?.bodyMd ?? nestedArticle?.body ?? nestedArticle?.content ??
        (articlesMap[String(q.articleId ?? q.article_id)]?.body_md || articlesMap[String(q.articleId ?? q.article_id)]?.bodyMd || articlesMap[String(q.articleId ?? q.article_id)]?.body) ?? null
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
  type: (() => {
    const rawLower = String(rawType || '').trim().toLowerCase();
    if (isArticleLike) return 'articleImage';
    if (isStoryLike) return 'story';
    // 백엔드가 ARTICLE만 주는 경우 대비
    if (rawLower === 'article') return 'articleImage';
    return rawType ?? undefined;
  })(),
      // articleId를 표준화해 보관
      articleId: q.articleId ?? q.article_id ?? undefined,
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
      if (mapped?.type === 'articleImage') {
        const t = mapped?.articleTitleMd || '';
        const imgFlag = !!(mapped?.image);
        console.log(`📰 [ARTICLE DETECTED] id=${mapped?.id ?? q?.id}, type=${rawType}, image=${imgFlag}, articleId=${mapped?.articleId ?? q?.article_id}, title='${String(t).slice(0,30)}'`);
      } else {
        console.log(`⚠️ [NOT ARTICLE] id=${mapped?.id ?? q?.id}, type=${rawType}`);
      }
    } catch (_) { /* noop log */ }

    return mapped;
  });
  return { ...raw, questions };
}

// 6. 답안 제출
// 답안 제출 (백엔드 명세: quizId, userId, answers 배열, JWT 토큰)
export const submitAnswer = async ({ quizId, userId, answers, token, articleId }) => {
  const nQuizId = Number(quizId);
  if (!Number.isFinite(nQuizId)) return {};
  const first = Array.isArray(answers) && answers[0] ? answers[0] : null;
  if (!first?.questionId || !first?.selectedOptionId) return {};
  const payload = { quizId: nQuizId, userId: withUserId(userId), answers, articleId };
  try {
    console.log('📤 submitAnswer → POST /quizzes/submit-answer');
    return await http('/quizzes/submit-answer', {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    }, token);
  } catch (e) {
    console.warn('❌ submitAnswer 실패, 로컬 판정 폴백:', e.message);
    return { selectedOptionId: first.selectedOptionId };
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
export const getQuestions = async ({ levelId, subTopicId, subTopic } = {}) => {
  const uid = withUserId();
  const lid = coerceLevelId(levelId);
  try {
    const params = new URLSearchParams();
    if (uid != null) params.set('userId', uid);
    const subsector = subTopicId ?? (typeof subTopic === 'number' ? subTopic : undefined);
    if (subsector != null) params.set('subsectorId', subsector);
    const listResp = await http(`/levels/${lid}/quizzes?${params.toString()}`);
    const quizList = Array.isArray(listResp?.quizzes) ? listResp.quizzes : (Array.isArray(listResp) ? listResp : []);
    if (!quizList.length) throw new Error('No quizzes for level');
    const prioritized = quizList.find(q => q.status === 'NOT_STARTED') || quizList.find(q => q.status === 'IN_PROGRESS') || quizList[0];
    const quizId = prioritized?.id ?? prioritized?.quizId ?? quizList[0]?.id;
    if (!quizId) throw new Error('No quizId');
    const raw = await http(`/quizzes/${quizId}`);
    const norm = normalizeQuizPayload(raw) || {};
    const qs = Array.isArray(norm.questions) ? norm.questions : [];
    console.log(`✅ 레벨 ${lid} 퀴즈 ${quizId} 로드 (${qs.length}문항)`);
    return { questions: qs, totalCount: qs.length, quizId };
  } catch (e) {
    console.warn('❌ getQuestions 실패:', e.message);
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
    answers: [{ questionId, selectedOptionId }],
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
