-- 언어 쌍별 퀴즈 테이블 생성
-- 각 언어 쌍에 대해 별도의 퀴즈 테이블 생성

-- 1. 일본어 -> 한국어 퀴즈
CREATE TABLE IF NOT EXISTS ja_ko_quizzes (
    id BIGSERIAL PRIMARY KEY,
    word_id BIGINT REFERENCES ja_ko(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice', -- 'multiple_choice', 'fill_blank', 'translation' 등
    question_text TEXT NOT NULL, -- 문제 텍스트
    options JSONB NOT NULL, -- 선택지 배열 예: ["의미1", "의미2", "의미3", "의미4"]
    correct_answer INTEGER NOT NULL, -- 정답 인덱스 (0부터 시작)
    difficulty TEXT NOT NULL DEFAULT 'medium', -- 'easy', 'medium', 'hard'
    explanation TEXT, -- 해설 (선택)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 한국어 -> 일본어 퀴즈
CREATE TABLE IF NOT EXISTS ko_ja_quizzes (
    id BIGSERIAL PRIMARY KEY,
    word_id BIGINT REFERENCES ko_ja(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 영어 -> 중국어 퀴즈
CREATE TABLE IF NOT EXISTS en_zh_quizzes (
    id BIGSERIAL PRIMARY KEY,
    word_id BIGINT REFERENCES en_zh(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 중국어 -> 영어 퀴즈
CREATE TABLE IF NOT EXISTS zh_en_quizzes (
    id BIGSERIAL PRIMARY KEY,
    word_id BIGINT REFERENCES zh_en(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 중국어 -> 일본어 퀴즈
CREATE TABLE IF NOT EXISTS zh_ja_quizzes (
    id BIGSERIAL PRIMARY KEY,
    word_id BIGINT REFERENCES zh_ja(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 일본어 -> 중국어 퀴즈
CREATE TABLE IF NOT EXISTS ja_zh_quizzes (
    id BIGSERIAL PRIMARY KEY,
    word_id BIGINT REFERENCES ja_zh(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 영어 -> 일본어 퀴즈
CREATE TABLE IF NOT EXISTS en_ja_quizzes (
    id BIGSERIAL PRIMARY KEY,
    word_id BIGINT REFERENCES en_ja(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 일본어 -> 영어 퀴즈
CREATE TABLE IF NOT EXISTS ja_en_quizzes (
    id BIGSERIAL PRIMARY KEY,
    word_id BIGINT REFERENCES ja_en(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 한국어 -> 영어 퀴즈
CREATE TABLE IF NOT EXISTS ko_en_quizzes (
    id BIGSERIAL PRIMARY KEY,
    word_id BIGINT REFERENCES ko_en(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 영어 -> 한국어 퀴즈
CREATE TABLE IF NOT EXISTS en_ko_quizzes (
    id BIGSERIAL PRIMARY KEY,
    word_id BIGINT REFERENCES en_ko(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. 한국어 -> 중국어 퀴즈
CREATE TABLE IF NOT EXISTS ko_zh_quizzes (
    id BIGSERIAL PRIMARY KEY,
    word_id BIGINT REFERENCES ko_zh(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. 중국어 -> 한국어 퀴즈
CREATE TABLE IF NOT EXISTS zh_ko_quizzes (
    id BIGSERIAL PRIMARY KEY,
    word_id BIGINT REFERENCES zh_ko(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_ja_ko_quizzes_word_id ON ja_ko_quizzes(word_id);
CREATE INDEX IF NOT EXISTS idx_ja_ko_quizzes_difficulty ON ja_ko_quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_ja_ko_quizzes_question_type ON ja_ko_quizzes(question_type);

CREATE INDEX IF NOT EXISTS idx_ko_ja_quizzes_word_id ON ko_ja_quizzes(word_id);
CREATE INDEX IF NOT EXISTS idx_ko_ja_quizzes_difficulty ON ko_ja_quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_ko_ja_quizzes_question_type ON ko_ja_quizzes(question_type);

CREATE INDEX IF NOT EXISTS idx_en_zh_quizzes_word_id ON en_zh_quizzes(word_id);
CREATE INDEX IF NOT EXISTS idx_en_zh_quizzes_difficulty ON en_zh_quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_en_zh_quizzes_question_type ON en_zh_quizzes(question_type);

CREATE INDEX IF NOT EXISTS idx_zh_en_quizzes_word_id ON zh_en_quizzes(word_id);
CREATE INDEX IF NOT EXISTS idx_zh_en_quizzes_difficulty ON zh_en_quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_zh_en_quizzes_question_type ON zh_en_quizzes(question_type);

CREATE INDEX IF NOT EXISTS idx_zh_ja_quizzes_word_id ON zh_ja_quizzes(word_id);
CREATE INDEX IF NOT EXISTS idx_zh_ja_quizzes_difficulty ON zh_ja_quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_zh_ja_quizzes_question_type ON zh_ja_quizzes(question_type);

CREATE INDEX IF NOT EXISTS idx_ja_zh_quizzes_word_id ON ja_zh_quizzes(word_id);
CREATE INDEX IF NOT EXISTS idx_ja_zh_quizzes_difficulty ON ja_zh_quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_ja_zh_quizzes_question_type ON ja_zh_quizzes(question_type);

CREATE INDEX IF NOT EXISTS idx_en_ja_quizzes_word_id ON en_ja_quizzes(word_id);
CREATE INDEX IF NOT EXISTS idx_en_ja_quizzes_difficulty ON en_ja_quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_en_ja_quizzes_question_type ON en_ja_quizzes(question_type);

CREATE INDEX IF NOT EXISTS idx_ja_en_quizzes_word_id ON ja_en_quizzes(word_id);
CREATE INDEX IF NOT EXISTS idx_ja_en_quizzes_difficulty ON ja_en_quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_ja_en_quizzes_question_type ON ja_en_quizzes(question_type);

CREATE INDEX IF NOT EXISTS idx_ko_en_quizzes_word_id ON ko_en_quizzes(word_id);
CREATE INDEX IF NOT EXISTS idx_ko_en_quizzes_difficulty ON ko_en_quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_ko_en_quizzes_question_type ON ko_en_quizzes(question_type);

CREATE INDEX IF NOT EXISTS idx_en_ko_quizzes_word_id ON en_ko_quizzes(word_id);
CREATE INDEX IF NOT EXISTS idx_en_ko_quizzes_difficulty ON en_ko_quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_en_ko_quizzes_question_type ON en_ko_quizzes(question_type);

CREATE INDEX IF NOT EXISTS idx_ko_zh_quizzes_word_id ON ko_zh_quizzes(word_id);
CREATE INDEX IF NOT EXISTS idx_ko_zh_quizzes_difficulty ON ko_zh_quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_ko_zh_quizzes_question_type ON ko_zh_quizzes(question_type);

CREATE INDEX IF NOT EXISTS idx_zh_ko_quizzes_word_id ON zh_ko_quizzes(word_id);
CREATE INDEX IF NOT EXISTS idx_zh_ko_quizzes_difficulty ON zh_ko_quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_zh_ko_quizzes_question_type ON zh_ko_quizzes(question_type);

-- updated_at 자동 업데이트 트리거 함수 (이미 있다면 재사용)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 생성
DROP TRIGGER IF EXISTS update_ja_ko_quizzes_updated_at ON ja_ko_quizzes;
CREATE TRIGGER update_ja_ko_quizzes_updated_at BEFORE UPDATE ON ja_ko_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ko_ja_quizzes_updated_at ON ko_ja_quizzes;
CREATE TRIGGER update_ko_ja_quizzes_updated_at BEFORE UPDATE ON ko_ja_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_en_zh_quizzes_updated_at ON en_zh_quizzes;
CREATE TRIGGER update_en_zh_quizzes_updated_at BEFORE UPDATE ON en_zh_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_zh_en_quizzes_updated_at ON zh_en_quizzes;
CREATE TRIGGER update_zh_en_quizzes_updated_at BEFORE UPDATE ON zh_en_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_zh_ja_quizzes_updated_at ON zh_ja_quizzes;
CREATE TRIGGER update_zh_ja_quizzes_updated_at BEFORE UPDATE ON zh_ja_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ja_zh_quizzes_updated_at ON ja_zh_quizzes;
CREATE TRIGGER update_ja_zh_quizzes_updated_at BEFORE UPDATE ON ja_zh_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_en_ja_quizzes_updated_at ON en_ja_quizzes;
CREATE TRIGGER update_en_ja_quizzes_updated_at BEFORE UPDATE ON en_ja_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ja_en_quizzes_updated_at ON ja_en_quizzes;
CREATE TRIGGER update_ja_en_quizzes_updated_at BEFORE UPDATE ON ja_en_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ko_en_quizzes_updated_at ON ko_en_quizzes;
CREATE TRIGGER update_ko_en_quizzes_updated_at BEFORE UPDATE ON ko_en_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_en_ko_quizzes_updated_at ON en_ko_quizzes;
CREATE TRIGGER update_en_ko_quizzes_updated_at BEFORE UPDATE ON en_ko_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ko_zh_quizzes_updated_at ON ko_zh_quizzes;
CREATE TRIGGER update_ko_zh_quizzes_updated_at BEFORE UPDATE ON ko_zh_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_zh_ko_quizzes_updated_at ON zh_ko_quizzes;
CREATE TRIGGER update_zh_ko_quizzes_updated_at BEFORE UPDATE ON zh_ko_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책 설정 (모든 사용자가 읽기 가능)
ALTER TABLE ja_ko_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ko_ja_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE en_zh_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE zh_en_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE zh_ja_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ja_zh_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE en_ja_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ja_en_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ko_en_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE en_ko_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ko_zh_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE zh_ko_quizzes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 생성
DROP POLICY IF EXISTS "Anyone can read ja_ko_quizzes" ON ja_ko_quizzes;
CREATE POLICY "Anyone can read ja_ko_quizzes" ON ja_ko_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read ko_ja_quizzes" ON ko_ja_quizzes;
CREATE POLICY "Anyone can read ko_ja_quizzes" ON ko_ja_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read en_zh_quizzes" ON en_zh_quizzes;
CREATE POLICY "Anyone can read en_zh_quizzes" ON en_zh_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read zh_en_quizzes" ON zh_en_quizzes;
CREATE POLICY "Anyone can read zh_en_quizzes" ON zh_en_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read zh_ja_quizzes" ON zh_ja_quizzes;
CREATE POLICY "Anyone can read zh_ja_quizzes" ON zh_ja_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read ja_zh_quizzes" ON ja_zh_quizzes;
CREATE POLICY "Anyone can read ja_zh_quizzes" ON ja_zh_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read en_ja_quizzes" ON en_ja_quizzes;
CREATE POLICY "Anyone can read en_ja_quizzes" ON en_ja_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read ja_en_quizzes" ON ja_en_quizzes;
CREATE POLICY "Anyone can read ja_en_quizzes" ON ja_en_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read ko_en_quizzes" ON ko_en_quizzes;
CREATE POLICY "Anyone can read ko_en_quizzes" ON ko_en_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read en_ko_quizzes" ON en_ko_quizzes;
CREATE POLICY "Anyone can read en_ko_quizzes" ON en_ko_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read ko_zh_quizzes" ON ko_zh_quizzes;
CREATE POLICY "Anyone can read ko_zh_quizzes" ON ko_zh_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read zh_ko_quizzes" ON zh_ko_quizzes;
CREATE POLICY "Anyone can read zh_ko_quizzes" ON zh_ko_quizzes FOR SELECT USING (true);

-- 마이그레이션을 위한 INSERT 정책 (각 테이블마다 고유한 이름 사용)
DROP POLICY IF EXISTS "Allow insert for ja_ko_quizzes migration" ON ja_ko_quizzes;
CREATE POLICY "Allow insert for ja_ko_quizzes migration" ON ja_ko_quizzes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for ko_ja_quizzes migration" ON ko_ja_quizzes;
CREATE POLICY "Allow insert for ko_ja_quizzes migration" ON ko_ja_quizzes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for en_zh_quizzes migration" ON en_zh_quizzes;
CREATE POLICY "Allow insert for en_zh_quizzes migration" ON en_zh_quizzes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for zh_en_quizzes migration" ON zh_en_quizzes;
CREATE POLICY "Allow insert for zh_en_quizzes migration" ON zh_en_quizzes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for zh_ja_quizzes migration" ON zh_ja_quizzes;
CREATE POLICY "Allow insert for zh_ja_quizzes migration" ON zh_ja_quizzes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for ja_zh_quizzes migration" ON ja_zh_quizzes;
CREATE POLICY "Allow insert for ja_zh_quizzes migration" ON ja_zh_quizzes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for en_ja_quizzes migration" ON en_ja_quizzes;
CREATE POLICY "Allow insert for en_ja_quizzes migration" ON en_ja_quizzes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for ja_en_quizzes migration" ON ja_en_quizzes;
CREATE POLICY "Allow insert for ja_en_quizzes migration" ON ja_en_quizzes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for ko_en_quizzes migration" ON ko_en_quizzes;
CREATE POLICY "Allow insert for ko_en_quizzes migration" ON ko_en_quizzes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for en_ko_quizzes migration" ON en_ko_quizzes;
CREATE POLICY "Allow insert for en_ko_quizzes migration" ON en_ko_quizzes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for ko_zh_quizzes migration" ON ko_zh_quizzes;
CREATE POLICY "Allow insert for ko_zh_quizzes migration" ON ko_zh_quizzes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for zh_ko_quizzes migration" ON zh_ko_quizzes;
CREATE POLICY "Allow insert for zh_ko_quizzes migration" ON zh_ko_quizzes FOR INSERT WITH CHECK (true);

