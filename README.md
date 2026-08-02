# TapMe

A digital business card MVP — share your contact info via NFC tap or QR code. Built with Next.js (App Router) + Supabase (Postgres, magic-link auth).

## Local development

```bash
npm install
npm run dev
```

`.env.local` needs these values filled in (see `.env.local.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, never commit or expose this

## First-time deploy (Supabase → GitHub → Vercel)

### 1. Create a Supabase project + apply the DB schema

1. Create a new project at [supabase.com](https://supabase.com)
2. Left sidebar **SQL Editor** → New query → paste the full contents of [`supabase/schema.sql`](supabase/schema.sql) and **Run**
3. Copy these values into `.env.local`:
   - **Settings → Data API** → `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - **Settings → API Keys** → `Publishable key` (`sb_publishable_...`, formerly `anon key`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Settings → API Keys** → `Secret key` (`sb_secret_...`, formerly `service_role key`, click Reveal) → `SUPABASE_SERVICE_ROLE_KEY`
   - The old-style `anon`/`service_role` keys under the "Legacy API Keys" tab work the same if that's what you see.
4. **Authentication → URL Configuration** → add to Redirect URLs:
   - `http://localhost:3000/auth/callback` (local dev)
   - your Vercel domain's `/auth/callback` once deployed (see step 4 below)
5. Confirm **Authentication → Providers → Email** is enabled (used for magic-link login, on by default)

### 2. Push to GitHub

Create a new empty repo on GitHub, then:

```bash
git remote add origin <your repo URL>
git branch -M main
git push -u origin main
```

### 3. Deploy on Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Add the same 3 environment variables as `.env.local`
3. Deploy
4. Once you have a domain (`https://xxx.vercel.app`), add `https://xxx.vercel.app/auth/callback` to Supabase's **Authentication → URL Configuration → Redirect URLs**

## Project structure

- `src/app/dashboard/*` — the logged-in user's card editor / event management / share / visit history
- `src/app/u/[username]` — public profile page (no login required)
- `src/app/api/exchanges` — logs a visit whenever someone saves items from a public profile
- `supabase/schema.sql` — DB tables and RLS policies
