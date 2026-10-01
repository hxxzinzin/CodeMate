import "server-only";
import { unstable_rethrow } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
};

/**
 * 현재 로그인한 사용자. 비로그인(Demo)이면 null.
 * getClaims()는 JWT 서명을 검증하므로 쿠키 값을 그대로 믿는 getSession()보다 안전하다.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data) return null;

    const { sub, email } = data.claims;
    return { id: sub, email: typeof email === "string" ? email : null };
  } catch (error) {
    // cookies() 등이 렌더링 방식 판단을 위해 던지는 Next.js 내부 에러는 삼키지 않고 다시 던진다.
    unstable_rethrow(error);
    // 환경변수 누락·네트워크 오류 시 비로그인으로 취급해 화면은 계속 보여준다. (헤더가 모든 페이지에 있음)
    console.error("[auth] getCurrentUser failed", error instanceof Error ? error.message : error);
    return null;
  }
}

/** 로그인 후 돌아갈 경로. 외부 사이트로 보내는 open redirect를 막기 위해 내부 경로만 허용한다. */
export function safeRedirectPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
