import "server-only";
import type { ApiErrorCode } from "@/lib/api/response";
import { getProblemBySlug } from "@/lib/db/problems";
import { getSubmissionStats, insertSubmission, recordLearningEvent } from "@/lib/db/submissions";
import { getJudge } from "@/lib/judge/provider";
import type { SubmissionRequest } from "@/lib/submissions/schema";
import type { SubmissionResult } from "@/types/submission";

/** 같은 문제를 연속으로 제출할 수 있는 최소 간격 (실수로 여러 번 누르는 것 방지, 무료 DB 한도 보호) */
export const MIN_SUBMIT_INTERVAL_MS = 5_000;

export type SubmitOutcome =
  | { ok: true; submissionId: string; result: SubmissionResult; attemptCount: number }
  | { ok: false; code: ApiErrorCode; message: string };

/**
 * 제출 처리 순서
 * 1. 문제 확인 (공개 문제인지, 지원 언어인지) — 클라이언트가 보낸 값을 믿지 않고 DB로 다시 확인
 * 2. 연속 제출 제한
 * 3. 채점 (MVP: 자기 보고)
 * 4. 제출 저장 + 학습 이력 기록
 * 진도·streak·Skill 갱신은 #15, Phase 7에서 이 흐름에 추가한다.
 */
export async function submitSolution(userId: string, req: SubmissionRequest, now = Date.now()): Promise<SubmitOutcome> {
  const problem = await getProblemBySlug(req.slug);
  if (!problem) {
    return { ok: false, code: "NOT_FOUND", message: "문제를 찾을 수 없어요." };
  }
  if (!problem.languages.includes(req.language)) {
    return { ok: false, code: "UNSUPPORTED_LANGUAGE", message: "이 문제는 선택한 언어로 제출할 수 없어요." };
  }

  const stats = await getSubmissionStats(userId, problem.id);
  if (stats.lastSubmittedAt && now - new Date(stats.lastSubmittedAt).getTime() < MIN_SUBMIT_INTERVAL_MS) {
    return { ok: false, code: "TOO_MANY_REQUESTS", message: "조금 전에 제출했어요. 잠시 후 다시 시도해주세요." };
  }

  const judge = getJudge();
  const { result, detail } = await judge.judge({
    problemId: problem.id,
    language: req.language,
    code: req.code,
    selfReport: req.selfReport,
  });

  const attemptCount = stats.count + 1;
  const saved = await insertSubmission({
    userId,
    problemId: problem.id,
    language: req.language,
    code: req.code,
    result,
    attemptCount,
    judgeDetail: detail ? { judge: judge.name, ...detail } : { judge: judge.name },
  });

  await recordLearningEvent(userId, problem.id, "submission", {
    submissionId: saved.id,
    language: req.language,
    result,
  });

  return { ok: true, submissionId: saved.id, result, attemptCount };
}
