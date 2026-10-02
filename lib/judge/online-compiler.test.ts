import { describe, expect, it, vi } from "vitest";
import { createOnlineCompilerRunner, toRunOutcome } from "./online-compiler";
import { JudgeUnavailableError } from "./run-cases";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("toRunOutcome", () => {
  it("정상 실행", () => {
    expect(toRunOutcome("c", { output: "3\n", error: "", exit_code: 0, time: "0.0248" })).toEqual({
      kind: "ok",
      stdout: "3\n",
      stderr: "",
      timeSec: 0.0248,
    });
  });

  it("종료 코드 124는 시간 초과", () => {
    expect(toRunOutcome("java", { exit_code: 124, time: "30" }).kind).toBe("timeout");
  });

  it("javac·gcc 에러 형식은 컴파일 에러", () => {
    expect(toRunOutcome("java", { exit_code: 1, error: "Main.java:3: error: ';' expected" }).kind).toBe("compile_error");
    expect(toRunOutcome("c", { exit_code: 1, error: "main.c:4:12: error: expected ';' before 'return'" }).kind).toBe("compile_error");
    expect(toRunOutcome("c", { exit_code: 1, error: "undefined reference to `foo'" }).kind).toBe("compile_error");
  });

  it("실제 응답: 서비스가 주는 gcc 메시지 형식(파일명 없이 줄:칸)도 컴파일 에러", () => {
    const real = {
      output: "",
      error: "1:21: error: expected ';' before '}' token\n    1 | int main(){ return 0 }\n",
      status: "error",
      exit_code: 1,
      time: "0.0000",
    };
    expect(toRunOutcome("c", real).kind).toBe("compile_error");
  });

  it("실제 응답: 이유 없는 실패는 실행 에러, 서비스 내부 메시지는 보여주지 않는다", () => {
    const opaque = { output: "", error: "Internal error: code execution failed", status: "error", exit_code: -1, time: "0" };
    expect(toRunOutcome("java", opaque, 1900)).toEqual({ kind: "runtime_error", stdout: "", stderr: "", timeSec: 0 });
  });

  it("실제 응답: 이유 없는 실패가 30초 가까이 걸렸으면 시간 초과 (무한 루프)", () => {
    const opaque = { output: "", error: "Internal error: code execution failed", status: "error", exit_code: -1, time: "0" };
    expect(toRunOutcome("c", opaque, 30_600).kind).toBe("timeout");
  });

  it("그 밖의 비정상 종료·시그널은 런타임 에러", () => {
    expect(toRunOutcome("java", { exit_code: 1, error: 'Exception in thread "main" java.lang.NullPointerException' }).kind).toBe(
      "runtime_error",
    );
    expect(toRunOutcome("c", { exit_code: 139, signal: "SIGSEGV" }).kind).toBe("runtime_error");
  });

  it("시간 값이 없거나 이상하면 null", () => {
    expect(toRunOutcome("c", { exit_code: 0 }).timeSec).toBeNull();
    expect(toRunOutcome("c", { exit_code: 0, time: "abc" }).timeSec).toBeNull();
  });
});

describe("createOnlineCompilerRunner", () => {
  it("키는 헤더로, 언어는 컴파일러 이름으로 보낸다", async () => {
    const fetchImpl = vi.fn(async () => json(200, { output: "ok", exit_code: 0 }));
    await createOnlineCompilerRunner({ apiKey: "test-key", fetchImpl }).run("java", "code", "in");
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("test-key");
    expect(JSON.parse(init.body as string)).toEqual({ compiler: "openjdk-25", code: "code", input: "in" });
  });

  it("429면 한 번 다시 시도한다", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json(429, {}))
      .mockResolvedValueOnce(json(200, { output: "ok", exit_code: 0 }));
    const r = await createOnlineCompilerRunner({ apiKey: "k", fetchImpl, retryDelayMs: 0 }).run("c", "code", "");
    expect(r.kind).toBe("ok");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("두 번 다 429면 채점 불가 (다시 시도 가능)", async () => {
    const fetchImpl = vi.fn(async () => json(429, {}));
    const p = createOnlineCompilerRunner({ apiKey: "k", fetchImpl, retryDelayMs: 0 }).run("c", "code", "");
    await expect(p).rejects.toMatchObject({ name: "JudgeUnavailableError", retryable: true });
  });

  it("인증 실패는 다시 시도해도 소용없는 오류", async () => {
    const fetchImpl = vi.fn(async () => json(401, {}));
    const p = createOnlineCompilerRunner({ apiKey: "bad", fetchImpl }).run("c", "code", "");
    await expect(p).rejects.toMatchObject({ retryable: false });
  });

  it("이 서비스는 잘못된 키를 404로 알려준다 (실제 응답 형태)", async () => {
    const fetchImpl = vi.fn(async () => json(404, { error: "Invalid or inactive API key" }));
    const p = createOnlineCompilerRunner({ apiKey: "bad", fetchImpl }).run("c", "code", "");
    await expect(p).rejects.toMatchObject({ message: "채점 서비스 설정에 문제가 있어요.", retryable: false });
  });

  it("네트워크 오류·5xx는 채점 불가 (오답으로 기록하지 않음)", async () => {
    const down = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    await expect(createOnlineCompilerRunner({ apiKey: "k", fetchImpl: down }).run("c", "c", "")).rejects.toBeInstanceOf(
      JudgeUnavailableError,
    );
    const error = vi.fn(async () => json(502, {}));
    await expect(createOnlineCompilerRunner({ apiKey: "k", fetchImpl: error }).run("c", "c", "")).rejects.toBeInstanceOf(
      JudgeUnavailableError,
    );
  });
});
