# Azure Static Web Apps 배포 가이드

## ✅ 배포 가능 여부

**배포 가능합니다!** 현재 프로젝트는 정적 파일 기반이므로 Azure Static Web Apps에 배포할 수 있습니다.

## ⚠️ 예상되는 문제점 및 해결 방법

### 1. 라우팅 설정 (중요)

**문제**: SPA(Single Page Application)이므로 모든 경로를 `index.html`로 리다이렉트해야 합니다.

**해결**: `staticwebapp.config.json` 파일 생성 필요

```json
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html"
  }
}
```

### 2. 환경 변수 설정

**문제**: Azure Static Web Apps는 환경 변수 설정 방법이 다릅니다.

**현재 상태**: 
- `supabase_client.js`에 하드코딩된 값 사용
- ✅ 문제 없음 (Supabase anon key는 공개되어도 안전)

**대안** (선택사항):
- Azure Static Web Apps의 Application Settings 사용 가능
- 하지만 현재 구조에서는 변경 불필요

### 3. 빌드 설정

**문제**: 현재 `package.json`의 `build` 스크립트가 빈 명령어입니다.

**해결**: Azure Static Web Apps는 빌드가 필요 없으므로 문제 없음
- 또는 빌드 스크립트를 실제로 사용하지 않도록 설정

### 4. CORS 문제

**예상**: ❌ 문제 없음

**이유**:
- Supabase는 CORS를 지원하므로 문제 없음
- 외부 API 호출은 모두 CORS 지원 API 사용 (Supabase, 네이버 API 등)

### 5. 파일 크기 제한

**문제**: Azure Static Web Apps는 파일 크기 제한이 있습니다.

**현재 상태 확인 필요**:
- `app.js`: 약 5800줄 (크기 확인 필요)
- JSON 데이터 파일들 (`jlpt/`, `toeic/`, `topik/`)

**해결**:
- 파일이 너무 크면 분할 필요할 수 있음
- 하지만 일반적으로 문제 없음

### 6. 배포 자동화 설정

**문제**: GitHub Actions 워크플로우 설정 필요

**해결**: Azure Static Web Apps는 자동으로 GitHub Actions 워크플로우 생성
- Azure Portal에서 Static Web App 생성 시 자동 설정됨

### 7. 비용

**비교**:
- **Vercel**: 무료 티어 (제한적)
- **Azure Static Web Apps**: 무료 티어 (월 100GB 대역폭, 무제한 트래픽)
- **GitHub Pages**: 완전 무료

**결론**: Azure도 무료 티어가 충분함

### 8. 성능 및 지역

**장점**:
- Azure는 전 세계 CDN 제공
- 한국 리전 지원 (서울)
- Vercel과 유사한 성능

### 9. 설정 파일 충돌

**문제**: `vercel.json`과 Azure 설정 파일이 공존 가능한지

**해결**: ✅ 문제 없음
- `vercel.json`은 Vercel에서만 사용
- `staticwebapp.config.json`은 Azure에서만 사용
- 서로 영향 없음

## 📋 배포 단계

### 1. Azure Portal에서 Static Web App 생성

1. Azure Portal 접속
2. "Static Web Apps" 검색 및 생성
3. GitHub 리포지토리 연결
4. 빌드 설정:
   - **App location**: `/`
   - **Api location**: (없음)
   - **Output location**: `/`

### 2. `staticwebapp.config.json` 파일 생성

프로젝트 루트에 다음 파일 생성:

```json
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  }
}
```

### 3. GitHub Actions 워크플로우 확인

Azure가 자동으로 생성한 워크플로우 파일 확인:
- `.github/workflows/azure-static-web-apps-*.yml`

### 4. 배포 확인

- Azure Portal에서 배포 상태 확인
- 생성된 URL로 접속 테스트

## 🔄 멀티 배포 전략

### 동시 배포 가능

다음 플랫폼에 동시 배포 가능:
- ✅ Vercel
- ✅ Azure Static Web Apps
- ✅ GitHub Pages
- ✅ Netlify (선택사항)

**장점**:
- 다중 백업
- 지역별 최적화
- 트래픽 분산

**주의사항**:
- 각 플랫폼마다 다른 URL
- 설정 파일 관리 필요

## 🎯 권장 사항

1. **Azure Static Web Apps 배포 추천**: ✅
   - 무료 티어 충분
   - 한국 리전 지원
   - GitHub 통합 우수

2. **동시 배포 전략**:
   - Vercel: 메인 배포
   - Azure: 백업/대체
   - GitHub Pages: 개발/테스트

3. **설정 파일 관리**:
   - `vercel.json`: Vercel용
   - `staticwebapp.config.json`: Azure용
   - `.github/workflows/main.yml`: GitHub Pages용

## ⚡ 빠른 시작

1. Azure Portal에서 Static Web App 생성
2. `staticwebapp.config.json` 파일 생성 (위 내용 참고)
3. GitHub에 커밋 및 푸시
4. Azure가 자동으로 배포 시작
5. 배포 완료 후 URL 확인

## 📝 체크리스트

- [ ] Azure Portal에서 Static Web App 생성
- [ ] `staticwebapp.config.json` 파일 생성
- [ ] GitHub 리포지토리 연결
- [ ] 배포 자동화 확인
- [ ] 배포된 사이트 테스트
- [ ] Supabase 연결 확인
- [ ] 모든 기능 테스트

