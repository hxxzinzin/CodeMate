import { describe, expect, it, vi } from "vitest";
import { type CodeRunner, judgeCases, JudgeUnavailableError, type RunOutcome, type TestCase } from "./run-cases";

const ok = (stdout: string, timeSec = 0.1): RunOutcome => ({ kind: "ok", stdout, stderr: "", timeSec });

/** 입력 → 결과를 정해 둔 가짜 실행기. 호출된 입력을 기록한다. */
function fakeRunner(handler: (input: string) => RunOutcome) {
  const calls: string[] = [];
  const runner: CodeRunner = {
    run: vi.fn(async (_lang, _code, input: string) => {
      calls.push(input);
      return handler(input);
    }),
  };
  return { runner, calls };
}

// 입력 "a b" → 합을 출력하는 문제
const cases: TestCase[] = [
  { input: "1 2", expectedOutput: "3\n", isSample: true },
  { input: "2 2", expectedOutput: "4\n", isSample: true },
  { input: "10 5", expectedOutput: "15\n", isSample: false },
  { input: "0 0", expectedOutput: "0\n", isSample: false },
  { input: "7 8", expectedOutput: "15\n", isSample: false },
];
const sum = (input: string) => String(input.split(" ").map(Number).reduce((a, b) => a + b, 0));

describe("judgeCases", () => {
  it("모두 맞으면 AC, 가장 오래 걸린 시간 기록", async () => {
    const { runner } = fakeRunner((input) => ok(`${sum(input)}\n`, input === "7 8" ? 0.4 : 0.1));
    const r = await judgeCases(runner, "c", "code", cases);
    expect(r).toEqual({ result: "ac", summary: { passed: 5, total: 5, maxTimeSec: 0.4 } });
  });

  it("줄 끝 공백·마지막 빈 줄·CRLF 차이는 정답으로 본다", async () => {
    const { runner } = fakeRunner((input) => ok(`${sum(input)}  \r\n\r\n`));
    expect((await judgeCases(runner, "c", "code", cases)).result).toBe("ac");
  });

  it("예제에서 틀리면 WA와 함께 입력·기대·실제 출력을 보여준다", async () => {
    const { runner } = fakeRunner((input) => ok(input === "2 2" ? "5\n" : `${sum(input)}\n`));
    const r = await judgeCases(runner, "java", "code", cases);
    expect(r.result).toBe("wa");
    expect(r.summary.failed).toEqual({ number: 2, sample: true, input: "2 2", expected: "4\n", actual: "5\n" });
    expect(r.summary.passed).toBe(1);
  });

  it("숨김 테스트에서 틀리면 입력·기대 출력을 절대 보여주지 않는다", async () => {
    const { runner } = fakeRunner((input) => ok(input === "0 0" ? "1\n" : `${sum(input)}\n`));
    const r = await judgeCases(runner, "c", "code", cases);
    expect(r.result).toBe("wa");
    expect(r.summary.failed).toEqual({ number: 4, sample: false });
    expect(JSON.stringify(r.summary)).not.toContain("0 0");
  });

  it("컴파일 에러면 첫 테스트만 실행하고 멈춘다 (메시지 포함)", async () => {
    const { runner, calls } = fakeRunner(() => ({ kind: "compile_error", stdout: "", stderr: "main.c:3: error: expected ';'", timeSec: null }));
    const r = await judgeCases(runner, "c", "code", cases);
    expect(r.result).toBe("ce");
    expect(calls).toEqual(["1 2"]);
    expect(r.summary.message).toContain("expected ';'");
  });

  it("처음 틀린 묶음 이후는 실행하지 않는다 (호출 수 절약)", async () => {
    // 첫 테스트 단독 → [2,3,4]번 묶음에서 3번이 틀림 → 5번은 실행 안 함
    const { calls, runner } = fakeRunner((input) => ok(input === "10 5" ? "0\n" : `${sum(input)}\n`));
    const r = await judgeCases(runner, "c", "code", cases);
    expect(r.summary.failed?.number).toBe(3);
    expect(calls).not.toContain("7 8");
  });

  it("같은 묶음에서 여러 개가 틀리면 번호가 가장 앞선 테스트를 보고한다", async () => {
    const { runner } = fakeRunner((input) => ok(input === "1 2" ? "3\n" : "x\n"));
    expect((await judgeCases(runner, "c", "code", cases)).summary.failed?.number).toBe(2);
  });

  it("서비스가 시간 초과를 알리거나, 실행 시간이 언어별 제한을 넘으면 TLE", async () => {
    const timeout = fakeRunner(() => ({ kind: "timeout", stdout: "", stderr: "", timeSec: 30 }));
    expect((await judgeCases(timeout.runner, "java", "code", cases)).result).toBe("tle");

    const slowC = fakeRunner((input) => ok(`${sum(input)}\n`, 2.5));
    expect((await judgeCases(slowC.runner, "c", "code", cases)).result).toBe("tle");
    // 같은 2.5초라도 Java 제한(5초) 안이면 통과
    const slowJava = fakeRunner((input) => ok(`${sum(input)}\n`, 2.5));
    expect((await judgeCases(slowJava.runner, "java", "code", cases)).result).toBe("ac");
  });

  it("런타임 에러는 RE와 에러 메시지", async () => {
    const { runner } = fakeRunner(() => ({ kind: "runtime_error", stdout: "", stderr: "Exception in thread \"main\" java.lang.ArrayIndexOutOfBoundsException", timeSec: 0.2 }));
    const r = await judgeCases(runner, "java", "code", cases);
    expect(r.result).toBe("re");
    expect(r.summary.message).toContain("ArrayIndexOutOfBounds");
  });

  it("긴 메시지는 잘라서 보여준다", async () => {
    const { runner } = fakeRunner(() => ({ kind: "compile_error", stdout: "", stderr: "e".repeat(5000), timeSec: null }));
    const r = await judgeCases(runner, "c", "code", cases);
    expect(r.summary.message!.length).toBeLessThan(2100);
    expect(r.summary.message).toContain("(생략)");
  });

  it("실행 서비스의 입력 한도를 넘는 테스트는 실행하지 않고 건너뛴 수를 남긴다", async () => {
    const { runner: base, calls } = fakeRunner((input) => ok(`${sum(input)}\n`));
    const runner: CodeRunner = { run: base.run, maxInputBytes: 4 };
    // "1 2", "2 2", "0 0", "7 8"은 3바이트, "10 5"는 4바이트 → 모두 한도 안. 큰 입력 하나를 추가
    const big: TestCase = { input: "1 2 3", expectedOutput: "6\n", isSample: false };
    const r = await judgeCases(runner, "c", "code", [...cases, big]);
    expect(r).toEqual({ result: "ac", summary: { passed: 5, total: 5, maxTimeSec: 0.1, skipped: 1 } });
    expect(calls).not.toContain("1 2 3");
  });

  it("테스트케이스가 없으면 채점 불가 오류 (오답으로 기록하지 않음)", async () => {
    const { runner } = fakeRunner(() => ok(""));
    await expect(judgeCases(runner, "c", "code", [])).rejects.toBeInstanceOf(JudgeUnavailableError);
  });

  it("실행 서비스 오류는 그대로 전달한다 (오답으로 기록하지 않음)", async () => {
    const runner: CodeRunner = { run: async () => { throw new JudgeUnavailableError("busy", true); } };
    await expect(judgeCases(runner, "c", "code", cases)).rejects.toBeInstanceOf(JudgeUnavailableError);
  });
});
