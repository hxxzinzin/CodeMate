import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Google 로그인 후 돌아오는 곳.
 * Supabase가 붙여 준 일회용 code를 세션(쿠키)으로 교환한다. (PKCE 흐름)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const flowId = searchParams.get("sb_flow_id");
    const { error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] code exchange failed", error.message);
  } else if (searchParams.get("error")) {
    // 사용자가 Google 동의 화면에서 취소한 경우 등
    console.error("[auth/callback] provider error", searchParams.get("error_description"));
  }

  return NextResponse.redirect(`${origin}/login?error=callback`);
}
