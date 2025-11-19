@echo off
echo ========================================
echo 일본어 학습 도우미 로컬 서버 시작
echo ========================================
echo.
echo 서버가 시작되었습니다!
echo 브라우저에서 다음 주소로 접속하세요:
echo.
echo    http://localhost:8000
echo.
echo 서버를 종료하려면 Ctrl+C를 누르세요.
echo ========================================
echo.

python -m http.server 8000

pause

