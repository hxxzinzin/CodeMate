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
  /** 서버에서 상한을 적용한 풀이 시간(초). 측정값이 없으면 null */
  solvingTimeSec: number | null;
  /** 이번 시도(직전 제출 이후)에 본 힌트 수와 최고 단계 */
  hintCount: number;
  maxHintLevel: number;
  /** 이번 시도에 AI 리뷰를 받았는지, 정답을 봤는지 */
  aiReviewUsed: boolean;
  solutionRevealed: boolean;
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
      solving_time_sec: s.solvingTimeSec,
      hint_count: s.hintCount,
      max_hint_level: s.maxHintLevel,
      ai_review_used: s.aiReviewUsed,
      solution_revealed: s.solutionRevealed,
      judge_detail: s.judgeDetail,
    })
    .select("id, created_at")
    .single();
  if (error) throw error;
  return { id: data.id, createdAt: data.created_at };
}

export type LearningEvent = "problem_view" | "hint_request" | "submission" | "solve" | "review_request" | "solution_reveal";

/** 직전 제출 이후 이 문제에서 AI 리뷰를 받았는지, 정답을 봤는지 (제출 기록용) */
export async function getCoachUsageSince(
  userId: string,
  problemId: string,
  since: string | null,
): Promise<{ aiReviewUsed: boolean; solutionRevealed: boolean }> {
  const supabase = await createClient();
  let query = supabase
    .from("learning_history")
    .select("event_type, metadata")
    .eq("user_id", userId)
    .eq("problem_id", problemId)
    .in("event_type", ["review_request", "solution_reveal"]);
  if (since) query = query.gt("created_at", since);
  const { data, error } = await query;
  if (error) throw error;
  return {
    aiReviewUsed: data.some((e) => e.event_type === "review_request" && (e.metadata as { kind?: string }).kind === "review"),
    solutionRevealed: data.some((e) => e.event_type === "solution_reveal"),
  };
}

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
