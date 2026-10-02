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

  const solved = correct || prev?.status === "solved";
  // 정답을 보고 넘어간 문제(다시 풀기 예정)를 또 틀리면, 매일 다시 나오지 않도록 다시 RETRY_AFTER_DAYS 뒤로 미룬다.
  const retryAgain = !solved && prev?.nextReviewAt != null;
  // 이미 푼 문제를 복습 예정일 이후에 다시 풀었으면(복습 완료) 다음 복습을 더 멀리 잡는다.
  const reviewed = prev?.status === "solved" && prev.nextReviewAt != null && new Date(prev.nextReviewAt) <= now;

  return {
    status: solved ? "solved" : "attempted",
    attempts: (prev?.attempts ?? 0) + 1,
    firstSolvedAt: newlySolved ? nowIso : (prev?.firstSolvedAt ?? null),
    lastAttemptAt: nowIso,
    nextReviewAt: newlySolved
      ? daysLater(now, FIRST_REVIEW_AFTER_DAYS)
      : retryAgain
        ? daysLater(now, RETRY_AFTER_REVEAL_DAYS)
        : reviewed
          ? daysLater(now, NEXT_REVIEW_AFTER_DAYS)
          : (prev?.nextReviewAt ?? null),
  };
}

/** 못 푼 문제의 정답을 본 뒤 스스로 다시 풀어보게 할 시점 */
export const RETRY_AFTER_REVEAL_DAYS = 3;
/** 복습을 마친 뒤 다음 복습까지 (간격을 늘려 가는 간격 반복) */
export const NEXT_REVIEW_AFTER_DAYS = 14;

const daysLater = (now: Date, days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

/**
 * 정답 풀이를 본 뒤의 진도. 아직 못 푼 문제는 RETRY_AFTER_REVEAL_DAYS 뒤에 "다시 풀기"로 추천되게 한다.
 * (정답만 보고 끝나면 영원히 못 푼 문제로 남기 때문)
 * 이미 푼 문제면 바꾸지 않는다(null). 제출하지 않은 문제여도 진도 행을 만든다(attempts 0).
 */
export function progressAfterReveal(prev: ProgressState | null, now: Date): ProgressState | null {
  if (prev?.status === "solved") return null;
  return {
    status: "attempted",
    attempts: prev?.attempts ?? 0,
    firstSolvedAt: null,
    lastAttemptAt: prev?.lastAttemptAt ?? now.toISOString(),
    nextReviewAt: daysLater(now, RETRY_AFTER_REVEAL_DAYS),
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
