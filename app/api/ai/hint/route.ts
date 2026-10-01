import { aiFailureResponse } from "@/lib/ai/http";
import { fail, isSameOrigin, ok } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth";
import { aiHintRequestSchema } from "@/lib/hints/schema";
import { getAiHint } from "@/lib/hints/service";
import { firstIssueMessage } from "@/lib/submissions/schema";

// Gemini 응답(기본 모델 + 예비 모델 재시도)을 기다릴 수 있도록 함수 실행 시간을 넉넉히 둔다.
export const maxDuration = 45;

/** 사용자 코드를 보고 주는 AI 힌트. 로그인 사용자만 사용할 수 있다. (Demo 체험은 #19에서 한도와 함께 추가) */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail("FORBIDDEN", "허용되지 않은 요청이에요.");

  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHORIZED", "로그인하면 내 코드에 맞춘 AI 힌트를 받을 수 있어요.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("INVALID_INPUT", "요청 형식이 올바르지 않아요.");
  }
  const parsed = aiHintRequestSchema.safeParse(body);
  if (!parsed.success) return fail("INVALID_INPUT", firstIssueMessage(parsed.error));

  try {
    const result = await getAiHint(user.id, parsed.data);
    if (!result.ok) return fail(result.code, result.message);
    return ok({ level: result.level, content: result.content });
  } catch (error) {
    return aiFailureResponse(error, "api/ai/hint");
  }
}
