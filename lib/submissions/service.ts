import "server-only";
import type { ApiErrorCode } from "@/lib/api/response";
import {
  getCurrentDifficulty,
  getProgress,
  getStreakAndTimezone,
  saveCurrentDifficulty,
  saveProgress,
  saveStreak,
} from "@/lib/db/learning";
import { getHintEvents } from "@/lib/db/hints";
import { getProblemBySlug } from "@/lib/db/problems";
import { summarizeHintUsage } from "@/lib/hints/rules";
import { getCoachUsageSince, getSubmissionStats, insertSubmission, recordLearningEvent } from "@/lib/db/submissions";
import { skillSkipReason } from "@/lib/judge/measurable";
import { getJudge, selfReportJudge } from "@/lib/judge/provider";
import { JudgeUnavailableError } from "@/lib/judge/run-cases";
import type { JudgeResult } from "@/lib/judge/types";
import { performanceScore, type PerformanceInput } from "@/lib/learning/performance";
import { clampSolvingTime, isNewlySolved, nextProgress } from "@/lib/learning/progress";
import { localDate, nextStreak } from "@/lib/learning/streak";
import { nextDifficulty, shouldAdjustDifficulty } from "@/lib/recommendation/difficulty";
import { applySubmissionToSkills } from "@/lib/skills/service";
import type { SubmissionRequest } from "@/lib/submissions/schema";
import type { SkillChange, SubmitResponse } from "@/types/submission";

/** 같은 문제를 연속으로 제출할 수 있는 최소 간격 (실수로 여러 번 누르는 것 방지, 무료 DB 한도 보호) */
export const MIN_SUBMIT_INTERVAL_MS = 5_000;

export type SubmitData = SubmitResponse;

export type SubmitOutcome = ({ ok: true } & SubmitData) | { ok: false; code: ApiErrorCode; message: string };

/**
 * 제출 처리 순서
 * 1. 문제 확인 (공개 문제인지, 지원 언어인지) — 클라이언트가 보낸 값을 믿지 않고 DB로 다시 확인
 * 2. 연속 제출 제한
 * 3. 채점 (자동 채점 또는 자기 보고). 채점 서버 문제면 저장하지 않고 안내
 * 4. 제출 저장 + 학습 이력 기록
 * 5. 문제 진도, 연속 학습일 갱신
 * 6. Skill, 추천 난이도 (컴파일 에러는 제외)
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

  // 사용자가 직접 확인한 결과를 보냈으면 자기 보고로 기록한다. (자동 채점이 없거나 쓸 수 없을 때)
  const judge = req.selfReport ? selfReportJudge : getJudge();
  if (judge === selfReportJudge && !req.selfReport) {
    return { ok: false, code: "INVALID_INPUT", message: "결과(맞았어요/틀렸어요)를 선택해주세요." };
  }
  let judged: JudgeResult;
  try {
    judged = await judge.judge({ problemId: problem.id, language: req.language, code: req.code, selfReport: req.selfReport });
  } catch (error) {
    // 채점 서버 문제는 사용자의 오답이 아니므로 제출을 저장하지 않는다.
    if (error instanceof JudgeUnavailableError) {
      console.error("[submissions] judge unavailable", error.message);
      return {
        ok: false,
        code: "SERVICE_UNAVAILABLE",
        message: `${error.message} 잠시 후 다시 채점하거나, 예제로 직접 확인한 결과로 제출할 수 있어요.`,
      };
    }
    throw error;
  }
  const { result, summary } = judged;
  // 컴파일 에러(또는 그럴 가능성이 큰 실패)는 알고리즘 실력의 근거가 아니다. Skill·난이도에는 반영하지 않는다.
  const measurable = skillSkipReason(result, req.language, summary) === null;

  const attemptCount = stats.count + 1;
  // 직전 제출 이후 본 힌트만 이번 시도에 포함한다. (난이도 조정에 사용)
  const [hintEvents, coachUsage] = await Promise.all([
    getHintEvents(userId, problem.id, stats.lastSubmittedAt),
    getCoachUsageSince(userId, problem.id, stats.lastSubmittedAt),
  ]);
  const hintUsage = summarizeHintUsage(hintEvents.map((e) => e.level));
  const solvingTimeSec = clampSolvingTime(req.solvingTimeSec, problem.estimatedMinutes);
  // Skill 점수와 난이도 조정이 같은 기준을 쓰도록 수행 점수 입력을 한 번만 만든다.
  const performanceInput: PerformanceInput = {
    result,
    solvingTimeSec,
    estimatedMinutes: problem.estimatedMinutes,
    hintCount: hintUsage.hintCount,
    maxHintLevel: hintUsage.maxHintLevel,
    attemptCount,
    aiReviewUsed: coachUsage.aiReviewUsed,
    solutionRevealed: coachUsage.solutionRevealed,
  };

  const saved = await insertSubmission({
    userId,
    problemId: problem.id,
    language: req.language,
    code: req.code,
    result,
    attemptCount,
    solvingTimeSec,
    hintCount: hintUsage.hintCount,
    maxHintLevel: hintUsage.maxHintLevel,
    aiReviewUsed: coachUsage.aiReviewUsed,
    solutionRevealed: coachUsage.solutionRevealed,
    judgeDetail: summary ? { judge: judge.name, ...summary } : { judge: judge.name },
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

  // Skill 갱신도 별도로 처리한다. 실패해도 제출·진도·streak는 유지된다.
  let skillChanges: SkillChange[] = [];
  if (measurable) {
    try {
      ({ changes: skillChanges } = await applySubmissionToSkills({
        userId,
        tags: problem.tags,
        language: req.language,
        difficulty: problem.difficulty,
        performanceInput,
        now,
      }));
    } catch (error) {
      console.error("[submissions] skill update failed", error);
    }
  }

  // 추천 난이도: 그 문제의 첫 제출이거나 처음 해결했을 때만 조정한다. (재시도·복습으로 흔들리지 않게)
  let difficultyChange: SubmitResponse["difficultyChange"] = null;
  if (measurable && shouldAdjustDifficulty(attemptCount, newlySolved)) {
    try {
      const before = await getCurrentDifficulty(userId);
      const after = nextDifficulty(before, problem.difficulty, performanceScore(performanceInput));
      if (after !== before) await saveCurrentDifficulty(userId, after);
      difficultyChange = { before, after };
    } catch (error) {
      console.error("[submissions] difficulty update failed", error);
    }
  }

  // 학습 현황의 성장 그래프는 이 기록으로 그린다. (user_skills에는 현재 점수만 있으므로 변화량을 여기 남긴다)
  await recordLearningEvent(userId, problem.id, "submission", {
    submissionId: saved.id,
    language: req.language,
    result,
    difficulty: problem.difficulty,
    performance: performanceScore(performanceInput),
    skillChanges,
    difficultyChange,
  });

  return {
    ok: true,
    submissionId: saved.id,
    result,
    attemptCount,
    newlySolved,
    streak,
    skillChanges,
    difficultyChange,
    judge: summary,
  };
}
