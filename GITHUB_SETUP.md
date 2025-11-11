# GitHub 푸시 가이드

## 단계별 가이드

### 1단계: GitHub 저장소 생성

1. https://github.com 접속 및 로그인
2. 우측 상단 "+" 버튼 → "New repository" 클릭
3. 저장소 정보 입력:
   - **Repository name**: `foreign_lang_helper`
   - **Description**: "일본어 학습 도우미 웹 애플리케이션"
   - **Public** 선택 (GitHub Pages 무료 사용)
   - "Add a README file" 체크 해제
   - "Add .gitignore" 체크 해제
4. "Create repository" 클릭

### 2단계: 로컬에서 Git 초기화

PowerShell 또는 명령 프롬프트를 열고 다음 명령어 실행:

```powershell
# 프로젝트 폴더로 이동
cd "C:\Users\seong\OneDrive\Desktop\foreign_lang_helper"

# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: 일본어 학습 도우미 앱"

# GitHub 저장소 연결 (YOUR_USERNAME을 실제 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/foreign_lang_helper.git

# main 브랜치로 이름 변경
git branch -M main

# GitHub에 푸시
git push -u origin main
```

**주의**: `YOUR_USERNAME`을 실제 GitHub 사용자명으로 변경하세요!

### 3단계: GitHub Pages 활성화

1. GitHub 저장소 페이지로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭
4. **Source** 섹션:
   - Branch: `main` 선택
   - Folder: `/ (root)` 선택
5. **Save** 클릭
6. 몇 분 후 배포 완료
7. 배포된 URL 확인: `https://YOUR_USERNAME.github.io/foreign_lang_helper/`

### 4단계: 네이버 API 서비스 URL 등록

1. [네이버 개발자 센터](https://developers.naver.com/apps/#/register) 접속
2. 애플리케이션 등록 또는 수정
3. **서비스 URL**에 GitHub Pages URL 입력:
   ```
   https://YOUR_USERNAME.github.io
   ```
   또는
   ```
   https://YOUR_USERNAME.github.io/foreign_lang_helper
   ```
4. 저장

### 5단계: 앱에서 API 키 사용

1. 배포된 사이트 접속
2. 설정 버튼 클릭
3. 네이버 API 키 입력
4. 저장 후 검색 테스트

## 문제 해결

### Git 인증 오류
GitHub에 푸시할 때 인증이 필요합니다:

**방법 1: Personal Access Token 사용**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" 클릭
3. 권한 선택: `repo` 체크
4. 토큰 생성 후 복사
5. 푸시할 때 비밀번호 대신 토큰 입력

**방법 2: GitHub Desktop 사용**
- GitHub Desktop 앱 설치 후 GUI로 푸시

### 푸시 명령어 오류
```powershell
# 원격 저장소 확인
git remote -v

# 원격 저장소 재설정 (필요시)
git remote set-url origin https://github.com/YOUR_USERNAME/foreign_lang_helper.git
```

### Pages가 작동하지 않음
- 저장소가 Public인지 확인
- Settings → Pages에서 올바른 브랜치 선택 확인
- 배포 완료까지 5-10분 기다리기

## 빠른 참조

```powershell
# 현재 상태 확인
git status

# 변경사항 추가
git add .

# 커밋
git commit -m "커밋 메시지"

# 푸시
git push origin main
```


