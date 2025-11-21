-- words 테이블에 INSERT 및 UPDATE 정책 추가
-- 마이그레이션을 위해 임시로 모든 사용자가 INSERT/UPDATE 가능하도록 설정

-- 기존 정책이 있다면 삭제 (선택사항)
-- DROP POLICY IF EXISTS "Allow insert for migration" ON words;
-- DROP POLICY IF EXISTS "Allow update for migration" ON words;

-- INSERT 정책 추가
CREATE POLICY "Allow insert for migration"
    ON words FOR INSERT
    WITH CHECK (true);

-- UPDATE 정책 추가 (upsert 사용 시 필요)
CREATE POLICY "Allow update for migration"
    ON words FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 참고: 마이그레이션 완료 후 이 정책들을 삭제하고 더 제한적인 정책으로 변경할 수 있습니다.
-- 예: 관리자만 INSERT/UPDATE 가능하도록
