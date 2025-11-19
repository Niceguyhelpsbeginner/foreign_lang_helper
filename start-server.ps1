Write-Host "========================================" -ForegroundColor Green
Write-Host "일본어 학습 도우미 로컬 서버 시작" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "서버가 시작되었습니다!" -ForegroundColor Yellow
Write-Host "브라우저에서 다음 주소로 접속하세요:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "서버를 종료하려면 Ctrl+C를 누르세요." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

python -m http.server 8000

