import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabasePublicEnv } from "./env";

/**
 * 서버 컴포넌트, Route Handler, Server Action용.
 * 요청한 사용자의 세션(쿠키)으로 동작하므로 RLS가 그대로 적용된다.
 * 요청마다 새로 만들어야 한다. (사용자 간에 클라이언트를 공유하면 안 됨)
 */
export async function createClient() {
  const { url, publishableKey } = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없다.
          // 토큰 갱신은 proxy.ts가 매 요청마다 처리하므로 여기서는 무시해도 된다.
        }
      },
    },
  });
}
