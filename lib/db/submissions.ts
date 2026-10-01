import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import type { Language } from "@/types/problem";
import type { SubmissionResult } from "@/types/submission";

/**
 * 제출 기록 DB 접근. 사용자 세션 클라이언트를 쓰므로 RLS가 "본인 기록만" 접근을 보장한다.
 * (insert 시 user_id가 본인이 아니면 DB가 거부함)
 */

export type SubmissionStats = {
  /** 이 문제에 대한 기존 제출 수 */
  count: number;
  /** 가장 최근 제출 시각 (ISO) */
  lastSubmittedAt: string | null;
};

export async function getSubmissionStats(userId: string, problemId: string): Promise<SubmissionStats> {
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("submissions")
    .select("created_at", { count: "exact" })
    .eq("user_id", userId)
    .eq("problem_id", problemId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  return { count: count ?? 0, lastSubmittedAt: data[0]?.created_at ?? null };
}

export type NewSubmission = {
  userId: string;
  problemId: string;
  language: Language;
  code: string;
  result: SubmissionResult;
  attemptCount: number;
  judgeDetail: Json | null;
};

export async function insertSubmission(s: NewSubmission): Promise<{ id: string; createdAt: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      user_id: s.userId,
      problem_id: s.problemId,
      language: s.language,
      code: s.code,
      result: s.result,
      attempt_count: s.attemptCount,
      judge_detail: s.judgeDetail,
    })
    .select("id, created_at")
    .single();
  if (error) throw error;
  return { id: data.id, createdAt: data.created_at };
}

export type LearningEvent = "problem_view" | "hint_request" | "submission" | "solve" | "review_request" | "solution_reveal";

/** 학습 이력 기록. 부가 기록이라 실패해도 본 작업을 막지 않고 로그만 남긴다. */
export async function recordLearningEvent(
  userId: string,
  problemId: string | null,
  eventType: LearningEvent,
  metadata: Record<string, Json> = {},
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("learning_history")
    .insert({ user_id: userId, problem_id: problemId, event_type: eventType, metadata });
  if (error) console.error("[learning_history] insert failed", error.message);
}
