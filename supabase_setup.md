# Supabase 설정 가이드

## 1단계: Supabase 프로젝트 설정

1. Supabase 대시보드에서 새 프로젝트 생성
2. 프로젝트 이름 입력 (예: `foreign_lang_helper`)
3. 데이터베이스 비밀번호 설정 (기억해두세요!)
4. 리전 선택 (가장 가까운 리전 선택)

## 2단계: API 키 확인

1. 프로젝트 대시보드에서 **Settings** → **API** 클릭
2. 다음 정보를 복사해두세요:
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** 키
   - **service_role** 키 (비밀! 서버에서만 사용)

## 3단계: 데이터베이스 테이블 생성

Supabase 대시보드에서 **SQL Editor**로 이동하여 다음 SQL을 실행하세요:

