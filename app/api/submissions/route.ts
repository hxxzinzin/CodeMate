import { fail, isSameOrigin, ok } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth";
import { firstIssueMessage, submissionRequestSchema } from "@/lib/submissions/schema";
import { submitSolution, type SubmitData } from "@/lib/submissions/service";

/** 코드 제출. 로그인 사용자만 기록을 저장할 수 있다. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return fail("FORBIDDEN", "허용되지 않은 요청이에요.");
  }

  const user = await getCurrentUser();
  if (!user) {
    return fail("UNAUTHORIZED", "로그인하면 제출 기록을 저장할 수 있어요.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("INVALID_INPUT", "요청 형식이 올바르지 않아요.");
  }

  const parsed = submissionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return fail("INVALID_INPUT", firstIssueMessage(parsed.error));
  }

  try {
    const outcome = await submitSolution(user.id, parsed.data);
    if (!outcome.ok) return fail(outcome.code, outcome.message);
    const data: SubmitData = {
      submissionId: outcome.submissionId,
      result: outcome.result,
      attemptCount: outcome.attemptCount,
      newlySolved: outcome.newlySolved,
      streak: outcome.streak,
      skillChanges: outcome.skillChanges,
    };
    return ok(data, 201);
  } catch (error) {
    console.error("[api/submissions] failed", error);
    return fail("INTERNAL", "제출 기록을 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
  }
}
