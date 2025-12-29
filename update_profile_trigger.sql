-- 프로필 자동 생성 트리거 함수 수정
-- native_language와 certifications 기본값 설정

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email, native_language, certifications)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        NULL, -- 온보딩에서 설정
        '[]'::jsonb -- 빈 배열로 초기화
    )
    ON CONFLICT (id) DO UPDATE SET
        username = COALESCE(EXCLUDED.username, profiles.username),
        email = COALESCE(EXCLUDED.email, profiles.email),
        native_language = COALESCE(profiles.native_language, EXCLUDED.native_language),
        certifications = COALESCE(profiles.certifications, EXCLUDED.certifications);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

