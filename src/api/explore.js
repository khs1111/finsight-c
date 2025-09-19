// src/api/explore.js - 백엔드 API 연동
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  "/api";

async function http(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    credentials: "include",
    ...opts,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

// ========================================
// � 백엔드 API 엔드포인트들
// ========================================

// 퀴즈 조회 - 백엔드: GET /api/quizzes/{id}
export const getQuiz = async (quizId) => {
  try {
    const quiz = await http(`/quizzes/${quizId}`);
    return {
      success: true,
      data: quiz
    };
  } catch (error) {
    console.error('퀴즈 조회 실패:', error);
    return {
      success: false,
      error: error.message,
      // 폴백 데이터
      data: {
        id: quizId,
        title: "샘플 퀴즈",
        questions: [{
          id: 1,
          stemMd: "## 샘플 문제\n다음 중 올바른 것은?",
          answerExplanationMd: "## 해설\n정답은 A입니다.",
          hintMd: "첫 번째 선택지가 정답입니다.",
          teachingExplainerMd: "기본 개념을 이해해보세요.",
          solvingKeypointsMd: "핵심은 첫 번째 선택지입니다.",
          options: [
            { id: 1, label: "A", contentMd: "정답 선택지", isCorrect: true },
            { id: 2, label: "B", contentMd: "오답 선택지", isCorrect: false },
            { id: 3, label: "C", contentMd: "오답 선택지", isCorrect: false },
            { id: 4, label: "D", contentMd: "오답 선택지", isCorrect: false }
          ]
        }]
      }
    };
  }
};

// 답안 제출 - 백엔드: POST /api/quizzes/submit-answer
export const submitAnswer = async (questionId, selectedOptionId) => {
  try {
    const result = await http("/quizzes/submit-answer", {
      method: "POST",
      body: JSON.stringify({
        questionId: questionId,
        selectedOptionId: selectedOptionId
      })
    });
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('답안 제출 실패:', error);
    return {
      success: false,
      error: error.message,
      // 폴백 응답
      data: {
        correct: Math.random() > 0.5,
        correctOptionId: selectedOptionId,
        explanation: "## 해설\n서버 연결 실패로 인한 샘플 응답입니다."
      }
    };
  }
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
    console.error('회원가입 실패:', error);
    return {
      success: false,
      error: error.message
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
    console.error('로그인 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ========================================
// 🔄 기존 함수들 (호환성 유지)
// ========================================

// 기존 getQuestions 함수 -> 새로운 getQuiz로 리다이렉트
export const getQuestions = async ({ topicId, levelId }) => {
  console.warn('getQuestions는 deprecated됩니다. getQuiz를 사용해주세요.');
  
  // 임시로 퀴즈 ID 1을 사용 (나중에 topicId, levelId 기반으로 수정 가능)
  const result = await getQuiz(1);
  
  if (result.success) {
    return {
      questions: result.data.questions,
      totalCount: result.data.questions.length
    };
  } else {
    throw new Error(result.error);
  }
};

// 기존 getKeyPoints 함수 -> 퀴즈 데이터에서 추출
export const getKeyPoints = async ({ questionId } = {}) => {
  console.warn('getKeyPoints는 deprecated됩니다. getQuiz에서 teachingExplainerMd를 사용해주세요.');
  
  try {
    const result = await getQuiz(1);
    if (result.success) {
      const question = result.data.questions.find(q => q.id === questionId) || result.data.questions[0];
      return {
        text: question.teachingExplainerMd || question.solvingKeypointsMd || "핵심 포인트를 불러올 수 없습니다.",
        keypoints: question.solvingKeypointsMd || "핵심 포인트를 불러올 수 없습니다."
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('핵심포인트 조회 실패:', error);
    return {
      text: "서버 연결 실패로 핵심포인트를 불러올 수 없습니다.",
      keypoints: "기본 학습 내용"
    };
  }
};

// 폴백 함수들 (하위 호환성)
export const getTopics = () => Promise.resolve([]);
export const getLevels = () => Promise.resolve([]);
export const postAttempt = ({ questionId, choiceId }) => submitAnswer(questionId, choiceId);
export const getProgress = () => Promise.resolve({ index: 0, answers: [] });
export const putProgress = () => Promise.resolve();
