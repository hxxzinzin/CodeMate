import type { Language } from "./problem";
import type { SkillCategory } from "./skill";

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

/** 제출로 바뀐 Skill 점수 (before가 null이면 처음 측정) */
export type SkillChange = {
  category: SkillCategory;
  skill: string;
  before: number | null;
  after: number;
};

/** POST /api/submissions 성공 응답 (서버·클라이언트 공용) */
export type SubmitResponse = {
  /** 이번 제출로 갱신된 Skill. 갱신에 실패하면 빈 배열 */
  skillChanges: SkillChange[];
  submissionId: string;
  result: SubmissionResult;
  attemptCount: number;
  /** 이번 제출로 처음 해결했는지 */
  newlySolved: boolean;
  /** 갱신된 연속 학습일. 학습 상태 저장에 실패하면 null */
  streak: number | null;
};
