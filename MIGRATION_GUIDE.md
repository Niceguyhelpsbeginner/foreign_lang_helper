# Supabase 데이터 마이그레이션 가이드

## 📋 단계별 마이그레이션 방법

### 1단계: Supabase 스키마 업데이트

먼저 Supabase에 중국어/일본어 뜻 컬럼을 추가해야 합니다.

1. **Supabase 대시보드 접속**
   - https://supabase.com 접속
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 **SQL Editor** 클릭
   - **New query** 클릭

3. **스키마 업데이트 SQL 실행**
   - `add_translation_fields.sql` 파일의 내용을 복사하여 붙여넣기
   - 또는 다음 SQL 실행:

```sql
-- words 테이블에 중국어/일본어 뜻 컬럼 추가
ALTER TABLE words 
ADD COLUMN IF NOT EXISTS chinese_meaning TEXT,
ADD COLUMN IF NOT EXISTS japanese_meaning TEXT;

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_words_chinese_meaning ON words(chinese_meaning) WHERE chinese_meaning IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_words_japanese_meaning ON words(japanese_meaning) WHERE japanese_meaning IS NOT NULL;

-- 주석 추가
COMMENT ON COLUMN words.chinese_meaning IS '중국어 뜻 (영어 단어의 중국어 번역)';
COMMENT ON COLUMN words.japanese_meaning IS '일본어 뜻 (영어 단어의 일본어 번역)';
```

4. **Run 버튼 클릭** (또는 Ctrl+Enter)

### 2단계: 마이그레이션 스크립트 준비

1. **supabase_config.js 파일 확인**
   - `supabase_config.js.example` 파일을 복사하여 `supabase_config.js` 생성 (아직 없다면)
   - Supabase URL과 API 키 입력:
   ```javascript
   module.exports = {
       SUPABASE_URL: 'https://your-project-id.supabase.co',
       SUPABASE_ANON_KEY: 'your-anon-key-here'
   };
   ```

2. **필요한 패키지 설치 확인**
   ```bash
   npm install @supabase/supabase-js
   ```

### 3단계: 데이터 마이그레이션 실행

터미널에서 다음 명령어 실행:

```bash
node migrate_data.js
```

또는 PowerShell에서:

```powershell
node migrate_data.js
```

### 4단계: 마이그레이션 결과 확인

마이그레이션이 완료되면:

1. **Supabase 대시보드에서 확인**
   - **Table Editor** → `words` 테이블 클릭
   - `language = 'en'` 필터 적용
   - `chinese_meaning`, `japanese_meaning` 컬럼이 추가되었는지 확인
   - 일부 단어에 중국어/일본어 뜻이 있는지 확인

2. **브라우저에서 테스트**
   - `index.html` 파일 열기
   - 설정에서 언어를 중국어 또는 일본어로 변경
   - 토익 지문의 단어에 마우스를 올려서 해당 언어의 뜻이 표시되는지 확인

## 🔧 문제 해결

### 오류: "column does not exist"
- **원인**: Supabase 스키마에 컬럼이 추가되지 않음
- **해결**: 1단계를 다시 실행하여 스키마를 업데이트하세요

### 오류: "Cannot find module 'supabase_config.js'"
- **원인**: 설정 파일이 없음
- **해결**: `supabase_config.js.example`을 복사하여 `supabase_config.js`를 만들고 API 키를 입력하세요

### 오류: "Invalid API key"
- **원인**: API 키가 잘못되었거나 권한 문제
- **해결**: Supabase 대시보드에서 API 키를 다시 확인하고 `anon public` 키를 사용하세요

### 데이터가 업데이트되지 않음
- **원인**: `upsert`가 제대로 작동하지 않음
- **해결**: 
  1. Supabase 대시보드에서 기존 영어 단어 데이터 삭제 후 다시 마이그레이션
  2. 또는 수동으로 UPDATE 쿼리 실행

## 📝 수동 업데이트 방법 (선택사항)

특정 단어만 업데이트하고 싶다면:

```sql
-- 예시: "accommodate" 단어의 중국어/일본어 뜻 업데이트
UPDATE words 
SET 
    chinese_meaning = '容纳，适应',
    japanese_meaning = '収容する、適応させる'
WHERE word = 'accommodate' AND language = 'en';
```

## ✅ 체크리스트

- [ ] Supabase 스키마 업데이트 완료 (컬럼 추가)
- [ ] `supabase_config.js` 파일 생성 및 설정 완료
- [ ] `migrate_data.js` 실행 완료
- [ ] Supabase 대시보드에서 데이터 확인 완료
- [ ] 브라우저에서 테스트 완료

## 💡 참고사항

- 마이그레이션은 기존 데이터를 업데이트합니다 (`upsert` 사용)
- 이미 존재하는 단어는 새로운 필드 값으로 업데이트됩니다
- 번역이 없는 단어는 `null`로 저장됩니다
- 나중에 번역을 추가하려면 JSON 파일을 수정하고 다시 마이그레이션하면 됩니다

