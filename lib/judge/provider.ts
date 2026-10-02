import "server-only";
import { getTestCases } from "@/lib/db/judge";
import { createOnlineCompilerRunner } from "@/lib/judge/online-compiler";
import { judgeCases } from "@/lib/judge/run-cases";
import type { JudgeProvider, JudgeResult } from "./types";

/**
 * 자기 보고 채점기: 코드를 실행하지 않고, 사용자가 예제로 확인한 결과를 그대로 기록한다.
 * 결과는 self_correct / self_wrong으로 저장해 실제 채점 결과(ac, wa ...)와 구분한다.
 * 자동 채점을 설정하지 않았거나, 채점 서버를 쓸 수 없을 때 사용한다.
 */
export const selfReportJudge: JudgeProvider = {
  name: "self-report",
  async judge({ selfReport }): Promise<JudgeResult> {
    if (!selfReport) return { result: "pending", summary: null };
    return { result: selfReport === "correct" ? "self_correct" : "self_wrong", summary: null };
  },
};

/** 자동 채점기: 예제 + 숨김 테스트를 외부 sandbox(OnlineCompiler.io)에서 실행한다. */
function onlineCompilerJudge(apiKey: string): JudgeProvider {
  const runner = createOnlineCompilerRunner({ apiKey });
  return {
    name: "onlinecompiler",
    async judge({ problemId, language, code }): Promise<JudgeResult> {
      const cases = await getTestCases(problemId);
      const { result, summary } = await judgeCases(runner, language, code, cases);
      return { result, summary };
    },
  };
}

/** 자동 채점 사용 여부. 서버 전용 키가 설정되어 있을 때만 켜진다. */
export function isAutoJudgeEnabled(): boolean {
  return Boolean(process.env.ONLINECOMPILER_API_KEY);
}

/** 현재 사용하는 채점기 */
export function getJudge(): JudgeProvider {
  const apiKey = process.env.ONLINECOMPILER_API_KEY;
  return apiKey ? onlineCompilerJudge(apiKey) : selfReportJudge;
}
