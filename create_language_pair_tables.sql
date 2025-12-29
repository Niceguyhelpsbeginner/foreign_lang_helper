-- 언어 쌍별 단어 테이블 생성
-- 각 언어 쌍에 대해 별도의 테이블 생성

-- 1. 일본어 -> 한국어
CREATE TABLE IF NOT EXISTS ja_ko (
    id BIGSERIAL PRIMARY KEY,
    source_word TEXT NOT NULL,
    target_meaning TEXT NOT NULL,
    pronunciation TEXT,
    hiragana TEXT,
    type TEXT,
    level TEXT,
    example TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_word)
);

-- 2. 한국어 -> 일본어
CREATE TABLE IF NOT EXISTS ko_ja (
    id BIGSERIAL PRIMARY KEY,
    source_word TEXT NOT NULL,
    target_meaning TEXT NOT NULL,
    pronunciation TEXT,
    hiragana TEXT,
    type TEXT,
    level TEXT,
    example TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_word)
);

-- 3. 영어 -> 중국어
CREATE TABLE IF NOT EXISTS en_zh (
    id BIGSERIAL PRIMARY KEY,
    source_word TEXT NOT NULL,
    target_meaning TEXT NOT NULL,
    pronunciation TEXT,
    type TEXT,
    level TEXT,
    example TEXT,
    synonyms JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_word)
);

-- 4. 중국어 -> 영어
CREATE TABLE IF NOT EXISTS zh_en (
    id BIGSERIAL PRIMARY KEY,
    source_word TEXT NOT NULL,
    target_meaning TEXT NOT NULL,
    pronunciation TEXT,
    type TEXT,
    level TEXT,
    example TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_word)
);

-- 5. 중국어 -> 일본어
CREATE TABLE IF NOT EXISTS zh_ja (
    id BIGSERIAL PRIMARY KEY,
    source_word TEXT NOT NULL,
    target_meaning TEXT NOT NULL,
    pronunciation TEXT,
    hiragana TEXT,
    type TEXT,
    level TEXT,
    example TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_word)
);

-- 6. 일본어 -> 중국어
CREATE TABLE IF NOT EXISTS ja_zh (
    id BIGSERIAL PRIMARY KEY,
    source_word TEXT NOT NULL,
    target_meaning TEXT NOT NULL,
    pronunciation TEXT,
    hiragana TEXT,
    type TEXT,
    level TEXT,
    example TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_word)
);

-- 7. 영어 -> 일본어
CREATE TABLE IF NOT EXISTS en_ja (
    id BIGSERIAL PRIMARY KEY,
    source_word TEXT NOT NULL,
    target_meaning TEXT NOT NULL,
    pronunciation TEXT,
    hiragana TEXT,
    type TEXT,
    level TEXT,
    example TEXT,
    synonyms JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_word)
);

-- 8. 일본어 -> 영어
CREATE TABLE IF NOT EXISTS ja_en (
    id BIGSERIAL PRIMARY KEY,
    source_word TEXT NOT NULL,
    target_meaning TEXT NOT NULL,
    pronunciation TEXT,
    hiragana TEXT,
    type TEXT,
    level TEXT,
    example TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_word)
);

-- 9. 한국어 -> 영어
CREATE TABLE IF NOT EXISTS ko_en (
    id BIGSERIAL PRIMARY KEY,
    source_word TEXT NOT NULL,
    target_meaning TEXT NOT NULL,
    pronunciation TEXT,
    type TEXT,
    level TEXT,
    example TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_word)
);

-- 10. 영어 -> 한국어
CREATE TABLE IF NOT EXISTS en_ko (
    id BIGSERIAL PRIMARY KEY,
    source_word TEXT NOT NULL,
    target_meaning TEXT NOT NULL,
    pronunciation TEXT,
    type TEXT,
    level TEXT,
    example TEXT,
    synonyms JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_word)
);

