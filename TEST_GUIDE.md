# 독해 문제 풀기 기능 테스트 가이드

## 방법 1: 브라우저에서 직접 열기 (가장 간단)

1. **파일 탐색기에서 `index.html` 파일 찾기**
   - 경로: `C:\Users\seong\OneDrive\Desktop\foreign_lang_helper\index.html`

2. **브라우저로 열기**
   - `index.html` 파일을 더블클릭하거나
   - 우클릭 → "연결 프로그램" → Chrome/Firefox/Edge 선택

3. **설정에서 JLPT N1 선택**
   - 우측 상단 ⚙️ 설정 버튼 클릭
   - "목표 자격증"에서 "JLPT N1" 선택
   - 저장

4. **독해 페이지로 이동**
   - 상단 네비게이션에서 "독해" 버튼 클릭
   - 자동으로 `jlptN1/read.json` 파일이 로드됩니다

5. **문제 풀기**
   - 지문을 읽고 문제를 풀어보세요
   - 선택지를 클릭하면 즉시 정답 확인 가능
   - 정답률이 실시간으로 표시됩니다

## 방법 2: 로컬 서버 실행 (권장)

브라우저에서 직접 열면 CORS 문제가 발생할 수 있으므로, 로컬 서버를 사용하는 것이 좋습니다.

### Python이 설치되어 있는 경우:

```powershell
# Python 3.x
python -m http.server 8000

# 또는 Python 2.x
python -m SimpleHTTPServer 8000
```

그 다음 브라우저에서 `http://localhost:8000` 접속

### Node.js가 설치되어 있는 경우:

```powershell
# http-server 설치 (처음 한 번만)
npm install -g http-server

# 서버 실행
http-server -p 8000
```

그 다음 브라우저에서 `http://localhost:8000` 접속

### VS Code Live Server 사용:

1. VS Code에서 프로젝트 폴더 열기
2. `index.html` 파일 열기
3. 우클릭 → "Open with Live Server"
4. 자동으로 브라우저에서 열림

## 테스트 체크리스트

- [ ] 설정에서 JLPT N1 선택
- [ ] 독해 페이지로 이동
- [ ] 지문이 정상적으로 표시되는지 확인
- [ ] 문제가 정상적으로 표시되는지 확인
- [ ] 선택지 클릭 시 정답/오답 표시 확인
- [ ] 정답률이 실시간으로 업데이트되는지 확인
- [ ] TTS 버튼이 표시되는지 확인 (지문 읽어주기)

## 문제 해결

### 지문이 로드되지 않는 경우:
- 브라우저 개발자 도구(F12) → Console 탭에서 오류 확인
- `jlptN1/read.json` 파일 경로가 올바른지 확인
- 파일이 UTF-8 인코딩으로 저장되었는지 확인

### CORS 오류가 발생하는 경우:
- 로컬 서버를 사용하세요 (방법 2)
- `file://` 프로토콜 대신 `http://localhost` 사용

### 문제가 표시되지 않는 경우:
- JSON 파일 형식이 올바른지 확인
- 브라우저 콘솔에서 오류 메시지 확인

