# TapMe

NFC 탭이나 QR 코드로 연락처를 공유하는 디지털 명함 MVP. Next.js(App Router) + Supabase(Postgres, 매직링크 인증) 기반.

## 로컬 개발

```bash
npm install
npm run dev
```

`.env.local`에 아래 값이 채워져 있어야 정상 동작합니다 (`.env.local.example` 참고):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — 서버 전용, 절대 커밋/노출 금지
- `NEXT_PUBLIC_SITE_URL`

## 처음 배포하기 (Supabase → GitHub → Vercel)

### 1. Supabase 프로젝트 생성 + DB 스키마 적용

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성 (region은 Seoul 권장)
2. 좌측 메뉴 **SQL Editor** → New query → [`supabase/schema.sql`](supabase/schema.sql) 파일 내용을 전체 복사해 붙여넣고 **Run**
3. 다음 값을 복사해 `.env.local`에 붙여넣기
   - **Settings → Data API**의 `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - **Settings → API Keys**의 `Publishable key`(`sb_publishable_...`, 옛 이름 `anon key`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Settings → API Keys**의 `Secret key`(`sb_secret_...`, 옛 이름 `service_role key`, Reveal 클릭) → `SUPABASE_SERVICE_ROLE_KEY`
   - "Legacy API Keys" 탭에 있는 옛날 이름의 `anon`/`service_role` 키를 써도 동일하게 동작합니다.
4. **Authentication → URL Configuration**에서 Redirect URLs에 다음을 추가
   - `http://localhost:3000/auth/callback` (로컬 개발용)
   - 배포 후 Vercel 도메인의 `/auth/callback` 도 추가 (아래 5단계 참고)
5. **Authentication → Providers → Email**이 활성화되어 있는지 확인 (매직링크 로그인에 사용, 기본 활성화되어 있음)

### 2. GitHub에 올리기

이 폴더는 이미 git 저장소로 초기화되어 있고 첫 커밋도 완료된 상태입니다. GitHub에 새 저장소를 만든 뒤:

```bash
git remote add origin <새 저장소 URL>
git branch -M main
git push -u origin main
```

### 3. Vercel 배포

1. [vercel.com/new](https://vercel.com/new) 에서 방금 올린 GitHub 저장소 Import
2. Environment Variables에 `.env.local`과 동일한 4개 값 등록
3. Deploy
4. 배포된 도메인(`https://xxx.vercel.app`)이 생기면, Supabase **Authentication → URL Configuration → Redirect URLs**에 `https://xxx.vercel.app/auth/callback` 추가

## 프로젝트 구조

- `src/app/dashboard/*` — 로그인한 사용자의 카드 편집 / 행사 관리 / 공유 / 방문 기록
- `src/app/u/[username]` — 공개 프로필 페이지 (비로그인 접근 가능)
- `src/app/api/exchanges` — 방문자가 항목을 저장할 때 기록을 남기는 API
- `supabase/schema.sql` — DB 테이블 및 RLS 정책
