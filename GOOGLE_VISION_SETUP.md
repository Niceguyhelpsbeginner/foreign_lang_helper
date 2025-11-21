# Google Cloud Vision API 설정 가이드

## 📋 개요

Google Cloud Vision API는 Tesseract.js보다 더 정확한 OCR 결과를 제공합니다. 특히 일본어 텍스트 인식에 우수한 성능을 보입니다.

## 🔑 API 키 발급 방법

### 1단계: Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. Google 계정으로 로그인

### 2단계: 프로젝트 생성
1. 상단의 프로젝트 선택 메뉴 클릭
2. "새 프로젝트" 클릭
3. 프로젝트 이름 입력 (예: "foreign-lang-helper")
4. "만들기" 클릭

### 3단계: Cloud Vision API 활성화
1. 왼쪽 메뉴에서 "API 및 서비스" → "라이브러리" 클릭
2. 검색창에 "Cloud Vision API" 입력
3. "Cloud Vision API" 선택
4. "사용" 버튼 클릭

### 4단계: API 키 생성
1. 왼쪽 메뉴에서 "API 및 서비스" → "사용자 인증 정보" 클릭
2. 상단의 "+ 사용자 인증 정보 만들기" → "API 키" 클릭
3. 생성된 API 키 복사

### 5단계: API 키 제한 설정 (보안 강화)
1. 생성된 API 키 클릭
2. "애플리케이션 제한사항" → "HTTP 리퍼러(웹사이트)" 선택
3. "웹사이트 제한사항"에 다음 추가:
   - `https://your-vercel-domain.vercel.app/*`
   - `http://localhost:*` (로컬 테스트용)
4. "API 제한사항" → "특정 API 제한" 선택
5. "Cloud Vision API"만 선택
6. "저장" 클릭

## 📝 설정 파일 생성

1. `google_vision_config.js.example` 파일을 복사하여 `google_vision_config.js` 생성
2. 파일 내용 수정:
   ```javascript
   const GOOGLE_VISION_API_KEY = '여기에-발급받은-API-키-입력';
   ```

## ✅ 사용 방법

설정 파일을 생성하면 자동으로 Google Cloud Vision API를 사용합니다.
- API 키가 설정되어 있으면 → Google Cloud Vision API 사용 (더 정확함)
- API 키가 없으면 → Tesseract.js 사용 (폴백)

## 💰 비용

### 무료 티어
- **월 1,000회 요청 무료**
- 이후 요청: $1.50 per 1,000 requests

### 예상 비용
- 하루 100회 사용 시: 월 약 3,000회 → 약 $3/월
- 하루 10회 사용 시: 무료 티어 내

## 🔒 보안 주의사항

⚠️ **중요**: API 키를 클라이언트 코드에 포함하는 것은 보안상 위험할 수 있습니다.

### 권장 사항:
1. **API 키 제한 설정 필수**
   - HTTP 리퍼러 제한 설정
   - Cloud Vision API만 허용
   
2. **대안 (고급)**
   - 백엔드 서버 구축하여 API 키를 서버에만 저장
   - 프론트엔드에서 서버로 이미지 전송
   - 서버에서 Google Vision API 호출

### 현재 방식의 장단점:
- ✅ **장점**: 간단하고 빠르게 구현 가능
- ⚠️ **단점**: API 키가 클라이언트 코드에 노출됨 (제한 설정으로 완화 가능)

## 🧪 테스트

1. `google_vision_config.js` 파일 생성 및 API 키 입력
2. 브라우저에서 페이지 열기
3. 독해 페이지 → "📷 사진에서 텍스트 추출" 클릭
4. 이미지 업로드
5. "Google Vision API로 텍스트 추출 중..." 메시지 확인

## 🐛 문제 해결

### 오류: "API key not valid"
- API 키가 올바르게 입력되었는지 확인
- Cloud Vision API가 활성화되었는지 확인

### 오류: "Referer not allowed"
- API 키 제한 설정에서 현재 도메인이 허용되었는지 확인
- 로컬 테스트 시 `http://localhost:*` 추가

### 여전히 Tesseract.js 사용됨
- `google_vision_config.js` 파일이 올바른 위치에 있는지 확인
- 브라우저 콘솔에서 오류 확인
- API 키가 `'your-api-key-here'`가 아닌 실제 키인지 확인

## 📚 참고 자료

- [Google Cloud Vision API 문서](https://cloud.google.com/vision/docs)
- [API 키 보안 가이드](https://cloud.google.com/docs/authentication/api-keys)
- [가격 정보](https://cloud.google.com/vision/pricing)

