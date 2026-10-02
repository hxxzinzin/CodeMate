import { type CodeRunner, JudgeUnavailableError, type RunOutcome } from "./run-cases.ts";
import type { Language } from "@/types/problem";

/**
 * OnlineCompiler.io 실행기 (ADR-014).
 * 사용자 코드는 우리 서버가 아니라 이 서비스의 격리된 컨테이너(네트워크 차단)에서 실행된다.
 * API 키는 서버 전용 환경변수(ONLINECOMPILER_API_KEY)로만 받는다.
 *
 * 실제 호출로 확인한 동작 (2026-10, npm run judge:smoke)
 * - 정상 종료(종료 코드 0)면 출력과 실행 시간을 정확히 준다. Java 클래스 이름은 Main이 아니어도 된다.
 * - C 컴파일 에러는 gcc 메시지를 준다. ("1:21: error: expected ';' ...")
 * - 그 밖의 비정상 종료(Java 컴파일 에러, 예외, 0으로 나누기, return 1, 30초 초과)는 모두
 *   { status: "error", exit_code: -1, error: "Internal error: code execution failed" }로 같다.
 *   → 30초 가까이 걸렸으면 시간 초과, 아니면 실행 에러로 본다.
 * - 입력이 100KB를 넘으면 400 "Input exceeds maximum size of 100KB" → 넘는 테스트는 실행하지 않는다.
 * - 잘못된 키는 401이 아니라 404 { error: "Invalid or inactive API key" }.
 */

const ENDPOINT = "https://api.onlinecompiler.io/api/run-code-sync/";

export const COMPILERS: Record<Language, string> = {
  java: "openjdk-25",
  c: "gcc-15",
};

/** 서비스의 실행 제한(30초) + 네트워크 여유 */
const REQUEST_TIMEOUT_MS = 40_000;
const TIMEOUT_EXIT_CODE = 124;
/** 이유를 알려주지 않는 실패가 이 시간 이상 걸렸으면 서비스의 30초 제한에 걸린 것으로 본다. */
const SERVICE_TIMEOUT_GUESS_MS = 25_000;
/** 서비스의 입력 크기 한도(100KB). 여유를 두고 1000 단위로 계산한다. */
export const MAX_INPUT_BYTES = 100_000;

type ApiResponse = {
  output?: string;
  error?: string;
  status?: string;
  exit_code?: number | null;
  signal?: string | null;
  time?: string | number | null;
};

/**
 * 컴파일러가 낸 에러인지. gcc: "1:21: error:" 또는 "main.c:3:5: error:", 링크 에러.
 * javac 형식("Main.java:3: error:")은 지금 서비스가 주지 않지만, 주게 되면 바로 인식하도록 둔다.
 */
export function looksLikeCompileError(language: Language, stderr: string): boolean {
  if (language === "java") return /\.java:\d+: error:/.test(stderr);
  return /(^|[\s:])\d+:\d+: error:/m.test(stderr) || /undefined reference to/.test(stderr);
}

/** @param elapsedMs 요청에 걸린 시간. 이유를 알려주지 않는 실패가 시간 초과인지 추정하는 데 쓴다. */
export function toRunOutcome(language: Language, body: ApiResponse, elapsedMs = 0): RunOutcome {
  const stdout = body.output ?? "";
  const stderr = body.error ?? "";
  const parsed = body.time === null || body.time === undefined ? NaN : Number(body.time);
  const timeSec = Number.isFinite(parsed) ? parsed : null;
  const exitCode = body.exit_code ?? 0;

  if (exitCode === 0 && !body.signal && body.status !== "error") return { kind: "ok", stdout, stderr, timeSec };
  if (looksLikeCompileError(language, stderr)) return { kind: "compile_error", stdout, stderr, timeSec };
  if (exitCode === TIMEOUT_EXIT_CODE || elapsedMs >= SERVICE_TIMEOUT_GUESS_MS) {
    return { kind: "timeout", stdout, stderr: "", timeSec };
  }
  // 서비스 내부 메시지("Internal error ...")는 사용자 코드의 에러 메시지가 아니므로 보여주지 않는다.
  const userMessage = /^Internal error/i.test(stderr) ? "" : stderr;
  return { kind: "runtime_error", stdout, stderr: userMessage, timeSec };
}

type Options = {
  apiKey: string;
  fetchImpl?: typeof fetch;
  /** 429일 때 다시 시도하기 전 대기 (테스트에서 0으로) */
  retryDelayMs?: number;
};

export function createOnlineCompilerRunner({ apiKey, fetchImpl = fetch, retryDelayMs = 1000 }: Options): CodeRunner {
  async function call(language: Language, code: string, input: string): Promise<Response> {
    try {
      return await fetchImpl(ENDPOINT, {
        method: "POST",
        headers: { Authorization: apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ compiler: COMPILERS[language], code, input }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      console.error("[judge] request failed", error);
      throw new JudgeUnavailableError("채점 서버에 연결하지 못했어요.", true);
    }
  }

  return {
    maxInputBytes: MAX_INPUT_BYTES,
    async run(language, code, input) {
      const started = Date.now();
      let res = await call(language, code, input);
      // 동시 실행 한도(429)는 잠깐 기다렸다가 한 번만 다시 시도한다.
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, retryDelayMs));
        res = await call(language, code, input);
      }
      if (res.status === 429) throw new JudgeUnavailableError("채점 요청이 많아요.", true);
      if (res.status === 401 || res.status === 403 || (res.status === 404 && /api key/i.test(await res.clone().text()))) {
        console.error("[judge] authentication failed", res.status);
        throw new JudgeUnavailableError("채점 서비스 설정에 문제가 있어요.", false);
      }
      if (!res.ok) {
        console.error("[judge] unexpected status", res.status, (await res.text()).slice(0, 200));
        throw new JudgeUnavailableError("채점 서버에 문제가 있어요.", true);
      }
      return toRunOutcome(language, (await res.json()) as ApiResponse, Date.now() - started);
    },
  };
}
