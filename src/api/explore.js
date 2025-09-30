// src/api/explore.js - 백엔드 API 연동
import { 
  dummyQuizzes, 
  dummyProgress, 
  dummyBadges, 
  dummyTopicStats,
  dummySubmitResponse,
  dummyQuestionsData
} from '../utils/testData.js';

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8081/api';

// 백엔드 연결 상태 확인
let isBackendConnected = false;

// 백엔드 연결 상태 체크 함수
async function checkBackendConnection() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2초로 단축
    
    const res = await fetch(`${API_BASE}/health`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    isBackendConnected = res.ok;
    
    if (isBackendConnected) {
      console.log('✅ 백엔드 서버 연결됨 - 실제 API 사용');
    } else {
      console.log('⚠️ 백엔드 서버 응답 오류 - 더미 데이터 사용');
    }
    
    return isBackendConnected;
  } catch (error) {
    isBackendConnected = false;
    console.log('🔄 백엔드 서버 연결 안됨 - 더미 데이터로 디자인 확인 모드');
    console.log(`   API_BASE: ${API_BASE}`);
    console.log(`   더미 퀴즈 ${dummyQuizzes.length}개 준비됨`);
    return false;
  }
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

// JWT 토큰을 자동으로 헤더에 포함하는 fetch 함수
async function http(path, opts = {}, token) {
  if (!isBackendConnected) {
    throw new Error('Backend not connected - using dummy data');
  }
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
  if (!isBackendConnected) return [];
  return http('/sectors');
};

// 2. 서브섹터(소분류) 상세 조회
export const getSubsector = async (id) => {
  if (!isBackendConnected) return null;
  return http(`/subsectors/${id}`);
};

// 3. 레벨별 퀴즈 목록 및 상태 조회
export const getLevelQuizzes = async (levelId, userId, token) => {
  if (!isBackendConnected) return [];
  return http(`/levels/${levelId}/quizzes?userId=${userId}`, {}, token);
};

// 4. 레벨별 진행도 조회
export const getLevelProgress = async (levelId, userId, token) => {
  if (!isBackendConnected) return null;
  return http(`/levels/${levelId}/progress?userId=${userId}`, {}, token);
};

// 5. 퀴즈 상세 조회
export const getQuiz = async (quizId) => {
  if (!isBackendConnected) {
    // 더미 데이터 반환
    const dummyQuiz = dummyQuizzes.find(q => q.id === parseInt(quizId)) || dummyQuizzes[0];
    return dummyQuiz;
  }
  return http(`/quizzes/${quizId}`);
};

// 6. 답안 제출
// 답안 제출 (백엔드 명세: quizId, userId, answers 배열, JWT 토큰)
export const submitAnswer = async ({ quizId, userId, answers, token }) => {
  if (!isBackendConnected) {
    // 더미 응답 생성
    const isCorrect = Math.random() > 0.4;
    return {
      ...dummySubmitResponse,
      correct: isCorrect,
      selectedOptionId: answers?.[0]?.selectedOptionId,
      correctOptionId: isCorrect ? answers?.[0]?.selectedOptionId : ((answers?.[0]?.selectedOptionId % 4) + 1)
    };
  }
  // 백엔드 명세: { quizId, userId, answers: [{ questionId, selectedOptionId }] }
  return http('/quizzes/submit-answer', {
    method: 'POST',
    body: JSON.stringify({ quizId, userId, answers }),
    token
  }, token);
};

// 7. 퀴즈 결과 조회
export const getQuizResult = async (quizId, userId, token) => {
  if (!isBackendConnected) return null;
  return http(`/quizzes/${quizId}/result?userId=${userId}`, {}, token);
};

// 8. 퀴즈 완료 처리
export const completeQuiz = async (quizId, userId, token) => {
  if (!isBackendConnected) return { success: true };
  return http(`/quizzes/${quizId}/complete?userId=${userId}`, { method: 'POST' }, token);
};

// 9. 레벨 완료 처리
export const completeLevel = async (levelId, userId, token) => {
  if (!isBackendConnected) return { success: true };
  return http(`/levels/${levelId}/complete?userId=${userId}`, { method: 'POST' }, token);
};

// 10. 레벨 시작 처리
export const startLevel = async (levelId, userId, token) => {
  if (!isBackendConnected) return { success: true };
  return http(`/levels/${levelId}/start?userId=${userId}`, { method: 'POST' }, token);
};

// 11. 대시보드 조회
export const getDashboard = async (userId, token) => {
  if (!isBackendConnected) return null;
  return http(`/dashboard?userId=${userId}`, {}, token);
};

