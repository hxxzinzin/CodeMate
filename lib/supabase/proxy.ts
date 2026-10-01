import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "./env";

/** 로그인이 필요한 경로. 문제 목록(/problems)은 Demo Mode로 공개한다. */
const PROTECTED_PATHS = ["/dashboard", "/progress", "/settings"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * 매 요청마다 세션 토큰을 확인하고, 만료가 가까우면 갱신해 응답 쿠키에 다시 쓴다.
 * 서버 컴포넌트는 쿠키를 쓸 수 없기 때문에 이 단계가 필요하다.
 * 로그인이 필요한 경로에 비로그인 사용자가 오면 /login으로 보낸다.
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
  const { data } = await supabase.auth.getClaims();

  if (!data && isProtected(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);

    // 갱신 과정에서 바뀐 쿠키(예: 만료 토큰 삭제)를 리다이렉트 응답에도 옮겨 담는다.
    const redirect = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}
