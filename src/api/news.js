// src/api/news.js
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

/**
 * HTTP 요청 헬퍼 함수
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    console.log('API 요청:', url); // 디버깅용
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 응답 오류:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API 응답 데이터:', data); // 디버깅용
    return data;
  } catch (error) {
    console.error('API 요청 실패:', error);
    throw error;
  }
}

/**
 * 오늘의 뉴스 목록 가져오기
 * @param {number} skip - 건너뛸 기사 수 (페이지네이션)
 * @param {number} limit - 가져올 기사 수 (최대 100)
 */
export const getTodayNews = async (skip = 0, limit = 20) => {
  return await apiRequest(`/api/articles/today?skip=${skip}&limit=${limit}`);
};

/**
 * 카테고리별 뉴스 목록 가져오기
 * @param {string} category - 카테고리명 (금융, 증권, 글로벌 경제, 생활 경제 등)
 * @param {number} skip - 건너뛸 기사 수
 * @param {number} limit - 가져올 기사 수
 */
export const getNewsByCategory = async (category, skip = 0, limit = 20) => {
  const encodedCategory = encodeURIComponent(category);
  return await apiRequest(`/api/articles/category/${encodedCategory}?skip=${skip}&limit=${limit}`);
};

/**
 * 특정 기사의 상세 정보 가져오기
 * @param {number} articleId - 기사 ID
 */
export const getArticleDetail = async (articleId) => {
  return await apiRequest(`/api/articles/${articleId}`);
};

/**
 * 키워드/해시태그 검색
 * @param {string} q - 검색어
 * @param {number} skip - 건너뛰기
 * @param {number} limit - 개수(최대 100)
 */
export const searchArticles = async (q, skip = 0, limit = 20) => {
  const encoded = encodeURIComponent(q);
  return await apiRequest(`/api/articles/search?q=${encoded}&skip=${skip}&limit=${limit}`);
};

/**
 * 카테고리 매핑 (한글 카테고리명을 서버에서 사용하는 카테고리명으로 변환)
 */
export const CATEGORY_MAPPING = {
  '오늘의 뉴스': 'today', // 특별 처리 (getTodayNews 사용)
  '금융': '금융',
  '증권': '증권', 
  '글로벌 경제': '글로벌 경제',
  '생활 경제': '생활 경제'
};

/**
 * 통합 뉴스 가져오기 함수 (카테고리에 따라 적절한 API 호출)
 * @param {string} category - 카테고리명
 * @param {number} skip - 건너뛸 기사 수
 * @param {number} limit - 가져올 기사 수
 */
export const getNewsData = async (category = '오늘의 뉴스', skip = 0, limit = 20) => {
  try {
    if (category === '오늘의 뉴스') {
      return await getTodayNews(skip, limit);
    } else {
      const mappedCategory = CATEGORY_MAPPING[category] || category;
      return await getNewsByCategory(mappedCategory, skip, limit);
    }
  } catch (error) {
    console.error(`${category} 뉴스 로딩 실패:`, error);
    throw error;
  }
};