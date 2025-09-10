// src/api/explore.js
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:3000";

async function http(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// 🆕 주제 목록
export const getTopics = () => http("/topics");

// 레벨 목록
export const getLevels = () => http("/levels");

// 문제 목록(토픽/레벨)
export const getQuestions = ({ topicId, levelId }) =>
  http(`/questions?topic=${encodeURIComponent(topicId)}&level=${encodeURIComponent(levelId)}`);

// 정답 시도 저장(서버 채점)
export const postAttempt = ({ userId = null, questionId, choiceId }) =>
  http("/attempts", { method: "POST", body: JSON.stringify({ userId, questionId, choiceId }) });

// 진행도 조회/저장(선택)
export const getProgress = ({ userId = null, topicId, levelId }) =>
  http(
    `/progress?topic=${encodeURIComponent(topicId)}&level=${encodeURIComponent(levelId)}&userId=${encodeURIComponent(
      userId ?? ""
    )}`
  );

export const putProgress = ({ userId = null, topicId, levelId, index }) =>
  http("/progress", { method: "PUT", body: JSON.stringify({ userId, topicId, levelId, index }) });
