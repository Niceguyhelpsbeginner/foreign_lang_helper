# 네이버 API 설정 가이드

## 네이버 개발자 센터 API 키 발급

1. **네이버 개발자 센터 접속**
   - https://developers.naver.com 접속
   - 네이버 계정으로 로그인

2. **애플리케이션 등록**
   - "Application" → "애플리케이션 등록" 클릭
   - 애플리케이션 이름 입력 (예: "일본어 학습 도우미")
   - 사용 API 선택: **검색** API 선택
   - 서비스 URL: `http://localhost` (로컬 테스트용)
   - 비로그인 오픈 API 서비스 환경: **Web 설정** 선택

3. **API 키 확인**
   - 등록 후 Client ID와 Client Secret 확인
   - 이 키들을 앱의 설정 메뉴에 입력

## 네이버 일본어사전 API 사용 방법

### 현재 구현 상태

네이버 일본어사전은 공식 API가 제공되지 않으므로, 다음 방법들을 사용할 수 있습니다:

1. **네이버 검색 API 사용** (현재 구현됨)
   - 백과사전 검색으로 일본어 단어 검색 시도
   - 제한적이지만 기본적인 검색은 가능

2. **백엔드 서버를 통한 크롤링** (권장)
   - CORS 문제를 피하기 위해 백엔드 서버 필요
   - `server-example.js` 파일 참고
   - Node.js + Express + Cheerio 사용

### 백엔드 서버 설정 (선택사항)

더 정확한 일본어사전 검색을 원한다면:

1. **필요한 패키지 설치**
```bash
npm install express axios cheerio cors
```

2. **서버 실행**
```bash
node server-example.js
```

3. **프론트엔드 코드 수정**
   - `app.js`의 `searchNaverJapaneseDictionaryDirect` 함수를 수정하여
   - 백엔드 서버 엔드포인트를 호출하도록 변경

```javascript
// app.js 수정 예시
async function searchNaverJapaneseDictionaryDirect(word) {
    try {
        const response = await fetch(`http://localhost:3000/api/japanese-dict/${encodeURIComponent(word)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('백엔드 서버 오류:', error);
        // 폴백 처리
    }
}
```

## 대안: 다른 일본어사전 API

네이버 사전이 제한적이라면 다음 API들을 고려할 수 있습니다:

1. **Jisho.org API** (무료)
   - https://jisho.org/api/v1/search/words?keyword=단어
   - CORS 문제 없이 사용 가능

2. **Weblio API** (일본어)
   - 일본어 사전 API 제공

3. **Google Translate API** (유료)
   - 번역 및 발음 정보 제공

## 현재 사용 가능한 기능

- ✅ 네이버 검색 API를 통한 기본 검색
- ✅ 검색 기록 저장
- ✅ 네이버 일본어사전 링크 제공
- ⚠️ 상세 정보는 백엔드 서버 필요 (크롤링)

## 주의사항

- 네이버 API는 일일 호출 제한이 있습니다
- 크롤링 시 네이버의 이용약관을 준수해야 합니다
- 프로덕션 환경에서는 백엔드 서버를 통해 크롤링하는 것을 권장합니다




