import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "./env";

/**
 * 매 요청마다 세션 토큰을 확인하고, 만료가 가까우면 갱신해 응답 쿠키에 다시 쓴다.
 * 서버 컴포넌트는 쿠키를 쓸 수 없기 때문에 이 단계가 필요하다.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  let env: ReturnType<typeof getSupabasePublicEnv>;
  try {
    env = getSupabasePublicEnv();
  } catch (error) {
    // 환경변수가 없어도 DB를 쓰지 않는 페이지는 열려야 하므로 세션 갱신만 건너뛴다.
    console.error("[proxy]", error instanceof Error ? error.message : error);
    return response;
  }
  const { url, publishableKey } = env;

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // 갱신된 토큰을 이후 렌더링(request)과 브라우저(response) 양쪽에 반영한다.
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // 토큰이 담긴 응답이 CDN에 캐시되지 않도록 하는 헤더
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // 이 호출 사이에 다른 코드를 넣지 않는다. 토큰 검증·갱신이 여기서 일어난다.
  await supabase.auth.getClaims();

  return response;
}
