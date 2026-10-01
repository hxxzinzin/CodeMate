import type { Language } from "./problem";

/**
 * self_*: Judge 도입 전 사용자가 직접 확인한 결과 (ADR-003)
 * ac/wa/tle/re/ce: 실제 Judge 결과
 */
export type SubmissionResult =
  | "pending"
  | "self_correct"
  | "self_wrong"
  | "ac"
  | "wa"
  | "tle"
  | "re"
  | "ce";

export type Submission = {
  id: string;
  problemId: string;
  language: Language;
  result: SubmissionResult;
  solvingTimeSec: number;
  hintCount: number;
  attemptCount: number;
  solutionRevealed: boolean;
  createdAt: string;
};
