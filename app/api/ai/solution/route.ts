import { parseAuthedJson } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/response";
import { solutionRequestSchema } from "@/lib/coach/schema";
import { revealSolution } from "@/lib/coach/service";

/**
 * 정답 풀이 보기. 사용자가 명시적으로 확인(confirm: true)했을 때만 응답한다.
 * AI가 아닌, 테스트를 통과한 정답 코드와 작성된 해설을 돌려준다.
 */
export async function POST(request: Request) {
  const req = await parseAuthedJson(request, solutionRequestSchema, "로그인하면 정답 풀이를 볼 수 있어요.");
  if (!req.ok) return req.response;

  try {
    const result = await revealSolution(req.user.id, req.data);
    if (!result.ok) return fail(result.code, result.message);
    return ok({ explanation: result.explanation, code: result.code });
  } catch (error) {
    console.error("[api/ai/solution] failed", error);
    return fail("INTERNAL", "정답 풀이를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
  }
}
