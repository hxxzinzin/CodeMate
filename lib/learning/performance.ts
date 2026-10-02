import { isCorrectResult } from "@/lib/learning/progress";
import type { SubmissionResult } from "@/types/submission";

/**
 * 제출 한 번의 수행 점수 p (0 ~ 1.2).
 * Skill 점수(#20)와 추천 난이도 조정(#22)이 같은 기준을 쓴다.
 *
 *   맞힘 1.0 / 틀림 0
 *   + 시간: 예상의 절반 이하 +0.2, 예상 이하 0, 2배 이하 -0.15, 그 이상 -0.3 (맞혔을 때만)
 *   - 힌트 1개당 0.06, 의사코드(4단계)까지 봤으면 추가 0.1
 *   - 추가 시도 1회당 0.05 (최대 0.2)
 *   - AI 리뷰를 받았으면 0.05
 *   정답 풀이를 봤으면 최대 0.2
 */
export type PerformanceInput = {
  result: SubmissionResult;
  solvingTimeSec: number | null;
  estimatedMinutes: number;
  hintCount: number;
  maxHintLevel: number;
  attemptCount: number;
  aiReviewUsed: boolean;
  solutionRevealed: boolean;
};

export const MAX_PERFORMANCE = 1.2;

export function timeAdjustment(solvingTimeSec: number | null, estimatedMinutes: number): number {
  if (solvingTimeSec === null || estimatedMinutes <= 0) return 0;
  const ratio = solvingTimeSec / (estimatedMinutes * 60);
  if (ratio <= 0.5) return 0.2;
  if (ratio <= 1) return 0;
  if (ratio <= 2) return -0.15;
  return -0.3;
}

export function performanceScore(input: PerformanceInput): number {
  if (!isCorrectResult(input.result)) return 0;

  let p = 1;
  p += timeAdjustment(input.solvingTimeSec, input.estimatedMinutes);
  p -= 0.06 * Math.max(0, input.hintCount);
  if (input.maxHintLevel >= 4) p -= 0.1;
  p -= Math.min(0.2, 0.05 * Math.max(0, input.attemptCount - 1));
  if (input.aiReviewUsed) p -= 0.05;
  if (input.solutionRevealed) p = Math.min(p, 0.2);

  return round2(Math.min(MAX_PERFORMANCE, Math.max(0, p)));
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
