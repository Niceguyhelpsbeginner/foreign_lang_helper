-- 온보딩 필드 추가: profiles 테이블에 native_language와 certifications 추가

-- native_language 필드 추가 (모국어)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS native_language TEXT;

-- certifications 필드 추가 (자격증 배열, JSONB 타입)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;

-- 인덱스 생성 (선택사항, 검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_profiles_native_language ON profiles(native_language);
CREATE INDEX IF NOT EXISTS idx_profiles_certifications ON profiles USING GIN (certifications);

-- 코멘트 추가
COMMENT ON COLUMN profiles.native_language IS '사용자의 모국어 (ko, ja, en, zh 등)';
COMMENT ON COLUMN profiles.certifications IS '사용자가 선택한 자격증 목록 (JSON 배열, 예: ["jlpt", "toeic"])';

