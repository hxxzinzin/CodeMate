import { aiFailureResponse } from "@/lib/ai/http";
import { parseAuthedJson } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/response";
import { reviewRequestSchema } from "@/lib/coach/schema";
import { reviewCode } from "@/lib/coach/service";

export const maxDuration = 45;

/** AI 코드 리뷰 (의도 → 잘한 점 → 문제점 → 고쳐볼 방향 → 복잡도 → 엣지 케이스 → 더 나은 방법) */
export async function POST(request: Request) {
  const req = await parseAuthedJson(request, reviewRequestSchema, "로그인하면 AI 코드 리뷰를 받을 수 있어요.");
  if (!req.ok) return req.response;

  try {
    const result = await reviewCode(req.user.id, req.data);
    if (!result.ok) return fail(result.code, result.message);
    return ok({ content: result.content });
  } catch (error) {
    return aiFailureResponse(error, "api/ai/review");
  }
}
