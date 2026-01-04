# 🆓 Gemini API 무료 사용 가이드

## ✅ 무료로 사용 가능합니다!

Gemini API는 **무료 할당량**을 제공합니다. 결제 없이도 사용할 수 있습니다!

## 🔑 Google AI Studio에서 무료 API 키 발급 (결제 불필요)

### 단계별 가이드

1. **Google AI Studio 접속**
   - https://makersuite.google.com/app/apikey 접속
   - 또는 https://aistudio.google.com/app/apikey
   - Google 계정으로 로그인

2. **API 키 생성**
   - "Create API Key" 버튼 클릭
   - 프로젝트 선택:
     - 기존 프로젝트가 있으면 선택
     - 없으면 "Create API key in new project" 선택
   - **결제 정보 입력 없이** API 키 생성 가능!

3. **API 키 복사**
   - 생성된 API 키를 복사
   - ⚠️ **주의**: 이 키는 한 번만 표시되므로 복사해두세요!

4. **설정 파일에 입력**
   - `gemini_config.js` 파일 열기
   - 복사한 API 키를 입력:
     ```javascript
     const GEMINI_API_KEY = '여기에-복사한-API-키-입력';
     ```

## 💰 무료 할당량

### Gemini 1.5 Flash (현재 사용 중)
- **무료**: 충분한 할당량 제공
- 일일 요청 제한 있음 (일반적인 사용에는 충분)

### Gemini 1.5 Pro
- 무료 티어 제공
- 더 많은 할당량 필요 시 유료

## ⚠️ 중요 차이점

### Google AI Studio API 키 (권장 ✅)
- ✅ 결제 정보 불필요
- ✅ 무료 할당량 제공
- ✅ 빠른 설정
- ✅ HTTP 리퍼러 제한 없음 (로컬 테스트 용이)

### Google Cloud Console API 키
- ⚠️ 결제 계정 연결 필요할 수 있음
- ⚠️ HTTP 리퍼러 제한 설정 필요
- ⚠️ 설정이 복잡함

## 🧪 테스트 방법

1. Google AI Studio에서 새 API 키 발급
2. `gemini_config.js`에 입력
3. 브라우저 새로고침 (F5)
4. `http://localhost:8000/test_api_quick.html` 접속
5. "테스트 시작" 버튼 클릭

## 📊 사용량 확인

Google AI Studio에서 사용량 확인:
- https://aistudio.google.com/app/apikey
- 발급한 API 키 옆에 사용량 표시

## 🐛 문제 해결

### 여전히 오류가 발생하면:
1. **Google AI Studio에서 발급한 키인지 확인**
   - Google Cloud Console이 아닌 Google AI Studio에서 발급했는지 확인

2. **API 키 형식 확인**
   - `AIzaSy...` 형식이어야 함
   - 공백이나 따옴표 없이 입력

3. **브라우저 캐시 삭제**
   - Ctrl + Shift + Delete
   - 캐시된 이미지 및 파일 삭제
   - 페이지 새로고침 (Ctrl + F5)

4. **콘솔 확인**
   - F12 → Console 탭
   - 오류 메시지 확인

## ✅ 확인 체크리스트

- [ ] Google AI Studio에서 API 키 발급 (결제 불필요)
- [ ] `gemini_config.js`에 API 키 입력
- [ ] 브라우저 새로고침
- [ ] `test_api_quick.html`에서 테스트 성공
- [ ] 이미지 텍스트 추출 테스트 성공

## 📚 참고 링크

- [Google AI Studio](https://aistudio.google.com/app/apikey)
- [Gemini API 문서](https://ai.google.dev/docs)
- [무료 할당량 정보](https://ai.google.dev/pricing)

















