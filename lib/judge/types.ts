import type { Language } from "@/types/problem";
import type { JudgeSummary, SubmissionResult } from "@/types/submission";

/**
 * 채점기 추상화 (ADR-003, ADR-014).
 * 사용자 코드를 우리 서버에서 실행하지 않는다. 실제 실행은 외부 sandbox 구현체가 맡는다.
 */
export type JudgeRequest = {
  problemId: string;
  language: Language;
  code: string;
  /** 자동 채점을 쓰지 못할 때 사용자가 직접 확인한 결과 */
  selfReport?: "correct" | "wrong";
};

export type JudgeResult = {
  result: SubmissionResult;
  /** 자동 채점 요약 (submissions.judge_detail). 자기 보고면 null */
  summary: JudgeSummary | null;
};

export interface JudgeProvider {
  readonly name: string;
  judge(request: JudgeRequest): Promise<JudgeResult>;
}
