# Vercel 접근 제한 해제 방법

## 문제
Vercel에 배포한 사이트에 접속하면 Google 로그인 페이지가 나타나거나, 허락된 사람만 접근 가능한 상태

## 원인
Vercel 대시보드에서 "Protection" 기능이 활성화되어 있어서 발생하는 문제입니다.

## 해결 방법: 모든 사람이 접근 가능하도록 설정

### 1단계: Vercel 대시보드 접속
1. https://vercel.com 접속
2. 로그인 (Google 계정 또는 이메일)
3. 프로젝트 선택 (`foreign_lang_helper`)

### 2단계: Protection 설정 비활성화
1. 프로젝트 페이지 상단의 **Settings** 탭 클릭
2. 왼쪽 사이드바에서 **Protection** 메뉴 클릭
3. 현재 활성화된 Protection 설정 확인:
   - **Password Protection** (비밀번호 보호)
   - **OAuth Protection** (OAuth 보호 - Google 로그인 등)
   - **Vercel Authentication** (Vercel 인증)
4. 활성화된 모든 Protection 기능을 **비활성화**:
   - 각 항목 옆의 토글 스위치를 **OFF**로 변경
   - 또는 **Disable** / **Remove** 버튼 클릭
5. 확인 메시지가 나타나면 **Confirm** 또는 **Yes** 클릭

### 3단계: 저장 및 확인
1. 변경사항이 자동으로 저장됨
2. 몇 초 후 배포가 자동으로 재배포됨
3. 배포된 URL로 접속하여 확인:
   - Google 로그인 페이지가 더 이상 나타나지 않음
   - 누구나 링크를 통해 접근 가능

### 4단계: 배포 확인
1. 상단의 **Deployments** 탭 클릭
2. 최신 배포 상태가 **Ready**인지 확인
3. 배포된 URL 클릭하여 사이트 접속 테스트

## 상세 단계별 가이드

### Protection 설정 화면에서 확인할 항목들:

1. **Password Protection**
   - 상태: Enabled/Disabled
   - 비활성화 방법: 토글 스위치를 OFF로 변경

2. **OAuth Protection** (Google 로그인 등)
   - 상태: Enabled/Disabled
   - 비활성화 방법: 토글 스위치를 OFF로 변경 또는 "Remove" 버튼 클릭

3. **Vercel Authentication**
   - 상태: Enabled/Disabled
   - 비활성화 방법: 토글 스위치를 OFF로 변경

## 문제 해결

### Protection 메뉴가 보이지 않는 경우:
- Vercel의 무료 플랜에서는 Protection 기능이 제한적일 수 있습니다
- 프로젝트 설정에서 다른 위치에 있을 수 있습니다
- **Settings → General** 또는 **Settings → Security** 확인

### 변경 후에도 여전히 로그인 페이지가 나타나는 경우:
1. 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
2. 시크릿 모드에서 테스트
3. 다른 브라우저에서 테스트
4. Vercel 배포가 완료될 때까지 몇 분 대기

## 참고사항

- 현재 앱은 Google 로그인을 사용하지 않습니다
- localStorage 기반의 자체 로그인 시스템만 사용합니다
- Vercel Protection 기능은 프로젝트 전체에 인증을 추가하는 기능입니다
- Protection을 비활성화하면 누구나 링크를 통해 사이트에 접근할 수 있습니다

