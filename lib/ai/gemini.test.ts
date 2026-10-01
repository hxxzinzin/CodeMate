import { describe, expect, it, vi } from "vitest";
import { AiError, aiErrorMessage, generateText, type GeminiDeps, modelChain } from "./gemini";

const options = { system: "s", prompt: "p", maxOutputTokens: 100 };

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const okBody = (text: string, finishReason = "STOP") => ({
  candidates: [{ content: { parts: [{ text }] }, finishReason }],
  usageMetadata: { promptTokenCount: 12, candidatesTokenCount: 34 },
});

/** 호출 순서대로 응답을 돌려주는 가짜 fetch. 어떤 모델 주소로 요청했는지 기록한다. */
function fakeFetch(...responses: (Response | Error)[]) {
  const urls: string[] = [];
  const fn = vi.fn(async (url: string | URL | Request) => {
    urls.push(String(url));
    const next = responses.shift();
    if (!next) throw new Error("no more responses");
    if (next instanceof Error) throw next;
    return next;
  });
  return { fetch: fn as unknown as typeof fetch, urls };
}

const env = { GEMINI_API_KEY: "test-key", GEMINI_MODEL: "primary", GEMINI_FALLBACK_MODEL: "backup" };
const deps = (f: { fetch: typeof fetch }, e: GeminiDeps["env"] = env): GeminiDeps => ({ fetch: f.fetch, env: e });

async function errorCode(promise: Promise<unknown>) {
  try {
    await promise;
    return "no error";
  } catch (e) {
    return e instanceof AiError ? e.code : `unexpected: ${String(e)}`;
  }
}

describe("generateText", () => {
  it("성공하면 텍스트와 사용 토큰을 돌려준다", async () => {
    const f = fakeFetch(json(200, okBody("  스택을 떠올려 보세요  ")));
    const r = await generateText(options, deps(f));
    expect(r).toEqual({ text: "스택을 떠올려 보세요", model: "primary", tokensIn: 12, tokensOut: 34, truncated: false });
    expect(f.urls[0]).toContain("/primary:generateContent");
  });

  it("API 키를 URL이 아닌 헤더로 보내고, 생각 수준을 최소로 요청한다", async () => {
    const f = fakeFetch(json(200, okBody("ok")));
    await generateText(options, deps(f));
    const [url, init] = (f.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).not.toContain("test-key");
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("test-key");
    expect(JSON.parse(init.body as string).generationConfig.thinkingConfig).toEqual({ thinkingLevel: "minimal" });
  });

  it("키가 없으면 호출하지 않고 NOT_CONFIGURED", async () => {
    const f = fakeFetch();
    expect(await errorCode(generateText(options, deps(f, { GEMINI_API_KEY: " " })))).toBe("NOT_CONFIGURED");
    expect(f.urls).toHaveLength(0);
  });

  it.each([
    [503, "과부하"],
    [429, "한도 초과"],
    [500, "서버 오류"],
  ])("기본 모델이 %i(%s)이면 예비 모델로 다시 시도한다", async (status) => {
    const f = fakeFetch(json(status, {}), json(200, okBody("예비 모델 답변")));
    const r = await generateText(options, deps(f));
    expect(r.model).toBe("backup");
    expect(f.urls[1]).toContain("/backup:generateContent");
  });

  it("네트워크 오류·시간 초과도 예비 모델로 넘어간다", async () => {
    const f = fakeFetch(new DOMException("timeout", "TimeoutError"), json(200, okBody("ok")));
    expect((await generateText(options, deps(f))).model).toBe("backup");
  });

  it("모든 모델이 한도 초과면 RATE_LIMITED, 과부하로 끝나면 UNAVAILABLE", async () => {
    expect(await errorCode(generateText(options, deps(fakeFetch(json(503, {}), json(429, {})))))).toBe("RATE_LIMITED");
    expect(await errorCode(generateText(options, deps(fakeFetch(json(429, {}), json(503, {})))))).toBe("UNAVAILABLE");
  });

  it("키 오류(403) 같은 4xx는 다른 모델로 바꿔도 같으므로 바로 FAILED", async () => {
    const f = fakeFetch(json(403, { error: { message: "API key not valid" } }));
    expect(await errorCode(generateText(options, deps(f)))).toBe("FAILED");
    expect(f.urls).toHaveLength(1);
  });

  it("안전 필터로 차단되면 BLOCKED", async () => {
    expect(await errorCode(generateText(options, deps(fakeFetch(json(200, { promptFeedback: { blockReason: "SAFETY" } })))))).toBe("BLOCKED");
    expect(await errorCode(generateText(options, deps(fakeFetch(json(200, okBody("", "SAFETY"))))))).toBe("BLOCKED");
  });

  it("빈 응답은 FAILED", async () => {
    expect(await errorCode(generateText(options, deps(fakeFetch(json(200, { candidates: [] })))))).toBe("FAILED");
  });

  it("생각(thought) 파트는 빼고, 길이 상한에서 잘린 답변은 truncated로 표시한다", async () => {
    const body = {
      candidates: [{ content: { parts: [{ text: "내부 생각", thought: true }, { text: "답변" }] }, finishReason: "MAX_TOKENS" }],
    };
    const r = await generateText(options, deps(fakeFetch(json(200, body))));
    expect(r.text).toBe("답변");
    expect(r.truncated).toBe(true);
  });
});

describe("modelChain", () => {
  it("환경변수가 없으면 기본값, 같은 모델은 한 번만 시도한다", () => {
    expect(modelChain({})).toEqual(["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]);
    expect(modelChain({ GEMINI_MODEL: "x", GEMINI_FALLBACK_MODEL: "x" })).toEqual(["x"]);
  });
});

describe("aiErrorMessage", () => {
  it("모든 오류에 한국어 사용자 메시지가 있다", () => {
    for (const code of ["NOT_CONFIGURED", "RATE_LIMITED", "UNAVAILABLE", "BLOCKED", "FAILED"] as const) {
      expect(aiErrorMessage(code)).toMatch(/[가-힣]/);
    }
  });
});