-- 11. 한국어 -> 중국어
CREATE TABLE IF NOT EXISTS ko_zh (
    id BIGSERIAL PRIMARY KEY,
    source_word TEXT NOT NULL,
    target_meaning TEXT NOT NULL,
    pronunciation TEXT,
    type TEXT,
    level TEXT,
    example TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_word)
);

-- 12. 중국어 -> 한국어
CREATE TABLE IF NOT EXISTS zh_ko (
    id BIGSERIAL PRIMARY KEY,
    source_word TEXT NOT NULL,
    target_meaning TEXT NOT NULL,
    pronunciation TEXT,
    type TEXT,
    level TEXT,
    example TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_word)
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_ja_ko_source ON ja_ko(source_word);
CREATE INDEX IF NOT EXISTS idx_ko_ja_source ON ko_ja(source_word);
CREATE INDEX IF NOT EXISTS idx_en_zh_source ON en_zh(source_word);
CREATE INDEX IF NOT EXISTS idx_zh_en_source ON zh_en(source_word);
CREATE INDEX IF NOT EXISTS idx_zh_ja_source ON zh_ja(source_word);
CREATE INDEX IF NOT EXISTS idx_ja_zh_source ON ja_zh(source_word);
CREATE INDEX IF NOT EXISTS idx_en_ja_source ON en_ja(source_word);
CREATE INDEX IF NOT EXISTS idx_ja_en_source ON ja_en(source_word);
CREATE INDEX IF NOT EXISTS idx_ko_en_source ON ko_en(source_word);
CREATE INDEX IF NOT EXISTS idx_en_ko_source ON en_ko(source_word);
CREATE INDEX IF NOT EXISTS idx_ko_zh_source ON ko_zh(source_word);
CREATE INDEX IF NOT EXISTS idx_zh_ko_source ON zh_ko(source_word);

