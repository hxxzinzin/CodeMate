import { aiFailureResponse } from "@/lib/ai/http";
import { parseAuthedJson } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/response";
import { explainRequestSchema } from "@/lib/coach/schema";
import { explainConcept } from "@/lib/coach/service";

export const maxDuration = 45;

/** 개념 질문 ("스택이 뭐예요?"). 이 문제의 정답은 알려주지 않는다. */
export async function POST(request: Request) {
  const req = await parseAuthedJson(request, explainRequestSchema, "로그인하면 AI 코치에게 질문할 수 있어요.");
  if (!req.ok) return req.response;

  try {
    const result = await explainConcept(req.user.id, req.data);
    if (!result.ok) return fail(result.code, result.message);
    return ok({ content: result.content });
  } catch (error) {
    return aiFailureResponse(error, "api/ai/explain");
  }
}
