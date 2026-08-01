import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * RLS를 우회하는 서비스 역할 클라이언트. 서버 전용 코드(route handler, server action)에서만
 * 사용하고 절대 클라이언트 번들에 노출하지 않는다.
 * - 공개 프로필(/u/[username]) 조회: 비공개 채널 값을 서버에서 제거한 뒤 클라이언트로 전달하기 위해 사용
 * - 방문 기록(exchanges) 저장: 익명 방문자도 기록을 남길 수 있어야 하므로 사용
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