-- updated_at 자동 업데이트 트리거 함수 (이미 있다면 스킵)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 생성 (이미 존재하면 삭제 후 재생성)
DROP TRIGGER IF EXISTS update_ja_ko_updated_at ON ja_ko;
CREATE TRIGGER update_ja_ko_updated_at BEFORE UPDATE ON ja_ko
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ko_ja_updated_at ON ko_ja;
CREATE TRIGGER update_ko_ja_updated_at BEFORE UPDATE ON ko_ja
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_en_zh_updated_at ON en_zh;
CREATE TRIGGER update_en_zh_updated_at BEFORE UPDATE ON en_zh
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_zh_en_updated_at ON zh_en;
CREATE TRIGGER update_zh_en_updated_at BEFORE UPDATE ON zh_en
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_zh_ja_updated_at ON zh_ja;
CREATE TRIGGER update_zh_ja_updated_at BEFORE UPDATE ON zh_ja
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ja_zh_updated_at ON ja_zh;
CREATE TRIGGER update_ja_zh_updated_at BEFORE UPDATE ON ja_zh
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_en_ja_updated_at ON en_ja;
CREATE TRIGGER update_en_ja_updated_at BEFORE UPDATE ON en_ja
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ja_en_updated_at ON ja_en;
CREATE TRIGGER update_ja_en_updated_at BEFORE UPDATE ON ja_en
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ko_en_updated_at ON ko_en;
CREATE TRIGGER update_ko_en_updated_at BEFORE UPDATE ON ko_en
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_en_ko_updated_at ON en_ko;
CREATE TRIGGER update_en_ko_updated_at BEFORE UPDATE ON en_ko
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ko_zh_updated_at ON ko_zh;
CREATE TRIGGER update_ko_zh_updated_at BEFORE UPDATE ON ko_zh
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_zh_ko_updated_at ON zh_ko;
CREATE TRIGGER update_zh_ko_updated_at BEFORE UPDATE ON zh_ko
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책 설정 (모든 사용자가 읽기 가능)
ALTER TABLE ja_ko ENABLE ROW LEVEL SECURITY;
ALTER TABLE ko_ja ENABLE ROW LEVEL SECURITY;
ALTER TABLE en_zh ENABLE ROW LEVEL SECURITY;
ALTER TABLE zh_en ENABLE ROW LEVEL SECURITY;
ALTER TABLE zh_ja ENABLE ROW LEVEL SECURITY;
ALTER TABLE ja_zh ENABLE ROW LEVEL SECURITY;
ALTER TABLE en_ja ENABLE ROW LEVEL SECURITY;
ALTER TABLE ja_en ENABLE ROW LEVEL SECURITY;
ALTER TABLE ko_en ENABLE ROW LEVEL SECURITY;
ALTER TABLE en_ko ENABLE ROW LEVEL SECURITY;
ALTER TABLE ko_zh ENABLE ROW LEVEL SECURITY;
ALTER TABLE zh_ko ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 생성 (이미 존재하면 삭제 후 재생성)
DROP POLICY IF EXISTS "Anyone can read ja_ko" ON ja_ko;
CREATE POLICY "Anyone can read ja_ko" ON ja_ko FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read ko_ja" ON ko_ja;
CREATE POLICY "Anyone can read ko_ja" ON ko_ja FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read en_zh" ON en_zh;
CREATE POLICY "Anyone can read en_zh" ON en_zh FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read zh_en" ON zh_en;
CREATE POLICY "Anyone can read zh_en" ON zh_en FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read zh_ja" ON zh_ja;
CREATE POLICY "Anyone can read zh_ja" ON zh_ja FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read ja_zh" ON ja_zh;
CREATE POLICY "Anyone can read ja_zh" ON ja_zh FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read en_ja" ON en_ja;
CREATE POLICY "Anyone can read en_ja" ON en_ja FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read ja_en" ON ja_en;
CREATE POLICY "Anyone can read ja_en" ON ja_en FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read ko_en" ON ko_en;
CREATE POLICY "Anyone can read ko_en" ON ko_en FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read en_ko" ON en_ko;
CREATE POLICY "Anyone can read en_ko" ON en_ko FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read ko_zh" ON ko_zh;
CREATE POLICY "Anyone can read ko_zh" ON ko_zh FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read zh_ko" ON zh_ko;
CREATE POLICY "Anyone can read zh_ko" ON zh_ko FOR SELECT USING (true);

-- 마이그레이션을 위한 INSERT 정책 (각 테이블마다 고유한 이름 사용)
DROP POLICY IF EXISTS "Allow insert for ja_ko migration" ON ja_ko;
CREATE POLICY "Allow insert for ja_ko migration" ON ja_ko FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for ko_ja migration" ON ko_ja;
CREATE POLICY "Allow insert for ko_ja migration" ON ko_ja FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for en_zh migration" ON en_zh;
CREATE POLICY "Allow insert for en_zh migration" ON en_zh FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for zh_en migration" ON zh_en;
CREATE POLICY "Allow insert for zh_en migration" ON zh_en FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for zh_ja migration" ON zh_ja;
CREATE POLICY "Allow insert for zh_ja migration" ON zh_ja FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for ja_zh migration" ON ja_zh;
CREATE POLICY "Allow insert for ja_zh migration" ON ja_zh FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for en_ja migration" ON en_ja;
CREATE POLICY "Allow insert for en_ja migration" ON en_ja FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for ja_en migration" ON ja_en;
CREATE POLICY "Allow insert for ja_en migration" ON ja_en FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for ko_en migration" ON ko_en;
CREATE POLICY "Allow insert for ko_en migration" ON ko_en FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for en_ko migration" ON en_ko;
CREATE POLICY "Allow insert for en_ko migration" ON en_ko FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for ko_zh migration" ON ko_zh;
CREATE POLICY "Allow insert for ko_zh migration" ON ko_zh FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for zh_ko migration" ON zh_ko;
CREATE POLICY "Allow insert for zh_ko migration" ON zh_ko FOR INSERT WITH CHECK (true);

