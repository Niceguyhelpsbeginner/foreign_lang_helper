# 일본어 학습 도우미

일본어 학습을 위한 웹 애플리케이션입니다. HTML/CSS/JavaScript로 구현되어 있으며, GitHub Pages로 배포할 수 있습니다.

## 주요 기능

### 1. 사전 기능
- 네이버 검색 API를 사용한 일본어 단어 검색
- 한국어 → 일본어 검색 지원
- 일본어 → 한국어 검색 지원
- 검색 기록 저장 및 관리

### 2. 단어 학습
- 플래시카드 방식 학습
- JLPT 레벨별 맞춤 학습 환경
- 일일 목표 단어 수 설정
- 학습 진행도 추적

### 3. 퀴즈
- 검색 기록 기반 퀴즈
- 다양한 문제 유형
- 실시간 정답률 표시

### 4. 독해 연습
- 독해 지문 제공
- 이미지에서 텍스트 추출 (OCR 준비)
- TTS로 읽어주기 기능

### 5. 모의고사 / 레벨테스트
- 실제 시험 형식 모의고사
- 실력 측정 레벨테스트
- 자동 채점 및 레벨 평가

### 6. 단어장
- 단어 추가/삭제/수정
- 언어별 필터링
- 검색 기능

## 사용 방법

### 로컬에서 실행

1. 저장소 클론
```bash
git clone https://github.com/your-username/foreign_lang_helper.git
cd foreign_lang_helper
```

2. 브라우저에서 열기
- `index.html` 파일을 웹 브라우저에서 열기

### GitHub Pages로 배포

1. GitHub 저장소 생성
2. 코드 푸시
3. Settings → Pages → Source를 "main" 브랜치로 설정
4. 배포된 URL 확인 (예: `https://your-username.github.io/foreign_lang_helper/`)

## 네이버 API 설정

1. [네이버 개발자 센터](https://developers.naver.com/apps/#/register) 접속
2. 애플리케이션 등록
   - 애플리케이션 이름 입력
   - 사용 API: **검색** 선택
   - 서비스 URL: `https://your-username.github.io` (GitHub Pages URL)
   - 비로그인 오픈 API 서비스 환경: **Web 설정** 선택
3. Client ID와 Client Secret 발급
4. 앱의 설정 메뉴에서 API 키 입력

## 기술 스택

- HTML5
- CSS3
- JavaScript (Vanilla)
- LocalStorage
- 네이버 검색 API

## 브라우저 호환성

- Chrome (권장)
- Firefox
- Safari
- Edge

## 라이선스

이 프로젝트는 개인 학습 목적으로 제작되었습니다.


# foreign_lang_helper


