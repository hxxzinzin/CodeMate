import { readDemoId } from "@/lib/ai/demo";
import { AI_LIMITS } from "@/lib/ai/quota";
import { getTodayUsage } from "@/lib/ai/usage";
import { fail, ok } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth";

/** 오늘 AI 사용량 (화면의 "오늘 AI 3/20회" 표시용) */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (user) {
      const usage = await getTodayUsage({ userId: user.id });
      return ok({ used: usage.used, limit: usage.limit });
    }
    // Demo: 아직 AI를 쓴 적이 없으면 쿠키가 없으므로 0회로 본다.
    const demoId = await readDemoId();
    if (!demoId) return ok({ used: 0, limit: AI_LIMITS.perDemo });
    const usage = await getTodayUsage({ demoId });
    return ok({ used: usage.used, limit: usage.limit });
  } catch (error) {
    console.error("[api/ai/usage] failed", error);
    return fail("INTERNAL", "사용량을 불러오지 못했어요.");
  }
}