// 12. 뱃지 조회
export const getBadgesReal = async (userId, token) => {
  if (!isBackendConnected) return [];
  return http(`/badges/user/${userId}`, {}, token);
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
export const getQuestions = async ({ topicId, levelId } = {}) => {
  console.log('📚 getQuestions 호출됨 - topicId:', topicId, 'levelId:', levelId);
  
  // 백엔드 연결되지 않았거나 더미 모드일 때
  if (!isBackendConnected) {
    console.log('🎯 더미 questions 데이터 사용');
    return {
      questions: dummyQuizzes,
      totalCount: dummyQuizzes.length
    };
  }
  
  try {
    // 백엔드 연결된 경우 실제 API 호출
    const questions = await http(`/questions?topicId=${topicId}&levelId=${levelId}`);
    console.log('✅ 백엔드에서 questions 로드됨');
    return questions;
  } catch (error) {
    console.log('🎯 백엔드 연결 실패 - 더미 questions 데이터 사용:', error.message);
    return {
      questions: dummyQuizzes,
      totalCount: dummyQuizzes.length
    };
  }
};

// 기존 getKeyPoints 함수 -> 더미 데이터 우선 사용
export const getKeyPoints = async ({ questionId } = {}) => {
  console.log('🔑 getKeyPoints 호출됨 - questionId:', questionId);
  
  // 백엔드 연결되지 않았거나 더미 모드일 때
  if (!isBackendConnected) {
    console.log('🎯 더미 keypoints 데이터 사용');
    const question = dummyQuestionsData.find(q => q.id === questionId) || dummyQuestionsData[0];
    return {
      text: question.teachingExplainerMd || "금융 기초 개념을 학습해보세요.",
      keypoints: question.solvingKeypointsMd || "핵심 포인트를 확인하세요."
    };
  }
  
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
  if (!isBackendConnected) {
    console.log('🎯 더미 토픽 데이터 사용');
    return dummyTopicStats.map(topic => ({
      id: topic.topicId,
      name: topic.topicName,
      completion: topic.completion,
      totalQuestions: topic.totalQuestions,
      completedQuestions: topic.completedQuestions
    }));
  }
  
  try {
    return await http('/topics');
  } catch (error) {
    console.log('🎯 백엔드 연결 실패 - 더미 토픽 데이터 사용');
    return dummyTopicStats.map(topic => ({
      id: topic.topicId,
      name: topic.topicName,
      completion: topic.completion
    }));
  }
};

export const getLevels = async () => {
  if (!isBackendConnected) {
    console.log('🎯 더미 레벨 데이터 사용');
    return [
      { id: 1, name: '기초', difficulty: 'easy' },
      { id: 2, name: '중급', difficulty: 'medium' },
      { id: 3, name: '고급', difficulty: 'hard' }
    ];
  }
  
  try {
    return await http('/levels');
  } catch (error) {
    console.log('🎯 백엔드 연결 실패 - 더미 레벨 데이터 사용');
    return [
      { id: 1, name: '기초', difficulty: 'easy' },
      { id: 2, name: '중급', difficulty: 'medium' },
      { id: 3, name: '고급', difficulty: 'hard' }
    ];
  }
};

export const postAttempt = ({ questionId, choiceId }) => submitAnswer(questionId, choiceId);

export const getProgress = async () => {
  if (!isBackendConnected) {
    console.log('🎯 더미 진행률 데이터 사용');
    return dummyProgress;
  }
  
  try {
    return await http('/progress');
  } catch (error) {
    console.log('🎯 백엔드 연결 실패 - 더미 진행률 데이터 사용');
    return dummyProgress;
  }
};

export const putProgress = async (progressData) => {
  if (!isBackendConnected) {
    console.log('🎯 더미 진행률 저장 (실제 저장 안됨)');
    return { success: true, message: '더미 모드 - 진행률 저장됨' };
  }
  
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
  if (!isBackendConnected) {
    console.log('🎯 더미 뱃지 데이터 사용');
    return dummyBadges;
  }
  
  try {
    return await http('/badges');
  } catch (error) {
    console.log('🎯 백엔드 연결 실패 - 더미 뱃지 데이터 사용');
    return dummyBadges;
  }
};

// 토픽별 통계 조회
export const getTopicStats = async () => {
  if (!isBackendConnected) {
    console.log('🎯 더미 토픽 통계 데이터 사용');
    return dummyTopicStats;
  }
  
  try {
    return await http('/topic-stats');
  } catch (error) {
    console.log('🎯 백엔드 연결 실패 - 더미 토픽 통계 데이터 사용');
    return dummyTopicStats;
  }
};
