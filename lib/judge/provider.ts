import type { JudgeProvider, JudgeResult } from "./types";

/**
 * MVP 채점기: 코드를 실행하지 않고, 사용자가 예제로 확인한 결과를 그대로 기록한다.
 * 결과는 self_correct / self_wrong으로 저장해 실제 채점 결과(ac, wa ...)와 구분한다.
 */
export const selfReportJudge: JudgeProvider = {
  name: "self-report",
  async judge({ selfReport }): Promise<JudgeResult> {
    if (!selfReport) {
      return { result: "pending", detail: null };
    }
    return { result: selfReport === "correct" ? "self_correct" : "self_wrong", detail: null };
  },
};

/** 현재 사용하는 채점기. 외부 Judge를 연결하면 이 값만 바꾼다. (Phase 10) */
export function getJudge(): JudgeProvider {
  return selfReportJudge;
}
