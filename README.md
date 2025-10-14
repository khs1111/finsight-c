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

- 라우팅 구조: `docs/ROUTING.md`
- API 매핑 (FE → BE): `docs/API_MAPPING.md`
- 로컬 실행 방법: `docs/RUN_LOCAL_FE.md`
- Vercel 배포 가이드: `docs/DEPLOY_VERCEL.md`
- 작업 기록서 (국문): `docs/WORKLOG_KR.md`

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
