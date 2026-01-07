# Gemini API 설정 가이드

## 🔑 API 키 발급 방법

### 방법 1: Google AI Studio (권장 - 간단함)

1. **Google AI Studio 접속**
   - https://makersuite.google.com/app/apikey 접속
   - Google 계정으로 로그인

2. **API 키 생성**
   - "Create API Key" 클릭
   - 프로젝트 선택 또는 새로 만들기
   - 생성된 API 키 복사

3. **장점**
   - HTTP 리퍼러 제한 없음 (로컬 테스트에 적합)
   - 설정이 간단함
   - 빠른 시작 가능

### 방법 2: Google Cloud Console

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/ 접속
   - Google 계정으로 로그인

2. **프로젝트 생성 또는 선택**
   - 상단의 프로젝트 선택 메뉴 클릭
   - "새 프로젝트" 클릭하여 생성하거나 기존 프로젝트 선택

3. **Generative Language API 활성화**
   - 왼쪽 메뉴에서 "API 및 서비스" → "라이브러리" 클릭
   - 검색창에 "Generative Language API" 입력
   - "Generative Language API" 선택
   - "사용" 버튼 클릭

4. **API 키 생성**
   - 왼쪽 메뉴에서 "API 및 서비스" → "사용자 인증 정보" 클릭
   - 상단의 "+ 사용자 인증 정보 만들기" → "API 키" 클릭
   - 생성된 API 키 복사

5. **API 키 제한 설정 (보안 강화)**

   ⚠️ **중요: 로컬 테스트를 위해 반드시 설정해야 합니다!**

   - 생성된 API 키 클릭하여 편집
   - "애플리케이션 제한사항" → "HTTP 리퍼러(웹사이트)" 선택
   - "웹사이트 제한사항"에 다음 추가:
     ```
     http://localhost:*
     http://127.0.0.1:*
     https://your-domain.com/*
     ```
   - "API 제한사항" → "특정 API 제한" 선택
   - "Generative Language API"만 선택
   - "저장" 클릭

## 📝 설정 파일 생성

1. `gemini_config.js` 파일 열기
2. API 키 입력:
   ```javascript
   const GEMINI_API_KEY = '여기에-발급받은-API-키-입력';
   ```

## ✅ 사용 방법

설정 파일을 생성하면 자동으로 Gemini API를 사용합니다.
- API 키가 설정되어 있으면 → Gemini API 사용 (더 정확함)
- API 키가 없으면 → Tesseract.js 사용 (폴백)

## 💰 비용

### 무료 티어
- **Gemini 1.5 Flash**: 무료 (일일 요청 제한 있음)
- **Gemini 1.5 Pro**: 무료 티어 제공

### 예상 비용
- 일반적인 사용량: 무료 티어 내
- 대량 사용 시: [가격 정보](https://ai.google.dev/pricing) 참고

## 🔒 보안 주의사항

⚠️ **중요**: API 키를 클라이언트 코드에 포함하는 것은 보안상 위험할 수 있습니다.

### 권장 사항:
1. **API 키 제한 설정 필수**
   - HTTP 리퍼러 제한 설정
   - Generative Language API만 허용
   
2. **대안 (고급)**
   - 백엔드 서버 구축하여 API 키를 서버에만 저장
   - 프론트엔드에서 서버로 이미지 전송
   - 서버에서 Gemini API 호출

### 현재 방식의 장단점:
- ✅ **장점**: 간단하고 빠르게 구현 가능
- ⚠️ **단점**: API 키가 클라이언트 코드에 노출됨 (제한 설정으로 완화 가능)

## 🧪 테스트

1. `gemini_config.js` 파일 생성 및 API 키 입력
2. 로컬 서버 실행:
   ```bash
   python -m http.server 8000
   ```
3. 브라우저에서 `http://localhost:8000/test_gemini_ocr.html` 접속
4. 이미지 업로드하여 테스트

## 🐛 문제 해결

### 오류: "Requests from referer http://localhost:8000/ are blocked"
**해결 방법:**
1. Google Cloud Console → API 및 서비스 → 사용자 인증 정보
2. API 키 클릭하여 편집
3. "애플리케이션 제한사항" → "HTTP 리퍼러(웹사이트)" 선택
4. "웹사이트 제한사항"에 `http://localhost:*` 추가
5. 저장

**또는:**
- Google AI Studio에서 새 API 키 발급 (제한 없음)

### 오류: "API key not valid"
- API 키가 올바르게 입력되었는지 확인
- Generative Language API가 활성화되었는지 확인

### 여전히 Tesseract.js 사용됨
- `gemini_config.js` 파일이 올바른 위치에 있는지 확인
- 브라우저 콘솔에서 오류 확인
- API 키가 `'your-api-key-here'`가 아닌 실제 키인지 확인

## 📚 참고 자료

- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Gemini API 문서](https://ai.google.dev/docs)
- [API 키 보안 가이드](https://cloud.google.com/docs/authentication/api-keys)
- [가격 정보](https://ai.google.dev/pricing)




















