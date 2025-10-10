// check-api.js - 백엔드 API 및 주요 데이터 상태 확인 스크립트
// 사용법: node check-api.js

const fetch = require('node-fetch');

const API_BASE = process.env.API_BASE || 'http://localhost:3001/api'; // 환경변수로도 지정 가능

async function check(path, label) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    const json = await res.json();
    console.log(`[${label || path}] status: ${res.status}`);
    console.dir(json, { depth: 5 });
  } catch (e) {
    console.error(`[${label || path}] error:`, e.message);
  }
}

(async () => {
  console.log('--- Finsight 백엔드 API/DB 상태 점검 ---');
  await check('/health', 'health');
  await check('/sectors', 'sectors');
  await check('/subsectors?sectorId=1', 'subsectors (sectorId=1)');
  await check('/levels?subsectorId=1', 'levels (subsectorId=1)');
  await check('/levels/1/quizzes', 'quizzes (levelId=1)');
  // 필요시 추가 엔드포인트 점검 가능
})();
