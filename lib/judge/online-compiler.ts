import { type CodeRunner, JudgeUnavailableError, type RunOutcome } from "./run-cases.ts";
import type { Language } from "@/types/problem";

/**
 * OnlineCompiler.io 실행기 (ADR-014).
 * 사용자 코드는 우리 서버가 아니라 이 서비스의 격리된 컨테이너(네트워크 차단)에서 실행된다.
 * API 키는 서버 전용 환경변수(ONLINECOMPILER_API_KEY)로만 받는다.
 */

const ENDPOINT = "https://api.onlinecompiler.io/api/run-code-sync/";

export const COMPILERS: Record<Language, string> = {
  java: "openjdk-25",
  c: "gcc-15",
};

/** 서비스의 실행 제한(30초) + 네트워크 여유 */
const REQUEST_TIMEOUT_MS = 40_000;
const TIMEOUT_EXIT_CODE = 124;

type ApiResponse = {
  output?: string;
  error?: string;
  status?: string;
  exit_code?: number | null;
  signal?: string | null;
  time?: string | number | null;
};

/** 컴파일러가 낸 에러인지 (런타임 에러와 구분). javac: "Main.java:3: error:", gcc: "main.c:3:5: error:", 링크 에러 */
export function looksLikeCompileError(language: Language, stderr: string): boolean {
  if (language === "java") return /\.java:\d+: error:/.test(stderr);
  return /:\d+:\d+: error:/.test(stderr) || /undefined reference to/.test(stderr);
}

export function toRunOutcome(language: Language, body: ApiResponse): RunOutcome {
  const stdout = body.output ?? "";
  const stderr = body.error ?? "";
  const parsed = body.time === null || body.time === undefined ? NaN : Number(body.time);
  const timeSec = Number.isFinite(parsed) ? parsed : null;
  const exitCode = body.exit_code ?? 0;

  if (exitCode === TIMEOUT_EXIT_CODE) return { kind: "timeout", stdout, stderr, timeSec };
  if (exitCode === 0 && !body.signal) return { kind: "ok", stdout, stderr, timeSec };
  if (looksLikeCompileError(language, stderr)) return { kind: "compile_error", stdout, stderr, timeSec };
  return { kind: "runtime_error", stdout, stderr, timeSec };
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
    async run(language, code, input) {
      let res = await call(language, code, input);
      // 동시 실행 한도(429)는 잠깐 기다렸다가 한 번만 다시 시도한다.
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, retryDelayMs));
        res = await call(language, code, input);
      }
      if (res.status === 429) throw new JudgeUnavailableError("채점 요청이 많아요.", true);
      // 이 서비스는 잘못된 키에 401이 아니라 404 {"error": "Invalid or inactive API key"}를 준다. (실제 호출로 확인)
      if (res.status === 401 || res.status === 403 || (res.status === 404 && /api key/i.test(await res.clone().text()))) {
        console.error("[judge] authentication failed", res.status);
        throw new JudgeUnavailableError("채점 서비스 설정에 문제가 있어요.", false);
      }
      if (!res.ok) {
        console.error("[judge] unexpected status", res.status);
        throw new JudgeUnavailableError("채점 서버에 문제가 있어요.", true);
      }
      return toRunOutcome(language, (await res.json()) as ApiResponse);
    },
  };
}
