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
  // cookies()를 먼저 호출해야 이 클라이언트를 쓰는 페이지가 항상 "요청마다 렌더링(dynamic)"으로 분류된다.
  // 순서가 반대면 빌드 시 환경변수가 없을 때 예외가 먼저 나서, 로그인 상태가 고정된 정적 페이지가 만들어진다.
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabasePublicEnv();

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
