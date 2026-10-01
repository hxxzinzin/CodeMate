import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth";
import type { HintLevel } from "@/lib/hints/rules";
import { staticHintQuerySchema } from "@/lib/hints/schema";
import { getStaticHintFor } from "@/lib/hints/service";
import { firstIssueMessage } from "@/lib/submissions/schema";

/** 미리 작성된 단계별 힌트. AI를 호출하지 않는다. (GET이므로 상태를 바꾸는 부작용은 이력 기록뿐) */
export async function GET(request: NextRequest) {
  const parsed = staticHintQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return fail("INVALID_INPUT", firstIssueMessage(parsed.error));

  try {
    const user = await getCurrentUser();
    const result = await getStaticHintFor(user?.id ?? null, parsed.data.slug, parsed.data.level as HintLevel);
    if (!result.ok) return fail(result.code, result.message);
    return ok({ level: result.level, content: result.content });
  } catch (error) {
    console.error("[api/hints] failed", error);
    return fail("INTERNAL", "힌트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
  }
}
