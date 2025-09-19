# 🚀 Finsight 배포 가이드

## 📋 프로젝트 구조
- **프론트엔드**: React 앱 (finsight-c)
- **백엔드**: Spring Boot 서버 (Finsight_main_sever-main)

## 🔧 배포 전 준비사항

### 1. 백엔드 서버 설정
```bash
# 백엔드 디렉토리로 이동
cd "C:\Users\김혜성\OneDrive\바탕 화면\Finsight_main_sever-main"

# MySQL 데이터베이스 설정 확인
# - 포트: 3307
# - 데이터베이스: findb
# - 사용자: root
# - 비밀번호: Aa5051140

# 서버 실행
./gradlew bootRun
```

### 2. 프론트엔드 빌드
```bash
# 프론트엔드 디렉토리로 이동
cd "C:\Users\김혜성\OneDrive\바탕 화면\finsight-c"

# 의존성 설치
npm install

# 프로덕션 빌드
npm run build
```

## 🌐 배포 방법

### 방법 1: 정적 파일 호스팅 (권장)
1. `build` 폴더의 내용을 웹 서버에 업로드
2. 백엔드 서버를 별도로 실행
3. 프론트엔드에서 백엔드 API 호출

### 방법 2: 통합 배포
1. Spring Boot에 정적 파일 포함
2. 단일 JAR 파일로 배포

## 📁 업로드할 파일들

### 프론트엔드 (finsight-c/build/)
```
build/
├── index.html
├── static/
│   ├── css/
│   ├── js/
│   └── media/
├── assets/
└── manifest.json
```

### 백엔드 (Finsight_main_sever-main/)
```
Finsight_main_sever-main/
├── build/
│   └── libs/
│       └── fin-main-server-0.0.1-SNAPSHOT.jar
├── src/
└── build.gradle
```

## 🔗 연결 확인
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8080/api
- 퀴즈 조회: GET /api/quizzes/1
- 답안 제출: POST /api/quizzes/submit-answer

## ⚠️ 주의사항
1. MySQL 서버가 실행 중이어야 함
2. 데이터베이스 `findb`가 생성되어 있어야 함
3. 백엔드 서버가 먼저 실행되어야 함
4. CORS 설정이 올바르게 되어 있는지 확인

