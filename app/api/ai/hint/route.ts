import { aiFailureResponse } from "@/lib/ai/http";
import { parseAuthedJson } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/response";
import { aiHintRequestSchema } from "@/lib/hints/schema";
import { getAiHint } from "@/lib/hints/service";

// Gemini 응답(기본 모델 + 예비 모델 재시도)을 기다릴 수 있도록 함수 실행 시간을 넉넉히 둔다.
export const maxDuration = 45;

/** 사용자 코드를 보고 주는 AI 힌트. 로그인 사용자만 사용할 수 있다. (Demo 체험은 #19에서 한도와 함께 추가) */
export async function POST(request: Request) {
  const req = await parseAuthedJson(request, aiHintRequestSchema, "로그인하면 내 코드에 맞춘 AI 힌트를 받을 수 있어요.");
  if (!req.ok) return req.response;

  try {
    const result = await getAiHint(req.user.id, req.data);
    if (!result.ok) return fail(result.code, result.message);
    return ok({ level: result.level, content: result.content });
  } catch (error) {
    return aiFailureResponse(error, "api/ai/hint");
  }
}
