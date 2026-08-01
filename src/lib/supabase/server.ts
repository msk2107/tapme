import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** 로그인한 사용자의 세션(쿠키) 기준으로 RLS가 적용되는 서버 클라이언트 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출된 경우 무시 — 세션 갱신은 middleware가 담당
          }
        },
      },
    }
  );
}
