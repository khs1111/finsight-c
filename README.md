# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## 🔄 백엔드 연결 및 더미 데이터 시스템

이 프로젝트는 백엔드 연결 상태에 따라 자동으로 데이터 소스를 전환하는 시스템을 제공합니다.

### 작동 방식
- **백엔드 연결됨**: 실제 서버 API 사용
- **백엔드 연결 안됨**: 더미 데이터 사용하여 디자인 확인 가능

### 주요 파일
- `src/api/explore.js`: API 함수들과 자동 폴백 로직
- `src/utils/testData.js`: 개발용 더미 데이터
- `src/hooks/useBackendStatus.js`: 백엔드 연결 상태 관리 훅
- `src/components/BackendStatusDemo.js`: 연결 상태 테스트 컴포넌트

### 사용 방법

#### 1. API 함수 사용
```javascript
import { getQuiz, submitAnswer } from '../api/explore.js';

// 백엔드 연결시 → 실제 API 호출
// 백엔드 연결 안됨 → 더미 데이터 반환
const quiz = await getQuiz(1);
const result = await submitAnswer(questionId, optionId);
```

#### 2. 연결 상태 확인
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

#### 3. 상태 표시기 사용
```javascript
import { BackendStatusIndicator } from '../hooks/useBackendStatus.js';

<BackendStatusIndicator showText={true} />
```

### 환경 설정
백엔드 URL은 환경변수로 설정 가능합니다:
- `REACT_APP_API_BASE`: 개발/프로덕션 API 베이스 URL
- `VITE_API_BASE`: Vite 환경에서의 API 베이스 URL

## Folder Convention (Project Custom)

pages/ : Route-level components only. Each file corresponds to a URL entry point and orchestrates data + composition.

components/ : Reusable UI parts (buttons, cards, lists, navigation, domain widgets). Domain grouping encouraged (e.g. `components/community/`, `components/explore/`).

Removed duplicate legacy scaffold: `ProfilePage.js` and its CSS were deleted. Active profile route component is `pages/profile.js` with styles in `pages/Profile.css`.

Guidelines:
- Keep purely page-specific layout glue in pages/.
- Extract only when: reused across another route OR component grows too large (readability threshold).
- Prefer domain folders over excessive granular nesting.
- Avoid keeping two variants of the same page to prevent confusion (e.g. `ProfilePage.js` vs `profile.js`).

Refactor Log:
1. Consolidated Profile into single file `pages/profile.js`.
2. Removed obsolete scaffold files.
3. Added this section for future contributors.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
