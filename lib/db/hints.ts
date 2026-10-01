import "server-only";
import type { HintLevel } from "@/lib/hints/rules";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * 정적 힌트 원문. problem_hints는 클라이언트 권한(anon, authenticated)으로 읽을 수 없어서
 * service_role(admin) 클라이언트로만 조회한다. (ADR-002)
 */
export async function getStaticHint(problemId: string, level: HintLevel): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("problem_hints")
    .select("content")
    .eq("problem_id", problemId)
    .eq("level", level)
    .maybeSingle();
  if (error) throw error;
  return data?.content ?? null;
}

/** 정답 해설과 정답 코드. problem_hints와 마찬가지로 서버(service_role)만 읽을 수 있다. */
export async function getSolution(
  problemId: string,
): Promise<{ explanation: string; referenceCode: Record<string, string> } | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("problem_solutions")
    .select("explanation, reference_code")
    .eq("problem_id", problemId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const code = data.reference_code;
  const referenceCode =
    code && typeof code === "object" && !Array.isArray(code)
      ? Object.fromEntries(Object.entries(code).filter((e): e is [string, string] => typeof e[1] === "string"))
      : {};
  return { explanation: data.explanation, referenceCode };
}

export type HintSource = "static" | "ai";
export type HintEvent = { level: number; source: HintSource; createdAt: string };

/** 사용자가 이 문제에서 본 힌트 기록 (learning_history의 hint_request). since 이후만 볼 수 있다. */
export async function getHintEvents(userId: string, problemId: string, since?: string | null): Promise<HintEvent[]> {
  const supabase = await createClient();
  let query = supabase
    .from("learning_history")
    .select("metadata, created_at")
    .eq("user_id", userId)
    .eq("problem_id", problemId)
    .eq("event_type", "hint_request")
    .order("created_at");
  if (since) query = query.gt("created_at", since);

  const { data, error } = await query;
  if (error) throw error;
  return data.flatMap((row) => {
    const meta = row.metadata as { level?: unknown; source?: unknown };
    if (typeof meta.level !== "number") return [];
    return [{ level: meta.level, source: meta.source === "ai" ? "ai" : "static", createdAt: row.created_at }];
  });
}
