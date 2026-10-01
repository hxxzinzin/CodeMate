import "server-only";

/**
 * Gemini API 호출 (서버 전용). API 키는 서버 환경변수로만 읽고 클라이언트에 보내지 않는다.
 * SDK 대신 REST(fetch)를 쓴다: 필요한 요청이 generateContent 하나뿐이고, 재시도·시간 제한을 직접 제어하기 위해.
 * 모델 선택 근거는 ADR-010.
 */

export const DEFAULT_MODEL = "gemini-3.5-flash-lite";
export const DEFAULT_FALLBACK_MODEL = "gemini-3.1-flash-lite";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const TIMEOUT_MS = 20_000;

export type AiErrorCode =
  /** API 키가 설정되지 않음 */
  | "NOT_CONFIGURED"
  /** 무료 한도 초과(429) — 모든 모델에서 */
  | "RATE_LIMITED"
  /** 과부하(503)·시간 초과·네트워크 오류 — 모든 모델에서 */
  | "UNAVAILABLE"
  /** 안전 필터로 응답이 차단됨 */
  | "BLOCKED"
  /** 그 밖의 실패 (키 오류, 잘못된 요청, 빈 응답 등) */
  | "FAILED";

export class AiError extends Error {
  // 생성자 매개변수 속성(constructor(readonly code ...))은 Node의 TypeScript 실행(strip-only)에서
  // 지원되지 않아 스크립트가 실패하므로, 필드를 명시적으로 선언한다.
  readonly code: AiErrorCode;

  constructor(code: AiErrorCode, message: string) {
    super(message);
    this.name = "AiError";
    this.code = code;
  }
}

/** 사용자에게 보여줄 문장. 개발자용 오류 내용은 서버 로그에만 남긴다. */
export function aiErrorMessage(code: AiErrorCode): string {
  switch (code) {
    case "NOT_CONFIGURED":
      return "AI 코치가 아직 준비되지 않았어요.";
    case "RATE_LIMITED":
      return "오늘 AI 코치를 너무 많이 불렀어요. 잠시 후 다시 시도해주세요.";
    case "UNAVAILABLE":
      return "AI 코치가 잠시 쉬고 있어요. 잠시 후 다시 시도해주세요.";
    case "BLOCKED":
      return "이 요청에는 답변할 수 없어요. 질문을 바꿔서 다시 시도해주세요.";
    case "FAILED":
      return "AI 코치가 답변하지 못했어요. 잠시 후 다시 시도해주세요.";
  }
}

export type GenerateOptions = {
  system: string;
  prompt: string;
  /** 답변 길이 상한 (토큰). 무료 한도 절약을 위해 용도별로 작게 둔다. */
  maxOutputTokens: number;
  temperature?: number;
};

export type GenerateResult = {
  text: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  /** 답변이 길이 상한에서 잘렸는지 */
  truncated: boolean;
};

/** 테스트에서 가짜 fetch와 환경변수를 넣을 수 있게 한다. */
export type GeminiDeps = {
  fetch: typeof fetch;
  env: Partial<Record<"GEMINI_API_KEY" | "GEMINI_MODEL" | "GEMINI_FALLBACK_MODEL", string>>;
};

const defaultDeps = (): GeminiDeps => ({
  fetch: globalThis.fetch,
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    GEMINI_FALLBACK_MODEL: process.env.GEMINI_FALLBACK_MODEL,
  },
});

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
};

/** 기본 모델 → 예비 모델 순서. 같은 모델은 한 번만 시도한다. */
export function modelChain(env: GeminiDeps["env"]): string[] {
  const primary = env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const fallback = env.GEMINI_FALLBACK_MODEL?.trim() || DEFAULT_FALLBACK_MODEL;
  return [...new Set([primary, fallback])];
}

/**
 * 텍스트를 생성한다.
 * 과부하(503)·한도 초과(429)·서버 오류(5xx)·시간 초과면 다음 모델로 넘어가고,
 * 키 오류·잘못된 요청(4xx)은 다른 모델로 바꿔도 같으므로 바로 실패한다.
 */
export async function generateText(options: GenerateOptions, deps: GeminiDeps = defaultDeps()): Promise<GenerateResult> {
  const apiKey = deps.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new AiError("NOT_CONFIGURED", "GEMINI_API_KEY is not set");

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: options.system }] },
    contents: [{ role: "user", parts: [{ text: options.prompt }] }],
    generationConfig: {
      maxOutputTokens: options.maxOutputTokens,
      temperature: options.temperature ?? 0.4,
      // "생각" 토큰이 출력 한도를 다 써서 답변이 잘리는 문제를 막는다. (ADR-010)
      // thinkingBudget: 0은 gemini-3.5-flash-lite가 400으로 거부해서, 세 후보 모델 모두 받는 thinkingLevel을 쓴다.
      thinkingConfig: { thinkingLevel: "minimal" },
    },
  });

  let lastCode: AiErrorCode = "UNAVAILABLE";
  for (const model of modelChain(deps.env)) {
    let res: Response;
    try {
      res = await deps.fetch(`${API_BASE}/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      console.error(`[gemini] ${model} request failed`, error instanceof Error ? error.name : error);
      lastCode = "UNAVAILABLE";
      continue;
    }

    if (res.status === 429 || res.status >= 500) {
      console.warn(`[gemini] ${model} returned ${res.status}, trying next model`);
      lastCode = res.status === 429 ? "RATE_LIMITED" : "UNAVAILABLE";
      continue;
    }
    if (!res.ok) {
      console.error(`[gemini] ${model} returned ${res.status}`, (await res.text()).slice(0, 300));
      throw new AiError("FAILED", `Gemini returned ${res.status}`);
    }

    const data = (await res.json()) as GeminiResponse;
    if (data.promptFeedback?.blockReason) {
      throw new AiError("BLOCKED", `prompt blocked: ${data.promptFeedback.blockReason}`);
    }
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === "SAFETY" || candidate?.finishReason === "PROHIBITED_CONTENT") {
      throw new AiError("BLOCKED", `response blocked: ${candidate.finishReason}`);
    }
    // 생각(thought) 파트가 섞여 와도 답변 텍스트만 쓴다.
    const text = (candidate?.content?.parts ?? [])
      .filter((p) => !p.thought)
      .map((p) => p.text ?? "")
      .join("")
      .trim();
    if (!text) throw new AiError("FAILED", `empty response (finishReason: ${candidate?.finishReason})`);

    return {
      text,
      model,
      tokensIn: data.usageMetadata?.promptTokenCount ?? 0,
      tokensOut: data.usageMetadata?.candidatesTokenCount ?? 0,
      truncated: candidate?.finishReason === "MAX_TOKENS",
    };
  }

  throw new AiError(lastCode, "all models failed");
}
