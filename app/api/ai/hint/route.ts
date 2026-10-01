import { getOrCreateDemoId } from "@/lib/ai/demo";
import { aiFailureResponse } from "@/lib/ai/http";
import { parseJson } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth";
import { aiHintRequestSchema } from "@/lib/hints/schema";
import { getAiHint } from "@/lib/hints/service";

// Gemini 응답(기본 모델 + 예비 모델 재시도)을 기다릴 수 있도록 함수 실행 시간을 넉넉히 둔다.
export const maxDuration = 45;

/**
 * 사용자 코드를 보고 주는 AI 힌트.
 * 로그인 사용자는 하루 한도 안에서, Demo 사용자는 체험 횟수(쿠키 기준) 안에서 쓸 수 있다.
 */
export async function POST(request: Request) {
  const req = await parseJson(request, aiHintRequestSchema);
  if (!req.ok) return req.response;

  try {
    const user = await getCurrentUser();
    const caller = user ? { userId: user.id } : { demoId: await getOrCreateDemoId() };
    const result = await getAiHint(caller, req.data);
    if (!result.ok) return fail(result.code, result.message);
    return ok({ level: result.level, content: result.content });
  } catch (error) {
    return aiFailureResponse(error, "api/ai/hint");
  }
}
