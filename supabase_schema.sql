-- 1. 단어 테이블 (일본어/영어 통합)
CREATE TABLE words (
    id BIGSERIAL PRIMARY KEY,
    word TEXT NOT NULL,
    meaning TEXT NOT NULL,
    pronunciation TEXT,
    hiragana TEXT,
    type TEXT, -- 'word', 'kanji', 'verb', 'noun', 'adjective' 등
    language TEXT NOT NULL DEFAULT 'ja', -- 'ja' (일본어), 'en' (영어)
    level TEXT, -- 'N1', 'N2', 'N3', 'N4', 'N5', 'intermediate', 'advanced' 등
    
    -- 일본어 전용 필드
    kanji_components JSONB, -- ['若', '者'] 형태
    
    -- 영어 전용 필드
    example TEXT,
    synonyms JSONB, -- ['house', 'lodge'] 형태
    
    -- 공통 필드
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 단어와 언어의 조합은 유일해야 함
CREATE UNIQUE INDEX idx_words_word_language ON words(word, language);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_words_word ON words(word);
CREATE INDEX idx_words_language ON words(language);
CREATE INDEX idx_words_level ON words(level);
CREATE INDEX idx_words_meaning_pgroonga ON words USING pgroonga (meaning);

-- 2. 사용자 프로필 테이블 (Supabase Auth와 연동)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 사용자 단어장 테이블
CREATE TABLE user_vocabulary (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    mastered BOOLEAN DEFAULT FALSE,
    review_count INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

CREATE INDEX idx_user_vocabulary_user_id ON user_vocabulary(user_id);
CREATE INDEX idx_user_vocabulary_word_id ON user_vocabulary(word_id);

-- 4. 사용자 학습 진행상황 테이블
CREATE TABLE user_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    words_learned INTEGER DEFAULT 0,
    quiz_score INTEGER DEFAULT 0,
    study_time_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_date ON user_progress(date);

-- 5. 검색 기록 테이블
CREATE TABLE search_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    language TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at DESC);

-- 6. Row Level Security (RLS) 정책 설정

-- profiles 테이블: 사용자는 자신의 프로필만 읽고 수정 가능
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- words 테이블: 모든 사용자가 읽기 가능
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read words"
    ON words FOR SELECT
    USING (true);

-- words 테이블: 마이그레이션을 위해 INSERT 허용
-- 참고: 프로덕션 환경에서는 더 제한적인 정책으로 변경하는 것을 권장합니다
CREATE POLICY "Allow insert for migration"
    ON words FOR INSERT
    WITH CHECK (true);

-- words 테이블: 마이그레이션을 위해 UPDATE 허용 (upsert 사용 시 필요)
CREATE POLICY "Allow update for migration"
    ON words FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- user_vocabulary 테이블: 사용자는 자신의 단어장만 접근 가능
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vocabulary"
    ON user_vocabulary FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_progress 테이블: 사용자는 자신의 진행상황만 접근 가능
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress"
    ON user_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- search_history 테이블: 사용자는 자신의 검색 기록만 접근 가능
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own search history"
    ON search_history FOR ALL
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 7. 프로필 자동 생성 함수 (회원가입 시)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

