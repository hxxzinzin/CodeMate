import { outputsMatch } from "./compare.ts";
import type { Language } from "@/types/problem";
import type { JudgeSummary, SubmissionResult } from "@/types/submission";

/**
 * 테스트케이스 실행·판정 (외부 실행 서비스와 무관한 부분).
 * 실제 실행은 CodeRunner 구현체(online-compiler.ts)가 맡고, 테스트에서는 가짜 실행기를 넣는다.
 */

export type RunOutcome = {
  kind: "ok" | "compile_error" | "runtime_error" | "timeout";
  stdout: string;
  stderr: string;
  /** 실행 시간(초). 서비스가 알려주지 않으면 null */
  timeSec: number | null;
};

export interface CodeRunner {
  run(language: Language, code: string, input: string): Promise<RunOutcome>;
}

/** 실행 서비스 자체의 문제(한도 초과, 장애). 사용자 코드의 오답과 구분한다. */
export class JudgeUnavailableError extends Error {
  readonly retryable: boolean;
  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = "JudgeUnavailableError";
    this.retryable = retryable;
  }
}

export type TestCase = { input: string; expectedOutput: string; isSample: boolean };

export const JUDGE_CONFIG = {
  /** 테스트 하나의 시간 제한(초). Java는 JVM 시작 시간이 있어 더 넉넉하게 둔다. */
  timeLimitSec: { java: 5, c: 2 } as Record<Language, number>,
  /** 동시에 실행할 테스트 수 (실행 서비스의 동시 실행 한도보다 작게) */
  concurrency: 3,
  /** 화면에 보여줄 메시지·출력의 최대 길이 */
  maxMessageLength: 2000,
  maxSampleTextLength: 500,
} as const;

const truncate = (text: string, max: number) => (text.length > max ? `${text.slice(0, max)}\n… (생략)` : text);

type CaseVerdict = { result: Exclude<SubmissionResult, "pending" | "self_correct" | "self_wrong">; outcome: RunOutcome };

function verdictOf(language: Language, outcome: RunOutcome, expected: string): CaseVerdict["result"] {
  if (outcome.kind === "compile_error") return "ce";
  if (outcome.kind === "timeout") return "tle";
  if (outcome.timeSec !== null && outcome.timeSec > JUDGE_CONFIG.timeLimitSec[language]) return "tle";
  if (outcome.kind === "runtime_error") return "re";
  return outputsMatch(outcome.stdout, expected) ? "ac" : "wa";
}

/**
 * 테스트를 순서대로 실행하고, 처음 틀린 테스트에서 멈춘다. (실제 채점 사이트와 같은 방식, 호출 수 절약)
 * - 첫 테스트를 먼저 혼자 실행한다. 컴파일 에러면 나머지를 실행할 필요가 없다.
 * - 나머지는 concurrency개씩 묶어서 동시에 실행한다.
 */
export async function judgeCases(
  runner: CodeRunner,
  language: Language,
  code: string,
  cases: TestCase[],
): Promise<{ result: SubmissionResult; summary: JudgeSummary }> {
  if (cases.length === 0) throw new JudgeUnavailableError("채점할 테스트케이스가 없어요.", false);

  const verdicts: CaseVerdict[] = [];
  const batches = [cases.slice(0, 1)];
  for (let i = 1; i < cases.length; i += JUDGE_CONFIG.concurrency) {
    batches.push(cases.slice(i, i + JUDGE_CONFIG.concurrency));
  }

  for (const batch of batches) {
    const outcomes = await Promise.all(batch.map((tc) => runner.run(language, code, tc.input)));
    for (let j = 0; j < batch.length; j++) {
      verdicts.push({ result: verdictOf(language, outcomes[j], batch[j].expectedOutput), outcome: outcomes[j] });
    }
    if (verdicts.some((v) => v.result !== "ac")) break;
  }

  const times = verdicts.map((v) => v.outcome.timeSec).filter((t): t is number => t !== null);
  const maxTimeSec = times.length > 0 ? Math.max(...times) : null;
  const failedIndex = verdicts.findIndex((v) => v.result !== "ac");

  if (failedIndex === -1) {
    return { result: "ac", summary: { passed: cases.length, total: cases.length, maxTimeSec } };
  }

  const { result, outcome } = verdicts[failedIndex];
  const tc = cases[failedIndex];
  const summary: JudgeSummary = {
    passed: failedIndex,
    total: cases.length,
    maxTimeSec,
    failed: { number: failedIndex + 1, sample: tc.isSample },
  };
  // 숨김 테스트는 입력·기대 출력을 보여주지 않는다. (보여주면 그 값만 출력하는 코드로 통과할 수 있다)
  if (tc.isSample && result === "wa") {
    const max = JUDGE_CONFIG.maxSampleTextLength;
    summary.failed = {
      ...summary.failed!,
      input: truncate(tc.input, max),
      expected: truncate(tc.expectedOutput, max),
      actual: truncate(outcome.stdout, max),
    };
  }
  if ((result === "ce" || result === "re") && outcome.stderr.trim()) {
    summary.message = truncate(outcome.stderr.trim(), JUDGE_CONFIG.maxMessageLength);
  }
  return { result, summary };
}
