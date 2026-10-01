import "server-only";
import { type ApiErrorCode, fail } from "@/lib/api/response";
import { AiError, type AiErrorCode, aiErrorMessage } from "./gemini";
import { AiQuotaError } from "./usage";

const API_CODE: Record<AiErrorCode, ApiErrorCode> = {
  NOT_CONFIGURED: "SERVICE_UNAVAILABLE",
  UNAVAILABLE: "SERVICE_UNAVAILABLE",
  RATE_LIMITED: "TOO_MANY_REQUESTS",
  BLOCKED: "INVALID_INPUT",
  FAILED: "UPSTREAM_ERROR",
};

/** AI 호출 실패를 API 응답으로 바꾼다. AI 오류가 아니면 일반 서버 오류로 처리한다. */
export function aiFailureResponse(error: unknown, logTag: string) {
  if (error instanceof AiQuotaError) {
    return fail("TOO_MANY_REQUESTS", error.message);
  }
  if (error instanceof AiError) {
    console.error(`[${logTag}] ai error ${error.code}: ${error.message}`);
    return fail(API_CODE[error.code], aiErrorMessage(error.code));
  }
  console.error(`[${logTag}] failed`, error);
  return fail("INTERNAL", "요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.");
}
