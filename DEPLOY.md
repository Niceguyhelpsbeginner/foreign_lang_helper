# GitHub Pages 배포 가이드

## 1. GitHub 저장소 생성

1. GitHub에 로그인
2. 우측 상단의 "+" 버튼 클릭 → "New repository" 선택
3. 저장소 정보 입력:
   - Repository name: `foreign_lang_helper` (또는 원하는 이름)
   - Description: "일본어 학습 도우미 웹 애플리케이션"
   - Public 선택 (GitHub Pages는 Public 저장소에서 무료)
   - "Add a README file" 체크 해제 (이미 있음)
   - "Add .gitignore" 체크 해제 (이미 있음)
4. "Create repository" 클릭

## 2. 로컬에서 Git 초기화 및 푸시

터미널(또는 PowerShell)에서 프로젝트 폴더로 이동 후 다음 명령어 실행:

```bash
# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: 일본어 학습 도우미 앱"

# GitHub 저장소 연결 (YOUR_USERNAME을 실제 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/foreign_lang_helper.git

# main 브랜치로 이름 변경
git branch -M main

# GitHub에 푸시
git push -u origin main
```

## 3. GitHub Pages 활성화

1. GitHub 저장소 페이지로 이동
2. Settings 탭 클릭
3. 왼쪽 메뉴에서 "Pages" 클릭
4. Source 섹션에서:
   - Branch: `main` 선택
   - Folder: `/ (root)` 선택
5. "Save" 클릭
6. 몇 분 후 배포 완료
7. 배포된 URL 확인: `https://YOUR_USERNAME.github.io/foreign_lang_helper/`

## 4. 네이버 API 서비스 URL 등록

1. [네이버 개발자 센터](https://developers.naver.com/apps/#/register) 접속
2. 애플리케이션 등록 또는 기존 애플리케이션 수정
3. 서비스 URL에 GitHub Pages URL 입력:
   - 예: `https://YOUR_USERNAME.github.io`
   - 또는: `https://YOUR_USERNAME.github.io/foreign_lang_helper`
4. 저장

## 5. 앱에서 API 키 입력

1. 배포된 사이트 접속
2. 우측 상단 설정 버튼 클릭
3. 네이버 API 클라이언트 ID와 Secret 입력
4. 저장

## 문제 해결

### 푸시 오류
- GitHub 인증이 필요할 수 있습니다
- Personal Access Token 사용 또는 GitHub Desktop 사용 권장

### Pages가 작동하지 않음
- 저장소가 Public인지 확인
- Settings → Pages에서 올바른 브랜치 선택 확인
- 배포 완료까지 몇 분 기다리기

### 네이버 API 오류
- 서비스 URL이 정확히 입력되었는지 확인
- GitHub Pages URL과 일치하는지 확인
- API 키가 올바르게 입력되었는지 확인




