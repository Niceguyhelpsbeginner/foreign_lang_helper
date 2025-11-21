# Supabase 연동 완전 가이드

## 📋 단계별 설정 가이드

### 1단계: Supabase 프로젝트 생성 및 설정

1. **Supabase 대시보드 접속**
   - https://supabase.com 접속
   - 로그인 후 "New Project" 클릭

2. **프로젝트 생성**
   - Organization 선택 (없으면 새로 생성)
   - Project Name: `foreign_lang_helper` (또는 원하는 이름)
   - Database Password: **기억하기 쉬운 비밀번호 설정** (나중에 필요)
   - Region: 가장 가까운 리전 선택 (예: Northeast Asia (Seoul))
   - Pricing Plan: Free 선택
   - "Create new project" 클릭

3. **프로젝트 생성 대기** (약 2분 소요)

### 2단계: API 키 확인

1. 프로젝트 대시보드에서 **Settings** (왼쪽 메뉴) 클릭
2. **API** 메뉴 클릭
3. 다음 정보를 복사해두세요:
   - **Project URL**: `https://xxxxx.supabase.co` 형태
   - **anon public** 키: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` 형태

### 3단계: 데이터베이스 테이블 생성

1. Supabase 대시보드에서 **SQL Editor** (왼쪽 메뉴) 클릭
2. **New query** 클릭
3. `supabase_schema.sql` 파일의 내용을 복사하여 붙여넣기
4. **Run** 버튼 클릭 (또는 Ctrl+Enter)
5. 성공 메시지 확인

### 4단계: 인증 설정 (Authentication)

1. **Authentication** (왼쪽 메뉴) 클릭
2. **Providers** 탭에서 **Email** 활성화
3. **Settings** 탭에서:
   - "Enable email confirmations" **비활성화** (개발 중에는 편의상)
   - "Enable sign ups" **활성화**

### 5단계: 데이터 마이그레이션 (JSON → Supabase)

1. **터미널에서 프로젝트 폴더로 이동**
   ```bash
   cd C:\Users\seong\OneDrive\Desktop\foreign_lang_helper
   ```

2. **패키지 설치**
   ```bash
   npm install
   ```

3. **설정 파일 생성**
   - `supabase_config.js.example` 파일을 복사하여 `supabase_config.js` 생성
   - 파일 내용을 실제 Supabase 값으로 수정:
   ```javascript
   module.exports = {
       SUPABASE_URL: 'https://your-project-id.supabase.co', // 2단계에서 복사한 URL
       SUPABASE_ANON_KEY: 'your-anon-key-here' // 2단계에서 복사한 anon key
   };
   ```

4. **데이터 마이그레이션 실행**
   ```bash
   npm run migrate
   ```
   
   또는:
   ```bash
   node migrate_data.js
   ```

5. **확인**: Supabase 대시보드 → **Table Editor** → `words` 테이블 확인

### 6단계: 프론트엔드 연동

1. **`supabase_client.js` 파일 수정**
   - `SUPABASE_URL`과 `SUPABASE_ANON_KEY`를 실제 값으로 변경

2. **브라우저에서 테스트**
   - `index.html` 파일을 열어서 확인
   - 브라우저 콘솔(F12)에서 오류 확인

## 🔧 문제 해결

### 오류: "Cannot read property 'createClient' of undefined"
- **원인**: Supabase 스크립트가 로드되지 않음
- **해결**: `index.html`에서 Supabase CDN 스크립트가 올바르게 로드되는지 확인

### 오류: "Invalid API key"
- **원인**: API 키가 잘못되었거나 권한 문제
- **해결**: 
  1. Supabase 대시보드에서 API 키 다시 확인
  2. `anon public` 키를 사용하는지 확인 (service_role 키 아님!)

### 오류: "relation does not exist"
- **원인**: 테이블이 생성되지 않음
- **해결**: `supabase_schema.sql`을 다시 실행

### 데이터가 보이지 않음
- **해결**: 
  1. Supabase 대시보드 → Table Editor에서 직접 확인
  2. RLS 정책이 올바르게 설정되었는지 확인

## 📝 다음 단계

데이터베이스 설정이 완료되면, `app.js` 파일을 Supabase와 연동하도록 수정해야 합니다. 
다음 파일들을 확인하세요:
- `app_supabase.js` (새로 생성될 파일)
- 기존 `app.js`의 함수들을 Supabase API 호출로 변경

## 🎯 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] API 키 확인 및 복사 완료
- [ ] 데이터베이스 테이블 생성 완료 (SQL 실행)
- [ ] 인증 설정 완료 (Email 활성화)
- [ ] `supabase_config.js` 파일 생성 및 설정 완료
- [ ] 데이터 마이그레이션 실행 완료
- [ ] `supabase_client.js` 파일 설정 완료
- [ ] 브라우저에서 테스트 완료

## 💡 참고사항

- **보안**: `supabase_client.js`와 `supabase_config.js` 파일은 Git에 커밋하지 마세요!
- `.gitignore`에 추가:
  ```
  supabase_config.js
  supabase_client.js
  ```
- 대신 `supabase_config.js.example`과 `supabase_client.js.example`만 커밋하세요.

