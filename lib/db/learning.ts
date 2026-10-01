import "server-only";
import type { ProgressState } from "@/lib/learning/progress";
import type { StreakState } from "@/lib/learning/streak";
import { createClient } from "@/lib/supabase/server";

/** 사용자 학습 상태(진도·streak) DB 접근. 사용자 세션으로 동작해 RLS가 본인 행만 허용한다. */

export async function getStreakAndTimezone(userId: string): Promise<{ streak: StreakState; timezone: string }> {
  const supabase = await createClient();
  const [profile, prefs] = await Promise.all([
    supabase.from("profiles").select("streak, longest_streak, last_study_date").eq("id", userId).single(),
    supabase.from("user_preferences").select("timezone").eq("user_id", userId).single(),
  ]);
  if (profile.error) throw profile.error;
  if (prefs.error) throw prefs.error;
  return {
    streak: {
      streak: profile.data.streak,
      longestStreak: profile.data.longest_streak,
      lastStudyDate: profile.data.last_study_date,
    },
    timezone: prefs.data.timezone,
  };
}

export async function saveStreak(userId: string, s: StreakState): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ streak: s.streak, longest_streak: s.longestStreak, last_study_date: s.lastStudyDate })
    .eq("id", userId);
  if (error) throw error;
}

export async function getProgress(userId: string, problemId: string): Promise<ProgressState | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_problem_progress")
    .select("status, attempts, first_solved_at, last_attempt_at, next_review_at")
    .eq("user_id", userId)
    .eq("problem_id", problemId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    status: data.status === "solved" ? "solved" : "attempted",
    attempts: data.attempts,
    firstSolvedAt: data.first_solved_at,
    lastAttemptAt: data.last_attempt_at ?? data.first_solved_at ?? new Date(0).toISOString(),
    nextReviewAt: data.next_review_at,
  };
}

export async function saveProgress(userId: string, problemId: string, p: ProgressState): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("user_problem_progress").upsert(
    {
      user_id: userId,
      problem_id: problemId,
      status: p.status,
      attempts: p.attempts,
      first_solved_at: p.firstSolvedAt,
      last_attempt_at: p.lastAttemptAt,
      next_review_at: p.nextReviewAt,
    },
    { onConflict: "user_id,problem_id" },
  );
  if (error) throw error;
}
