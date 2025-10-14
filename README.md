# 🚀 Finsight 프론트엔드 프로젝트

이 프로젝트는 [Create React App](https://github.com/facebook/create-react-app) 으로 초기 구성되었습니다.

## 📘 프로젝트 개요

이 저장소는 Finsight 앱의 프론트엔드(React) 코드를 포함합니다. 구성 화면은 다음과 같습니다:

- Explore (퀴즈/탐험지)
- News / Newsletter (뉴스, 뉴스레터 구독)
- Community (커뮤니티 게시판)
- Profile (프로필 및 학습 진행도)

이 프로젝트는 모바일 퍼스트 UI를 기준으로 설계되었습니다.

## 📄 문서 (Frontend)

아래 내용은 본 README에 통합되어 있습니다. 필요 시 상세판은 `/docs` 폴더에서 확인할 수 있습니다.

- [라우팅 구조](#-라우팅-구조)
- [API 매핑 (FE → BE)](#-api-매핑-fe--be)
- [로컬 실행](#️-로컬-실행)
- [Vercel 배포](#-vercel-배포)
- [작업 기록 요약](#-작업-기록-요약)

---

## 🔀 라우팅 구조

- `/login` 로그인(게스트 시작)
- `/` 홈(뉴스/뉴스레터)
- `/explore`
  - 메인: 주제/세부주제 선택
  - `/explore/level` 레벨 선택(레벨 피커)
  - `/explore/quiz` 퀴즈 진행(4문항 세트)
  - `/explore/complete` 완료 화면
- `/study`
  - `/study/words` 단어장
  - `/study/wrong-notes` 오답노트(섹터별/총계)
- `/community`
  - 목록 `/community`
  - 글쓰기 `/community/new` (있는 경우)
- `/profile` 프로필/달력/배지

---

## 🔗 API 매핑 (FE → BE)

실제 백엔드 스펙과 동기화 필요. 현재 프론트 기준 가정/폴백 포함. 서버 DTO 확정되면 업데이트합니다.

인증/세션
- POST `/api/auth/guest` → 게스트 로그인 시작
  - req: `{ deviceId? }`
  - res: `{ token|accessToken, userId }`
  - FE: `sessionStorage.setItem('guest','1')`, 토큰/유저ID 저장 (`src/api/auth.js`)
- POST `/api/auth/login`, POST `/api/auth/signup` (있을 경우)

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
- Explore 세부주제 드롭다운 “모든 주제” 첫 줄 사라짐(Vercel 포함) 재현/수정
- Profile 출석 아이콘 정렬, 히어로 배경 높이 보강
- 퀴즈 API 4문항 보장 로직 및 DTO 확정 반영
- 뉴스레터 화면 CSS 분리/정리

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
- `src/components/BackendStatusDemo.js`: 연결 상태 테스트용 컴포넌트

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
- `VITE_API_BASE`: Vite 환경일 때의 API 기본 URL

## 📂 폴더 구조 규칙 (Finsight Custom)

폴더/파일 역할:

- `pages/` 라우팅 단위의 페이지 컴포넌트 (각 URL에 대응)
- `components/` 재사용 가능한 UI 컴포넌트 (버튼, 카드, 탭 등)
- `components/community/`, `components/explore/` 도메인별 컴포넌트 그룹
- `docs/` 문서 및 실행 가이드

중복된 페이지 파일(`ProfilePage.js` 등)은 정리되었습니다. 현재 활성 페이지는 `pages/profile.js`, 스타일은 `pages/Profile.css` 입니다.

### 📘 유지보수 규칙
- 페이지 전용 로직은 `pages/` 안에만 작성
- 다른 라우트에서 재사용 시 `components/`로 분리
- 도메인 중심 구조 유지 (예: `explore/`, `community/`)
- 동일 페이지의 중복 파일은 금지

### 📗 리팩터링 로그
1. Profile 구조 통합 (`pages/profile.js`)
2. 중복 파일 삭제
3. 폴더 구조 규칙 추가

## 🧪 테스트

```bash
npm test
```

테스트 러너를 인터랙티브 모드로 실행합니다. 자세한 내용은 공식 가이드를 참고하세요.

## 🏗️ 빌드 및 배포

```bash
npm run build
```

프로덕션용 빌드를 생성하여 `build/` 폴더에 저장합니다. 코드는 최적화되어 번들링되며 파일 이름에는 해시가 포함됩니다. 앱은 바로 배포할 준비가 됩니다.

배포 관련 자세한 내용은 CRA 공식 가이드를 참고하세요.

## ⚠️ `npm run eject`

한 번 eject 하면 되돌릴 수 없습니다. CRA의 내부 설정(webpack, Babel 등)을 프로젝트 안으로 복사해 직접 수정할 수 있도록 합니다. 대부분의 프로젝트에서는 eject 없이도 충분히 동작합니다.

## 📚 추가 문서

- React 공식 문서: https://reactjs.org/
- Create React App 가이드: https://facebook.github.io/create-react-app/docs/getting-started
- 코드 스플리팅: https://facebook.github.io/create-react-app/docs/code-splitting
- 번들 사이즈 분석: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size
- PWA 만들기: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app
- 고급 설정: https://facebook.github.io/create-react-app/docs/advanced-configuration
- 배포 가이드: https://facebook.github.io/create-react-app/docs/deployment
- 빌드 실패 문제 해결: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
