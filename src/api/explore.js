// src/api/explore.js - 백엔드 API 연동
import { 
  dummyQuizzes, 
  dummyProgress, 
  dummyBadges, 
  dummyTopicStats,
  dummySubmitResponse,
  dummyQuestionsData
} from '../utils/testData.js';
import { API_BASE } from './config';
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
  const map = {
    '초급자': 1,
    '기초': 1,
    '초보자': 1,
    '중급자': 2,
    '중급': 2,
    '고급자': 3,
    '고급': 3,
  };
  return map[String(levelId).trim()] || 1;
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
  const questions = (raw.questions || []).map((q) => {
    // 이미지 후보 키들(백엔드 다양성 대응): 가장 먼저 매칭되는 값을 사용
    const img = (
      q.image ?? q.imageUrl ?? q.imageURL ?? q.imgUrl ?? q.img_url ??
      q.imagePath ?? q.image_path ?? q.mediaUrl ?? q.media_url ??
      q.articleImage ?? q.articleImageUrl ?? q.article_image_url ?? q.article_image ?? q.articleImg ??
      q.contentImageUrl ?? q.content_image_url ?? q.thumbnail ?? q.thumbnailUrl ?? q.thumbnailURL ??
      q.thumbUrl ?? q.thumb_url ?? q.newsImageUrl ?? q.news_image_url ?? q.newsImg ?? q.news_image ??
      q.picture ?? q.photo ?? q.coverImage ?? q.cover_image ?? q.coverImageUrl ?? q.cover_image_url ??
      null
    );
    const mapped = {
      ...q,
      question: q.question ?? q.questionText ?? q.stemMd ?? '',
      stemMd: q.stemMd ?? q.questionText ?? q.question ?? '',
      // 학습/핵심포인트/힌트 정규화
      solvingKeypointsMd: (
        q.solvingKeypointsMd ?? q.solvingKeypoints ?? q.keypointsMd ?? q.keyPointsMd ?? q.keypoints ?? q.keyPoints ?? q.key_points ?? null
      ),
      teachingExplainerMd: (
        q.teachingExplainerMd ?? q.explainerMd ?? q.explainer ?? q.explanationMd ?? q.explanation ?? null
      ),
      hintMd: (
        q.hintMd ?? q.hint ?? q.tipsMd ?? q.tips ?? null
      ),
      // 기사형 문제 처리: 다양한 키에서 이미지 필드 정규화 (확장)
      image: img,
      // 백엔드에서 type이 없더라도 이미지가 있으면 articleImage로 간주 (정규화된 image 값 기준)
      type: q.type ?? (img ? 'articleImage' : undefined),
      options: (q.options || []).map((o) => ({
        ...o,
        id: o.id ?? o.optionId ?? o.valueId ?? o.value ?? null,
        text: o.text ?? o.optionText ?? o.label ?? '',
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
  try {
    return await http('/quizzes/submit-answer', {
      method: 'POST',
      body: JSON.stringify({ quizId, userId: withUserId(userId), answers }),
      token
    }, token);
  } catch {
    const isCorrect = Math.random() > 0.4;
    return {
      ...dummySubmitResponse,
      correct: isCorrect,
      selectedOptionId: answers?.[0]?.selectedOptionId,
      correctOptionId: isCorrect ? answers?.[0]?.selectedOptionId : ((answers?.[0]?.selectedOptionId % 4) + 1)
    };
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
export const getQuestions = async ({ topicId, subTopic, levelId } = {}) => {
  console.log('📚 getQuestions 호출됨 - topicId:', topicId, 'levelId:', levelId);
  const uid = withUserId();
  const lid = coerceLevelId(levelId);
  try {
    // 1) 레벨별 퀴즈 목록 조회
    const levelData = await http(`/levels/${lid}/quizzes?userId=${uid}`);
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
          return { id, norm };
        } catch (_) { return { id, norm: null }; }
      })
    );

    // 선호도 함수들
    const hasArticle = (norm) => Array.isArray(norm?.questions) && norm.questions.some(
      (q) => q.type === 'articleImage' || !!q.image
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

    const kw = getKeywords(topicId, subTopic).map(k => String(k).toLowerCase());
    const textOfQuiz = (norm) => {
      if (!norm?.questions) return '';
      return norm.questions.map(q => [q.question, q.stemMd, q.teachingExplainerMd, q.solvingKeypointsMd, ...(q.options||[]).map(o=>o.text)]
        .flat().filter(Boolean).join(' ')).join(' ');
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
      chosenEntry = onlyArticle.sort((a,b) => (b.score - a.score))[0];
    } else {
      // 기사형이 하나도 없으면 주제 매칭 점수 기준으로 선택 (백엔드 데이터 이슈 가능성 로그)
      chosenEntry = withScores
        .filter(d => d.norm)
        .sort((a,b) => (b.score - a.score))[0];
      console.log('ℹ️ 선택된 레벨 퀴즈들 중 기사형 문항이 없습니다. 백엔드에서 이미지가 포함된 문항을 제공하지 않는 상태일 수 있습니다.');
    }

    const chosen = chosenEntry?.norm;
    const chosenId = chosenEntry?.id || prioritizedId;

    // 기사형 문항을 4번째 위치(인덱스 3)로 이동
    let qs = Array.isArray(chosen?.questions) ? chosen.questions : [];
    const moveArticleToIndex = (arr, targetIdx = 3) => {
      if (!Array.isArray(arr) || arr.length === 0) return arr || [];
      const idx = arr.findIndex(q => q?.type === 'articleImage' || q?.image);
      if (idx === -1) return arr;
      const ti = Math.min(targetIdx, Math.max(0, arr.length - 1));
      if (idx === ti) return arr;
      const clone = arr.slice();
      const [item] = clone.splice(idx, 1);
      clone.splice(ti, 0, item);
      console.log(`🔀 기사형 문항 위치 이동: 원래 인덱스 ${idx} → ${ti} (총 ${arr.length}문항)`);
      return clone;
    };
    qs = moveArticleToIndex(qs, 3);

    const hasAnyArticle = qs.some(q=>q.type==='articleImage'||q.image);
    console.log(`✅ 레벨 ${levelId} → 퀴즈 ${chosenId} 로드됨 (${qs.length}문항${hasAnyArticle?', 기사형 포함' : ''}; 주제 매칭 점수=${chosenEntry?.score||0})`);
    if (!hasAnyArticle) {
      console.log('⚠️ 최종 선택된 퀴즈에 기사형 문항이 없습니다. 백엔드에서 이미지 필드가 제공되지 않았거나 키 매핑이 누락되었을 수 있습니다. 지원 키: image, imageUrl, imageURL, imgUrl, img_url, imagePath, image_path, mediaUrl, media_url, articleImage, articleImageUrl, article_image_url, article_image, articleImg, contentImageUrl, content_image_url, thumbnail, thumbnailUrl, thumbnailURL, thumbUrl, thumb_url, newsImageUrl, news_image_url, newsImg, news_image, picture, photo, coverImage, cover_image, coverImageUrl, cover_image_url');
    }
    return { questions: qs, totalCount: qs.length, quizId: chosenId };
  } catch (error) {
    console.log('🎯 백엔드 로드 실패 - 더미 questions 사용:', error.message);
    return { questions: dummyQuizzes, totalCount: dummyQuizzes.length };
  }
};

// 레벨 메타데이터 조회 (설명/목표 등) - 존재하지 않으면 null 반환
export const getLevelMeta = async (levelId) => {
  const lid = coerceLevelId(levelId);
  try {
    // 우선 /levels/:id/meta → 실패 시 /levels/:id로 폴백
    try {
      const meta = await http(`/levels/${lid}/meta`);
      if (meta) return meta;
    } catch { /* try fallback */ }
    const res = await http(`/levels/${lid}`);
    return res || {};
  } catch {
    return {};
  }
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
