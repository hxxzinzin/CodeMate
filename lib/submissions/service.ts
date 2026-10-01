import "server-only";
import type { ApiErrorCode } from "@/lib/api/response";
import { getProgress, getStreakAndTimezone, saveProgress, saveStreak } from "@/lib/db/learning";
import { getHintEvents } from "@/lib/db/hints";
import { getProblemBySlug } from "@/lib/db/problems";
import { summarizeHintUsage } from "@/lib/hints/rules";
import { getCoachUsageSince, getSubmissionStats, insertSubmission, recordLearningEvent } from "@/lib/db/submissions";
import { getJudge } from "@/lib/judge/provider";
import { clampSolvingTime, isNewlySolved, nextProgress } from "@/lib/learning/progress";
import { localDate, nextStreak } from "@/lib/learning/streak";
import type { SubmissionRequest } from "@/lib/submissions/schema";
import type { SubmitResponse } from "@/types/submission";

/** 같은 문제를 연속으로 제출할 수 있는 최소 간격 (실수로 여러 번 누르는 것 방지, 무료 DB 한도 보호) */
export const MIN_SUBMIT_INTERVAL_MS = 5_000;

export type SubmitData = SubmitResponse;

export type SubmitOutcome = ({ ok: true } & SubmitData) | { ok: false; code: ApiErrorCode; message: string };

/**
 * 제출 처리 순서
 * 1. 문제 확인 (공개 문제인지, 지원 언어인지) — 클라이언트가 보낸 값을 믿지 않고 DB로 다시 확인
 * 2. 연속 제출 제한
 * 3. 채점 (MVP: 자기 보고)
 * 4. 제출 저장 + 학습 이력 기록
 * 5. 문제 진도, 연속 학습일 갱신
 * Skill 갱신은 Phase 7에서 이 흐름에 추가한다.
 */
export async function submitSolution(userId: string, req: SubmissionRequest, now = new Date()): Promise<SubmitOutcome> {
  const problem = await getProblemBySlug(req.slug);
  if (!problem) {
    return { ok: false, code: "NOT_FOUND", message: "문제를 찾을 수 없어요." };
  }
  if (!problem.languages.includes(req.language)) {
    return { ok: false, code: "UNSUPPORTED_LANGUAGE", message: "이 문제는 선택한 언어로 제출할 수 없어요." };
  }

  const stats = await getSubmissionStats(userId, problem.id);
  if (stats.lastSubmittedAt && now.getTime() - new Date(stats.lastSubmittedAt).getTime() < MIN_SUBMIT_INTERVAL_MS) {
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
  // 직전 제출 이후 본 힌트만 이번 시도에 포함한다. (난이도 조정에 사용)
  const [hintEvents, coachUsage] = await Promise.all([
    getHintEvents(userId, problem.id, stats.lastSubmittedAt),
    getCoachUsageSince(userId, problem.id, stats.lastSubmittedAt),
  ]);
  const hintUsage = summarizeHintUsage(hintEvents.map((e) => e.level));
  const saved = await insertSubmission({
    userId,
    problemId: problem.id,
    language: req.language,
    code: req.code,
    result,
    attemptCount,
    solvingTimeSec: clampSolvingTime(req.solvingTimeSec, problem.estimatedMinutes),
    hintCount: hintUsage.hintCount,
    maxHintLevel: hintUsage.maxHintLevel,
    aiReviewUsed: coachUsage.aiReviewUsed,
    solutionRevealed: coachUsage.solutionRevealed,
    judgeDetail: detail ? { judge: judge.name, ...detail } : { judge: judge.name },
  });

  await recordLearningEvent(userId, problem.id, "submission", {
    submissionId: saved.id,
    language: req.language,
    result,
  });

  // 진도·streak는 제출 기록이 저장된 뒤 갱신한다.
  // 여기서 실패해도 제출 자체는 이미 저장되었으므로 오류로 응답하지 않고 로그만 남긴다.
  let newlySolved = false;
  let streak: number | null = null;
  try {
    const prevProgress = await getProgress(userId, problem.id);
    const progress = nextProgress(prevProgress, result, now);
    await saveProgress(userId, problem.id, progress);
    newlySolved = isNewlySolved(prevProgress, progress);
    if (newlySolved) {
      await recordLearningEvent(userId, problem.id, "solve", { submissionId: saved.id });
    }

    const { streak: prevStreak, timezone } = await getStreakAndTimezone(userId);
    const updated = nextStreak(prevStreak, localDate(now, timezone));
    if (updated !== prevStreak) await saveStreak(userId, updated);
    streak = updated.streak;
  } catch (error) {
    console.error("[submissions] learning state update failed", error);
  }

  return { ok: true, submissionId: saved.id, result, attemptCount, newlySolved, streak };
}
