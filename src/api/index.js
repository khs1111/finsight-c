// 통합 API 모듈 (뉴스 제외)
import * as explore from './explore';
import * as profile from './profile';
import * as community from './community';
import * as study from './study';
export * from './levels';

// 백엔드 엔드포인트에 맞게 각 모듈에서 함수 구현 (이미 구현됨)
// 뉴스(news.js)는 외부 API이므로 여기서 제외

const api = {
  ...explore,
  ...profile,
  ...community,
  ...study,
};

export default api;
