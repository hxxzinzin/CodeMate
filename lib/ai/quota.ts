import { createHash } from "node:crypto";

/**
 * AI 사용 한도와 캐시 키 (무료 Gemini 한도 보호, 기획서 32).
 * 한도는 실제로 Gemini를 호출한 횟수만 센다. 캐시에서 돌려준 답은 세지 않는다.
 */
export const AI_LIMITS = {
  /** 로그인 사용자 1명의 하루 호출 수 */
  perUser: 20,
  /** Demo(비로그인) 브라우저 1개의 하루 호출 수 */
  perDemo: 3,
  /** 서비스 전체의 하루 호출 수. 쿠키를 지워 가며 Demo를 남용해도 여기서 멈춘다. */
  total: 200,
} as const;

/** 같은 요청의 답을 재사용하는 기간 */
export const CACHE_TTL_DAYS = 7;

/**
 * 프롬프트를 바꾸면 올린다. 캐시 키에 포함되어 바뀐 프롬프트로 다시 답을 만든다.
 * (예: v2 — 수식 표기 금지, Java/C 예시 규칙 추가)
 */
export const PROMPT_VERSION = 2;

export type AiKind = "hint" | "review" | "explain";

/** 요청 내용(종류 + 시스템 프롬프트 + 프롬프트)으로 만든 캐시 키. 사용자 코드 원문은 DB에 저장하지 않는다. */
export function requestHash(kind: AiKind, system: string, prompt: string): string {
  return createHash("sha256").update(JSON.stringify({ v: PROMPT_VERSION, kind, system, prompt })).digest("hex");
}

/** 한국 시간 기준 오늘 0시를 ISO 문자열(UTC)로. 하루 사용량 계산의 시작점 */
export function startOfTodayKst(now: Date): string {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const ymd = kst.toISOString().slice(0, 10);
  return new Date(`${ymd}T00:00:00+09:00`).toISOString();
}

export type UsageCounts = { mine: number; total: number };

export type LimitDecision = { allowed: true } | { allowed: false; reason: "user" | "demo" | "total"; limit: number };

/** 오늘 사용량으로 이번 호출을 허용할지 정한다. */
export function checkLimit(counts: UsageCounts, isDemo: boolean): LimitDecision {
  if (counts.total >= AI_LIMITS.total) return { allowed: false, reason: "total", limit: AI_LIMITS.total };
  const mineLimit = isDemo ? AI_LIMITS.perDemo : AI_LIMITS.perUser;
  if (counts.mine >= mineLimit) return { allowed: false, reason: isDemo ? "demo" : "user", limit: mineLimit };
  return { allowed: true };
}

export function limitMessage(decision: Extract<LimitDecision, { allowed: false }>): string {
  switch (decision.reason) {
    case "user":
      return `오늘 AI 코치를 ${decision.limit}번 모두 사용했어요. 내일 다시 도와드릴게요. 미리 작성된 단계별 힌트는 계속 볼 수 있어요.`;
    case "demo":
      return `체험용 AI 힌트 ${decision.limit}번을 모두 사용했어요. 로그인하면 하루 ${AI_LIMITS.perUser}번까지 쓸 수 있어요.`;
    case "total":
      return "오늘은 AI 코치를 찾는 분이 많아 잠시 쉬고 있어요. 내일 다시 시도해주세요.";
  }
}
