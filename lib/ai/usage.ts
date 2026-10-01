import "server-only";
import { generateText } from "@/lib/ai/gemini";
import { type AiKind, AI_LIMITS, CACHE_TTL_DAYS, checkLimit, limitMessage, requestHash, startOfTodayKst } from "@/lib/ai/quota";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

/**
 * 모든 AI 호출이 거쳐 가는 관문.
 * 1. 같은 요청이 최근 7일 안에 있었으면 저장된 답을 돌려준다. (Gemini 호출 없음, 한도 차감 없음)
 * 2. 오늘 사용량이 한도를 넘었으면 거절한다.
 * 3. Gemini를 호출하고 ai_interactions에 기록한다. (사용량 계산·캐시용, 90일 후 자동 삭제)
 * ai_interactions는 클라이언트 권한으로 쓸 수 없어 service_role로만 접근한다. (RLS)
 */

/** 한도 초과. message는 사용자에게 그대로 보여준다. */
export class AiQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiQuotaError";
  }
}

export type AiCaller = { userId: string } | { demoId: string };

export type AiCallResult = { text: string; model: string; cached: boolean; tokensIn: number; tokensOut: number };

export async function callAi(params: {
  kind: AiKind;
  caller: AiCaller;
  problemId: string | null;
  system: string;
  prompt: string;
  maxOutputTokens: number;
  temperature?: number;
  /** 기록용 요약 정보 (slug, 단계 등). 사용자 코드 원문은 넣지 않는다. */
  meta: Record<string, Json>;
}): Promise<AiCallResult> {
  const admin = createAdminClient();
  const hash = requestHash(params.kind, params.system, params.prompt);

  const since = new Date(Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: cached, error: cacheError } = await admin
    .from("ai_interactions")
    .select("response, model")
    .eq("request_hash", hash)
    .gt("created_at", since)
    .not("response", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (cacheError) throw cacheError;
  if (cached?.response) {
    return { text: cached.response, model: cached.model ?? "cache", cached: true, tokensIn: 0, tokensOut: 0 };
  }

  const usage = await getTodayUsage(params.caller);
  const decision = checkLimit({ mine: usage.used, total: usage.total }, "demoId" in params.caller);
  if (!decision.allowed) throw new AiQuotaError(limitMessage(decision));

  const result = await generateText({
    system: params.system,
    prompt: params.prompt,
    maxOutputTokens: params.maxOutputTokens,
    temperature: params.temperature,
  });

  const { error: insertError } = await admin.from("ai_interactions").insert({
    user_id: "userId" in params.caller ? params.caller.userId : null,
    problem_id: params.problemId,
    type: params.kind,
    request_hash: hash,
    request: { ...params.meta, ...("demoId" in params.caller ? { demoId: params.caller.demoId } : {}) },
    // 잘린 답은 캐시하지 않도록 저장하지 않는다.
    response: result.truncated ? null : result.text,
    model: result.model,
    tokens_in: result.tokensIn,
    tokens_out: result.tokensOut,
  });
  // 기록 실패는 사용자 응답을 막지 않는다. (한도 계산이 1회 덜 될 수 있음)
  if (insertError) console.error("[ai] usage insert failed", insertError.message);

  return { text: result.text, model: result.model, cached: false, tokensIn: result.tokensIn, tokensOut: result.tokensOut };
}

/** 오늘(한국 시간) 사용량. used = 이 사용자(또는 Demo 브라우저), total = 서비스 전체 */
export async function getTodayUsage(caller: AiCaller): Promise<{ used: number; limit: number; total: number }> {
  const admin = createAdminClient();
  const start = startOfTodayKst(new Date());

  let mine = admin.from("ai_interactions").select("id", { count: "exact", head: true }).gte("created_at", start);
  mine = "userId" in caller ? mine.eq("user_id", caller.userId) : mine.is("user_id", null).eq("request->>demoId", caller.demoId);

  const [mineRes, totalRes] = await Promise.all([
    mine,
    admin.from("ai_interactions").select("id", { count: "exact", head: true }).gte("created_at", start),
  ]);
  if (mineRes.error) throw mineRes.error;
  if (totalRes.error) throw totalRes.error;

  return {
    used: mineRes.count ?? 0,
    limit: "userId" in caller ? AI_LIMITS.perUser : AI_LIMITS.perDemo,
    total: totalRes.count ?? 0,
  };
}
