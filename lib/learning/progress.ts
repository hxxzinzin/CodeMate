import type { SubmissionResult } from "@/types/submission";

/** 정답으로 인정하는 결과 (자기 보고 정답 + 실제 채점 정답) */
export function isCorrectResult(result: SubmissionResult): boolean {
  return result === "self_correct" || result === "ac";
}

/** 처음 해결한 뒤 복습을 권할 시점. 추천 로직(Phase 8)에서 다시 조정한다. */
export const FIRST_REVIEW_AFTER_DAYS = 7;

export type ProgressState = {
  status: "attempted" | "solved";
  attempts: number;
  firstSolvedAt: string | null;
  lastAttemptAt: string;
  nextReviewAt: string | null;
};

/**
 * 제출 한 번이 반영된 문제 진도.
 * - 한 번이라도 맞히면 solved를 유지한다. (나중에 틀려도 "해결한 문제"에서 빠지지 않음)
 * - 처음 맞힌 순간에만 firstSolvedAt과 복습 예정일을 정한다.
 */
export function nextProgress(prev: ProgressState | null, result: SubmissionResult, now: Date): ProgressState {
  const correct = isCorrectResult(result);
  const nowIso = now.toISOString();
  const newlySolved = correct && !prev?.firstSolvedAt;

  return {
    status: correct || prev?.status === "solved" ? "solved" : "attempted",
    attempts: (prev?.attempts ?? 0) + 1,
    firstSolvedAt: newlySolved ? nowIso : (prev?.firstSolvedAt ?? null),
    lastAttemptAt: nowIso,
    nextReviewAt: newlySolved
      ? new Date(now.getTime() + FIRST_REVIEW_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString()
      : (prev?.nextReviewAt ?? null),
  };
}

/** 이번 제출로 처음 해결했는지 (학습 이력 solve 이벤트용) */
export function isNewlySolved(prev: ProgressState | null, next: ProgressState): boolean {
  return !prev?.firstSolvedAt && next.firstSolvedAt !== null;
}

/**
 * 클라이언트가 보낸 풀이 시간은 그대로 믿지 않는다.
 * 음수·비정상 값은 버리고, 예상 시간의 3배를 상한으로 둔다. (자리를 비운 시간이 과도하게 반영되는 것 방지)
 */
export function clampSolvingTime(seconds: number | undefined, estimatedMinutes: number): number | null {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds < 0) return null;
  const cap = estimatedMinutes * 60 * 3;
  return Math.min(Math.round(seconds), cap);
}
