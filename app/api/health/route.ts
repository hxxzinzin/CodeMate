import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** 배포 후 DB 연결 확인용. 세부 오류는 서버 로그에만 남기고 응답에는 노출하지 않는다. */
export async function GET() {
  try {
    const supabase = await createClient();
    // 조회 요청은 기본적으로 자동 재시도되어, DB가 죽어 있으면 응답까지 수십 초가 걸린다.
    // 상태 확인은 빠르게 실패해야 하므로 재시도를 끄고 5초로 제한한다.
    const { error } = await supabase
      .from("problems")
      .select("id", { count: "exact", head: true })
      .retry(false)
      .abortSignal(AbortSignal.timeout(5000));
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[health] database check failed", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
