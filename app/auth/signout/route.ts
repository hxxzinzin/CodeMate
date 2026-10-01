import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** 로그아웃. 상태를 바꾸는 요청이라 GET이 아닌 POST(form)로만 받는다. */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[auth/signout]", error.message);
  }
  // 303: POST 이후 GET으로 이동
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
