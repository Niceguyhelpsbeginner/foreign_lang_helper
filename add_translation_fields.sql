-- TOEIC 사전에 중국어/일본어 뜻 필드 추가

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

