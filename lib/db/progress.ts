import "server-only";
import type { HistoryEvent } from "@/lib/progress/growth";
import { createClient } from "@/lib/supabase/server";

/** 기간 안의 제출 기록(Skill·난이도 변화량 포함). 사용자 세션 + RLS로 본인 기록만 읽는다. */
export async function getSubmissionHistory(userId: string, sinceIso: string): Promise<HistoryEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_history")
    .select("created_at, metadata")
    .eq("user_id", userId)
    .eq("event_type", "submission")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: true })
    .limit(1000);
  if (error) throw error;
  return data.map((e) => ({ createdAt: e.created_at, metadata: e.metadata }));
}
