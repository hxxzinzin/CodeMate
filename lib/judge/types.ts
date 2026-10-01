import type { Language } from "@/types/problem";
import type { SubmissionResult } from "@/types/submission";

/**
 * 채점기 추상화 (ADR-003).
 * 사용자 코드를 우리 서버에서 실행하지 않는다. 실제 실행은 외부 sandbox(Judge0, Piston 등) 구현체가 맡는다.
 */
export type JudgeRequest = {
  problemId: string;
  language: Language;
  code: string;
  /** Judge가 없을 때 사용자가 직접 확인한 결과 */
  selfReport?: "correct" | "wrong";
};

export type JudgeResult = {
  result: SubmissionResult;
  /** 실행 시간, 테스트케이스별 결과 등 (submissions.judge_detail) */
  detail: Record<string, unknown> | null;
};

export interface JudgeProvider {
  readonly name: string;
  judge(request: JudgeRequest): Promise<JudgeResult>;
}
