# GitHub 푸시 자동화 스크립트
# PowerShell에서 실행: .\setup-git.ps1

Write-Host "=== GitHub 저장소 설정 ===" -ForegroundColor Green
Write-Host ""

# GitHub 사용자명 입력
$username = Read-Host "GitHub 사용자명을 입력하세요"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "사용자명이 입력되지 않았습니다. 스크립트를 종료합니다." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Git 초기화 중..." -ForegroundColor Yellow
git init

Write-Host "파일 추가 중..." -ForegroundColor Yellow
git add .

Write-Host "커밋 생성 중..." -ForegroundColor Yellow
git commit -m "Initial commit: 일본어 학습 도우미 앱"

Write-Host "원격 저장소 연결 중..." -ForegroundColor Yellow
git remote add origin "https://github.com/$username/foreign_lang_helper.git"

Write-Host "브랜치 이름 변경 중..." -ForegroundColor Yellow
git branch -M main

Write-Host ""
Write-Host "=== 다음 단계 ===" -ForegroundColor Green
Write-Host "1. GitHub에서 저장소를 먼저 생성하세요: https://github.com/new"
Write-Host "2. 저장소 이름: foreign_lang_helper"
Write-Host "3. Public으로 설정"
Write-Host ""
Write-Host "저장소를 생성하셨나요? (Y/N)" -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -eq "Y" -or $confirm -eq "y") {
    Write-Host ""
    Write-Host "GitHub에 푸시 중..." -ForegroundColor Yellow
    Write-Host "인증이 필요할 수 있습니다." -ForegroundColor Yellow
    git push -u origin main
    
    Write-Host ""
    Write-Host "=== 완료! ===" -ForegroundColor Green
    Write-Host "배포 URL: https://$username.github.io/foreign_lang_helper/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "다음 단계:" -ForegroundColor Yellow
    Write-Host "1. GitHub 저장소 → Settings → Pages → Source를 'main'으로 설정"
    Write-Host "2. 네이버 개발자 센터에서 서비스 URL 등록: https://$username.github.io"
} else {
    Write-Host ""
    Write-Host "저장소를 생성한 후 다음 명령어를 실행하세요:" -ForegroundColor Yellow
    Write-Host "git push -u origin main" -ForegroundColor Cyan
}




