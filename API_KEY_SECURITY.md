# 🔐 API 키 보안 가이드

## ✅ 현재 상태: 안전합니다!

Git 상태 확인 결과:
- ✅ `supabase_config.js` - Git에 추적되지 않음
- ✅ `supabase_client.js` - Git에 추적되지 않음
- ✅ `.gitignore`에 포함되어 있음

## 🛡️ Supabase `anon` 키는 공개되어도 안전합니다

### 왜 안전한가요?

1. **Row Level Security (RLS) 정책**
   - 데이터베이스에 RLS를 설정했으므로, 사용자는 자신의 데이터만 접근 가능
   - 다른 사용자의 데이터나 민감한 정보에 접근 불가

2. **제한된 권한**
   - `anon` 키는 읽기/쓰기 권한이 있지만, RLS 정책에 의해 제한됨
   - `service_role` 키와 달리 관리자 권한 없음

3. **Supabase의 설계**
   - Supabase는 클라이언트 측에서 `anon` 키를 사용하도록 설계됨
   - 공개 저장소에도 `anon` 키를 포함하는 것이 일반적

## 📋 보안 체크리스트

### ✅ 이미 완료된 것:
- [x] `.gitignore`에 API 키 파일 포함
- [x] RLS 정책 설정 완료 (`supabase_schema.sql`)
- [x] Git에 커밋되지 않음 확인

### ⚠️ 주의사항:

**절대 하지 말아야 할 것:**
1. ❌ `service_role` 키를 클라이언트 코드에 포함
2. ❌ API 키를 공개 저장소에 커밋 (현재는 안전함)
3. ❌ API 키를 스크린샷이나 공개 문서에 포함

**해도 되는 것:**
1. ✅ `anon` 키를 클라이언트 코드에 포함 (현재 상태)
2. ✅ `anon` 키를 공개 저장소에 커밋 (RLS가 설정되어 있다면)
3. ✅ 프론트엔드 코드에서 `anon` 키 사용

## 🔍 추가 확인 사항

### Git 히스토리 확인

만약 이전에 실수로 커밋했다면 확인하세요:

```bash
# Git 히스토리에서 API 키 파일 검색
git log --all --full-history -- supabase_config.js supabase_client.js
```

만약 결과가 나온다면 (이전에 커밋한 적이 있다면):
1. Supabase 대시보드에서 새 API 키 생성 (선택사항)
2. Git 히스토리에서 제거 (필요시)

### 현재 Git 상태 확인

```bash
git status
```

`supabase_config.js`와 `supabase_client.js`가 나타나지 않으면 정상입니다.

## 💡 결론

**현재 설정으로 충분히 안전합니다!**

- `anon` 키는 공개되어도 RLS로 보호됩니다
- `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다
- 추가 조치가 필요하지 않습니다

## 🚀 배포 시 주의사항

Vercel이나 다른 플랫폼에 배포할 때:

1. **환경 변수 사용 (선택사항)**
   - Vercel 대시보드 → Project Settings → Environment Variables
   - 하지만 정적 사이트에서는 결국 클라이언트 코드에 포함되어야 함
   - **실제로는 필요하지 않습니다**

2. **현재 방식 유지 (권장)**
   - `supabase_client.js`에 키 포함
   - RLS 정책으로 보호
   - 가장 간단하고 안전한 방법

## 📚 참고 자료

- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase API 키 보안](https://supabase.com/docs/guides/api/api-keys)
