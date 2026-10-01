import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabasePublicEnv } from "./env";

/**
 * service_role(secret key) 클라이언트 — RLS를 우회한다.
 * 사용 범위를 힌트·해설 조회, AI 사용 기록 저장으로 제한한다. (ADR-002)
 * "server-only" 때문에 클라이언트 컴포넌트에서 import하면 빌드가 실패한다.
 */
export function createAdminClient() {
  const { url } = getSupabasePublicEnv();
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY가 없습니다. 서버 환경변수로만 설정하세요.");
  }

  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
