
# 🚀 Finsight 프론트엔드 프로젝트

## 📘 프로젝트 개요

Finsight 앱의 프론트엔드(React) 코드입니다. 모바일 퍼스트 UI, 실시간 API 연동, 섹터별 오답노트 통계, 커뮤니티, 뉴스, 프로필 등 다양한 학습/커뮤니티 기능을 제공합니다.

### 주요 화면 및 기능
- Explore (탐험지/퀴즈): 주제/세부주제/레벨 선택 → 퀴즈(4문항) → 완료 화면
- News / Newsletter: 오늘의 뉴스, 카테고리별, 뉴스레터 구독/상세
- Community: 커뮤니티 게시글 목록, 상세, 댓글(시간 KST 변환), 티어/배지
- Profile: 출석 캘린더, 배지, 닉네임, 티어
- Study: 단어장, 오답노트(섹터별 통계/목록)

모든 목록 화면에서 각 아이템(뉴스, 커뮤니티 글, 오답노트 등)을 클릭하면 상세 화면으로 이동합니다. 각 상세 화면은 API로 데이터를 받아와 렌더링합니다.


## 📑 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [문서 (Frontend)](#-문서-frontend)
3. [프로젝트 구조](#-프로젝트-구조)
4. [기술 스택](#-기술-스택)
5. [주요 기능 및 API 연결](#-주요-기능-및-api-연결)
6. [패키지 구조](#-패키지-구조)
7. [데이터베이스 설계(프론트 관점)](#-데이터베이스-설계프론트-관점)
8. [환경 변수](#-환경-변수)
9. [실행 방법](#-실행-방법)
10. [배포](#-배포)
11. [작업 기록 요약](#-작업-기록-요약)
12. [라우팅 구조 및 화면 이동](#-라우팅-구조-및-화면-이동)
13. [API 매핑](#-api-매핑)
14. [로컬 실행](#-로컬-실행)
15. [Vercel 배포](#-vercel-배포)
16. [주요 의존성](#-주요-의존성)
17. [라이선스](#-라이선스)
18. [감사의 글](#-감사의-글)

## �📄 문서 (Frontend)


## 🏗️ 프로젝트 구조

```
src/
  api/           # API 래퍼 (explore.js, community.js 등)
  assets/        # 이미지, SVG 등 정적 리소스
  components/    # 재사용 컴포넌트 (study, explore, news, community 등)
  pages/         # 라우팅 단위 페이지 (Home.js, Explore.js, StudyPage.js 등)
  utils/         # 유틸리티 함수
  hooks/         # 커스텀 훅
  App.js         # 앱 엔트리포인트
  index.js       # CRA 엔트리포인트
public/
  index.html
  favicon.ico
```
- [Vercel 배포](#-vercel-배포)
- [작업 기록 요약](#-작업-기록-요약)

## 🧰 기술 스택

- React 18, React Router 6
- CSS(모바일), SVG
- Fetch API, Axios
- Vercel 배포
- API Layer: `src/api/*`에 백엔드 엔드포인트 집약, 폴백 체인으로 다양한 변형 대응
- 상태/세션: `sessionStorage`(guest), `localStorage`(token/userId)
- 배포: Vercel (GitHub → Vercel 연결, CRA Build 출력 `build/`)

- React (Create React App), React Router


## ✨ 주요 기능 및 API 연결

### 1. Explore(탐험지)
- 주제/세부주제/레벨 선택 → 퀴즈(4문항) → 완료 화면
- 주요 라우팅:
  - `/explore` (탐험지 메인): 섹터/주제 목록, 각 섹터 클릭 시 상세로 이동
  - `/explore/level`: 레벨 선택, 각 레벨 클릭 시 퀴즈로 이동
  - `/explore/quiz`: 퀴즈 진행(4문항), 각 문제 제출 시 API 호출
  - `/explore/complete`: 완료 화면, 진행률/통계 표시
- 주요 API:
  - GET `/api/sectors` → 섹터 목록
  - GET `/api/sectors/{id}/subsectors` → 서브섹터 목록
  - GET `/api/subsectors/{id}/levels` → 레벨 목록
  - GET `/api/levels/{levelId}/quizzes?userId=` → 레벨별 퀴즈 목록
  - POST `/api/quizzes/{id}/submit-answer?userId=` → 답안 제출
  - POST `/api/quizzes/{id}/complete?userId=` → 퀴즈 완료
  - GET `/api/levels/{levelId}/progress?userId=` → 레벨 진행도
  - GET `/api/users/{userId}/progress` → 전체 진행도
- 데이터 흐름:
  - 탐험지 메인에서 섹터/서브섹터/레벨 선택 → 퀴즈 API 호출 및 진행
  - 퀴즈 제출/완료 시 API로 결과 저장 및 진행도 갱신
  - 완료 화면에서 진행률/통계 표시
- 주요 컴포넌트:
  - LevelPicker, QuizQuestion, CompletionScreen 등
  - 모든 목록(섹터/레벨/퀴즈)에서 아이템 클릭 시 상세/다음 단계로 이동

### 2. 오답노트(Study)
- `/study/wrong-notes`: 섹터별 오답 통계 카드, 각 섹터 클릭 시 해당 섹터의 오답 목록으로 이동
  - `getWrongNotes(userId, page, size, filter)`로 API에서 섹터별 통계(subsectorStatistics) 및 오답 목록(wrongNotes) 직접 수신
  - StudyPage → WrongNoteSection에서 API를 직접 호출하여 최신 데이터 렌더링
- 오답노트 상세/통계/삭제/복습 등: `community.js` 내 관련 API 참고

### 3. 커뮤니티(Community)
- `/community`: 게시글 목록, 각 글 클릭 시 상세로 이동
- `/community/:id`: 게시글 상세, 댓글 목록/작성/수정/삭제
  - 댓글 시간(createdAt)은 UTC → KST(+9시간)로 변환하여 한국 시간대로 표시
  - 댓글 작성/수정/삭제/조회 모두 API 연동
- 티어/배지 이미지: 서버 DTO + 로컬 이미지 매핑

### 4. 뉴스/뉴스레터(News)
- `/news`: 오늘의 뉴스 목록, 각 뉴스 클릭 시 상세로 이동
- `/news/:id`: 뉴스 상세
- `/search/:query`: 뉴스 검색 결과
- `/newsletter/*`: 뉴스레터 구독/상세

### 5. Profile(프로필)
- `/profile`: 출석 캘린더, 배지, 닉네임, 티어 등 서버 DTO 기반 렌더링

### 6. 인증/세션
- 게스트 로그인: `/api/auth/guest`
- 토큰/유저ID: localStorage/sessionStorage 관리

## ✨ 주요 기능


## 🔗 주요 API 예시 및 화면 흐름

```javascript
// 탐험지(퀴즈) 섹터/레벨/문제 목록 및 상세 이동
import { getSectors, getSubsectors, getLevels, getQuiz } from '../api/explore.js';
const sectors = await getSectors(); // 섹터 목록
// 섹터 클릭 → 상세로 이동
const subsectors = await getSubsectors(sectorId);
// 서브섹터 클릭 → 레벨 목록
const levels = await getLevels(subsectorId);
// 레벨 클릭 → 퀴즈 목록
const quiz = await getQuiz(levelId, userId);

// 오답노트 섹터별 통계 및 목록
import { getWrongNotes } from '../api/community.js';
const resp = await getWrongNotes(userId, 0, 50, 'all');
const subsectorStats = resp.subsectorStatistics; // [{subsectorId, subsectorName, wrongCount}, ...]
// 섹터 클릭 → 해당 섹터 오답 목록 화면으로 이동

// 커뮤니티 게시글/댓글 목록 및 상세 이동
import { getCommunityPosts, getPostComments } from '../api/community.js';
const posts = await getCommunityPosts();
// 게시글 클릭 → 상세로 이동
const comments = await getPostComments(postId);
// 댓글 시간 변환
const localTime = new Date(new Date(comments[0].createdAt).getTime() + (9 * 60 * 60 * 1000)).toLocaleString('ko-KR', { hour12: false });
```
- Community: 커뮤니티 목록/헤더 정렬(상단 24px)
- Profile: 출석 캘린더/요약(배지/진행도)
- Auth: 게스트 로그인 및 라우팅 가드
## 🗂️ 패키지 구조

- `src/components/` 재사용 컴포넌트 (예: `components/explore/*`, `components/news/*`)
- `src/api/` API 래퍼 (예: `explore.js`, `auth.js`)
- `src/assets/` 정적 리소스(SVG 등)
- 오답노트 API 응답:
  ```json
  {
    "wrongNotes": [{ id, questionText, ... }],
    "subsectorStatistics": [{ subsectorId, subsectorName, wrongCount }],
    "statistics": { totalCount, ... }
  }
  ```
- 커뮤니티 댓글:
  ```json
  {
    "id": 123,
    "body": "댓글 내용",
    "createdAt": "2025-10-20T00:13:26",
    "author": { nickname, badge: { name, imageUrl } }
  }
  ```

## 🗄️ 데이터베이스 설계(프론트 관점)

## 🏷️ 환경 변수

- `REACT_APP_API_BASE`: API 기본 URL
- `REACT_APP_NEWS_API_BASE`: 뉴스 API URL
  - 진행도: 레벨/서브섹터/유저 단위의 `isCompleted`, `completionRate`, `quizzes[]`
- 상세는 [API 매핑 (FE → BE)](#-api-매핑-fe--be) 참고

## 🏷️ 실행 방법

```bash
npm install
npm start
```
- 개발 서버: http://localhost:3000
- GitHub → Vercel 연결로 main 브랜치 푸시 시 자동 배포
- 환경변수: `REACT_APP_API_BASE` 등 Vercel Project Settings에 설정
- CRA 프리셋 자동 인식 (Build `npm run build` / Output `build/`)
## 🏷️ 배포

- Vercel 자동 배포 (main 브랜치 푸시 시)
- 환경변수는 Vercel Project Settings에서 설정

- 아래 [로컬 실행](#️-로컬-실행) 및 [🏗️ 빌드 및 배포](#-빌드-및-배포) 섹션을 참고하세요.


## 🧾 작업 기록 요약

- 오답노트 섹터별 통계/카드 완성 (API 직접 호출)
- 커뮤니티 댓글 시간 KST 변환 처리
- 모든 주요 기능 API 연동 및 UI/UX 개선
오답노트 통계/목록 API 래퍼 스텁 추가 및 스토어/섹션 기본 연동
README/API 매핑 초안 정리

🛠️ 해야 할 것 (우선순위)
Profile
배지/닉네임/티어 이미지 최종 매핑(서버 DTO 확정 반영)
달력 헤더 상단 간격 미세 조정, 출석 별 vs 회색원 크기/기준점 완전 일치
Explore 메인
레벨/세부주제 진행도 API 연결(징검다리/바 시각화) - 징검다리는 레벨별 퀴즈 4문제당 한칸으로 서브 섹터의 개수로 땡겨우도록 수정
Study
오답노트 통계/목록 완전 연동(서버 값 우선), 페이징/필터 확장

---


## 🔀 라우팅 구조 및 화면 이동

- `/login` 로그인(게스트 시작)
- `/` 홈(뉴스/뉴스레터)
- `/explore` 탐험지 메인(섹터 목록)
  - 섹터 클릭 → `/explore/level` (레벨 목록)
    - 레벨 클릭 → `/explore/quiz` (퀴즈 진행)
      - 퀴즈 완료 → `/explore/complete` (완료 화면)
- `/study/words` 단어장
- `/study/wrong-notes` 오답노트(섹터별 통계/목록)
  - 섹터 클릭 → 해당 섹터 오답 목록 화면
- `/community` 커뮤니티 게시글 목록
  - 게시글 클릭 → `/community/:id` (상세/댓글)
- `/profile` 프로필/달력/배지
- `/news/:id` 뉴스 상세
- `/search/:query` 뉴스 검색 결과
- `/newsletter/*` 뉴스레터 구독/상세
  - App 헤더/바텀내비 숨김 조건: `hideNewsletterNav` 로직 참고 (`src/App.js`)

---

## 🔗 API 매핑 

실제 백엔드 스펙과 동기화 필요. 현재 프론트 기준 가정/폴백 포함. 서버 DTO 확정되면 업데이트합니다.

인증/세션
- POST `/api/auth/guest` → 게스트 로그인 시작
  - req: `{ deviceId? }`
  - res: `{ token|accessToken, userId }`
  - FE: `sessionStorage.setItem('guest','1')`, 토큰/유저ID 저장 (`src/api/auth.js`)
- POST `/api/auth/login`, POST `/api/auth/signup` (있을 경우)

뉴스(News) (`src/api/news.js`)
- 베이스: `REACT_APP_NEWS_API_BASE`
- 목록
  - GET `/api/articles/today?skip=&limit=`: 오늘의 뉴스 목록
  - GET `/api/articles/category/{category}?skip=&limit=`: 카테고리별 뉴스 목록
- 상세
  - GET `/api/articles/{id}`: 기사 상세
- 검색
  - GET `/api/articles/search?q=&skip=&limit=`: 키워드/해시태그 검색
- 관리자(선택적)
  - DELETE `/api/articles/admin/{id}?reason=&lock_hours=`: 소프트 삭제
  - POST `/api/articles/admin/{id}/restore`: 복구
  - DELETE `/api/articles/admin/{id}/purge`: 완전 삭제
  - 헤더: `X-ADMIN-KEY: <REACT_APP_ADMIN_KEY>` (있을 때만)

탐험지/퀴즈 (src/api/explore.js)
- 카테고리/주제
  - GET `/api/sectors` → 섹터 목록
  - GET `/api/sectors/{id}` → 섹터 상세(내부에 subsectors 있을 수도)
  - GET `/api/sectors/{id}/subsectors` | `/api/subsectors?sectorId=...` → 서브섹터 목록
  - GET `/api/subsectors/{id}` → 서브섹터 상세(내부에 levels 있을 수도)
  - GET `/api/subsectors/{id}/levels` | `/api/levels?subsectorId=` | `/api/levels/search?subsectorId=` → 레벨 목록
- 레벨/퀴즈/진행도
  - GET `/api/levels/{levelId}/quizzes?userId=` → 레벨 내 퀴즈 목록/상태
  - GET `/api/levels/{levelId}/progress?userId=` → 레벨 진행도
  - POST `/api/levels/{levelId}/start?userId=` → 레벨 시작
  - POST `/api/levels/{levelId}/complete?userId=` → 레벨 완료
  - GET `/api/users/{userId}/progress` → 사용자 전체 진행
  - GET `/api/subsectors/{id}/progress?userId=` → 서브섹터 진행
  - GET `/api/levels/{id}` → 레벨 상세(title/goal/desc 추출)
- 퀴즈/문항
  - GET `/api/quizzes/{id}` | `/api/quiz/{id}` (변형 허용) → 퀴즈 상세(문항 포함, 최대 4문항 사용)
  - POST 답안 제출 (자동 폴백 체인)
    1) `/api/quizzes/{id}/submit-answer?userId=`
    2) `/api/quizzes/{id}/attempt?userId=`
    3) `/api/quizzes/submit-answer`
    4) `/api/attempts`
  - 퀴즈 완료 (자동 폴백 체인)
    1) `POST /api/quizzes/{id}/complete?userId=`
    2) `POST /api/quizzes/{id}/complete` (body에 `{ userId }`)
    3) `POST /api/quizzes/complete`
    4) `POST /api/quizzes/{id}/done`
  - 시도 이력 조회 (복수 엔드포인트 시도)
    - GET `/api/quizzes/{id}/attempts?userId=`
    - GET `/api/quizzes/{id}/answers?userId=`
    - GET `/api/attempts?quizId=&userId=`
    - GET `/api/users/{userId}/attempts?quizId=`
- 기사 데이터 병합 (선택)
  - GET `/api/articles/{id}` | `/api/articles?code=|slug=|path=` | `/api/articles/by-code/{code}` 등 변형들을 순차 시도하여 문항의 article 정보를 보강

뉴스레터(Newsletter) (`src/api/letters.js`)
- 베이스: `REACT_APP_API_BASE`
- 조회
  - GET `/api/letters/{sector}/{key}`: 최신 레터 조회
  - GET `/api/letters/{sector}/{key}/history`: 레터 히스토리 목록
  - GET `/api/letters/pending?sector=`: 발행 대기 레터 목록(옵션)
- 발행(관리)
  - POST `/api/letters/{sector}/{key}/{batchId}/publish`: 특정 배치 발행
  - POST `/api/letters/{sector}/{key}/publish-latest`: 최신 레터 발행
  - POST `/api/letters/{sector}/{key}/publish-all`: 모든 레터 일괄 발행

응답 정규화(요지)
- QuestionDTO: `{ id, type, stemMd, options[{id,text,isCorrect}], correctOptionId, article{ id,title,body,imageUrl }, ... }`
- 정답 필드(`isCorrect`, `correctOptionId`, `answerId`, `correctText` 등)와 옵션 라벨/텍스트를 교차해 FE에서 정규화합니다.

에러/토큰 처리
- 모든 요청은 `Authorization: Bearer <token>`(게스트 포함) 시도.
- 401/403 → 게스트 재로그인 시도 후 재호출. 5xx → 콘솔/토스트 안내.

---

## ▶️ 로컬 실행

사전 준비
- Node.js 18+ (LTS 권장)
- npm (또는 pnpm)

설치/실행
```bash
npm install
npm start
```
- 기본 포트: 3000
- 백엔드 프록시가 꺼져 있으면 콘솔에 proxy error가 보일 수 있으나 프론트 개발엔 영향 없음

빌드/테스트
```bash
npm test
npm run build
```

Troubleshooting
- `node -v` 18+ 확인
- Windows PowerShell 환경변수 반영 문제 시 터미널 재시작
- CSS “Unclosed block” → 최근 수정 파일의 중괄호/세미콜론 확인
- 100vw로 인한 가로 스크롤 → `width: 100%` + 부모 `overflow-x: hidden`

---

## ▲ Vercel 배포

빠른 절차
1) Vercel New Project → GitHub 연결 → 본 저장소 선택
2) Framework Preset: Create React App 자동 감지
3) Build: `npm run build` / Output: `build`
4) 환경변수(필요 시)
   - `REACT_APP_API_BASE` (예: https://api.example.com)
   - `REACT_APP_SENTRY_DSN` 등
5) Deploy

라우팅
- CSR(CRA) 특성상 별도 SPA fallback 없이 동작. 커스텀 라우팅 필요시 `vercel.json` rewrites 고려.

자주 겪는 이슈
- 모바일 드롭다운 깨짐: `position: fixed/absolute`와 상위 `overflow` 상호작용 점검, `vh` 대신 `dvh` 또는 px minHeight + 초기 측정 적용
- 100vw로 인한 가로 스크롤: `width: 100%` + 부모 `overflow-x: hidden`
- 환경변수 미반영: Vercel Settings → Environment Variables 추가 후 재배포

---

## 🧾 작업 기록 요약

- Explore: 드롭다운 높이/정렬 개선, 가로 스크롤 제거, 메뉴 팝업 안정화
- Home: `.home-container { width: 100%; overflow-x: hidden; }`로 수평 흔들림 제거
- Level Picker: 고정 폭/높이 제거, 목표 섹션 스크롤 허용, 하단 spacer로 버튼/탭과 겹침 방지, CSS 문법 오류 수정
- Completion Screen: `visualViewport + useLayoutEffect`로 첫 페인트에서 px minHeight 세팅 → 스크롤 없이 안정 레이아웃
- Community: 헤더 `top: 24px` 정렬
- Auth: 게스트 로그인 + 라우팅 가드 도입
- Profile: 헤더 좌 16/상 24, 캘린더 헤더 정렬(서체 유지) 1차 적용
- 배포/품질: 100vw 지양, `overflow-x: hidden` 가이드, ESLint 경고 정리, 문서화 추가

Backlog

- 퀴즈 API 4문항 보장 로직 및 DTO 확정 반영
- 뉴스레터 화면 CSS 분리/정리
- Profile 배지 데이터 수신/매핑 보완(배지 표시 정상화)
- 오답노트(Study) 퀴즈 진행도 표시 UI/연동 추가(완료률·진행상태 표시)

자세한 기록: `docs/WORKLOG_KR.md`

현재 프로젝트는 게스트 로그인(Guest Login) 기능을 지원합니다. 백엔드 엔드포인트는 `src/api/*`에서 관리되며, 배포 환경에서는 환경 변수를 통해 설정됩니다.

## ⚙️ 사용 가능한 명령어

프로젝트 디렉터리에서 다음 명령어들을 실행할 수 있습니다:

```bash
npm start
```

개발 모드에서 앱을 실행합니다. 브라우저에서 http://localhost:3000 을 열면 앱을 볼 수 있습니다.

코드 변경 시 페이지가 자동으로 새로고침되며, 콘솔에서 Lint 오류도 확인할 수 있습니다.

## 🔄 백엔드 연결 및 더미 데이터 시스템

이 프로젝트는 백엔드 연결 상태에 따라 자동으로 데이터 소스를 전환합니다.

### 작동 방식
- ✅ 백엔드 연결됨 → 실제 서버 API 사용
- ⚙️ 백엔드 연결 안됨 → 더미 데이터(`testData.js`) 사용 (디자인 확인용)

### 주요 파일
- `src/api/explore.js`: API 함수 및 자동 폴백 로직
- `src/utils/testData.js`: 개발용 더미 데이터
- `src/hooks/useBackendStatus.js`: 백엔드 연결 상태 확인 훅

## 🧩 사용 방법

### 1) API 함수 호출 예시
```javascript
import { getQuiz, submitAnswer } from '../api/explore.js';

// 백엔드 연결 시 → 실제 API 호출
// 연결 안될 시 → 더미 데이터 반환
const quiz = await getQuiz(1);
const result = await submitAnswer(questionId, optionId);
```

### 2) 연결 상태 확인 예시
```javascript
import { useBackendStatus } from '../hooks/useBackendStatus.js';

function MyComponent() {
  const { isConnected, isLoading } = useBackendStatus();
  
  return (
    <div>
      상태: {isConnected ? '백엔드 연결됨' : '더미 데이터 모드'}
    </div>
  );
}
```

### 3) 상태 표시기 컴포넌트
```javascript
import { BackendStatusIndicator } from '../hooks/useBackendStatus.js';

<BackendStatusIndicator showText={true} />
```

## 🌐 환경 변수 설정

배포 환경에 따라 다음 환경 변수를 설정할 수 있습니다:

- `REACT_APP_API_BASE`: 개발 및 프로덕션 API 기본 URL
- `REACT_APP_NEWS_API_BASE`: 뉴스 API 기본 URL (News 전용)
- `REACT_APP_ADMIN_KEY`: 관리자 기능 사용 시 인증 키(옵션)
- `VITE_API_BASE`: Vite 환경일 때의 API 기본 URL

## 🤝 기여 가이드라인

이 프로젝트에 기여하려면 아래 단계를 따라주세요:

1. 저장소를 포크합니다.
2. 새로운 브랜치를 생성합니다: `git checkout -b feature/새로운기능`.
3. 변경 사항을 커밋합니다: `git commit -m '새로운 기능 추가'`.
4. 브랜치에 푸시합니다: `git push origin feature/새로운기능`.
5. Pull Request를 생성합니다.

기여 시 아래 사항을 준수해주세요:
- 코드 스타일 가이드를 따르세요.
- 충분한 테스트를 작성하고 통과했는지 확인하세요.
- 상세한 커밋 메시지를 작성하세요.

---

## 🌐 환경 변수 설정 예제

로컬 개발을 위해 `.env` 파일을 프로젝트 루트에 생성하고 아래 내용을 추가하세요:

```
REACT_APP_API_BASE=https://api.example.com
REACT_APP_NEWS_API_BASE=https://newsapi.example.com
REACT_APP_ADMIN_KEY=your-admin-key
```

환경 변수는 Vercel 배포 시에도 설정해야 합니다. 자세한 내용은 [Vercel 배포](#-vercel-배포) 섹션을 참고하세요.

---

## 📦 주요 의존성

이 프로젝트에서 사용된 주요 라이브러리와 버전은 다음과 같습니다:

- React: ^18.2.0
- React Router: ^6.14.1
- Axios: ^1.4.0
- Jest: ^29.0.0

자세한 의존성 목록은 `package.json` 파일을 참고하세요.

---

## 🏷️ 라이선스

이 프로젝트는 MIT 라이선스에 따라 배포됩니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참고하세요.

---

## 🙏 감사의 글

이 프로젝트는 다음과 같은 오픈소스 프로젝트와 도구의 도움을 받아 개발되었습니다:

- [React](https://reactjs.org/)
- [Create React App](https://create-react-app.dev/)
- [Vercel](https://vercel.com/)

기여해주신 모든 분들께 감사드립니다!
