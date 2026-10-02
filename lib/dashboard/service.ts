import "server-only";
import { type DashboardStatsRaw, displayStreak, parseStats } from "@/lib/dashboard/stats";
import { localDate } from "@/lib/learning/streak";
import { getSkillSummary } from "@/lib/skills/service";
import type { SkillSummary } from "@/lib/skills/skillCalculator";
import { createClient } from "@/lib/supabase/server";
import type { Language } from "@/types/problem";
import type { SubmissionResult } from "@/types/submission";

export type RecentSubmission = {
  id: string;
  problemSlug: string;
  problemTitle: string;
  language: Language;
  result: SubmissionResult;
  solvingTimeSec: number | null;
  hintCount: number;
  createdAt: string;
};

export type DashboardData = {
  streak: number;
  longestStreak: number;
  currentDifficulty: number;
  stats: DashboardStatsRaw;
  recent: RecentSubmission[];
  skills: SkillSummary;
};

/** 대시보드에 필요한 데이터를 한 번에 모은다. 모두 사용자 세션 + RLS로 본인 데이터만 조회한다. */
export async function getDashboardData(userId: string, now = new Date()): Promise<DashboardData> {
  const supabase = await createClient();
  const [profile, prefs, stats, recent, skills] = await Promise.all([
    supabase.from("profiles").select("streak, longest_streak, last_study_date, current_difficulty").eq("id", userId).single(),
    supabase.from("user_preferences").select("timezone").eq("user_id", userId).single(),
    supabase.rpc("dashboard_stats"),
    supabase
      .from("submissions")
      .select("id, language, result, solving_time_sec, hint_count, created_at, problems(slug, title)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    getSkillSummary(userId, now),
  ]);
  if (profile.error) throw profile.error;
  if (prefs.error) throw prefs.error;
  if (stats.error) throw stats.error;
  if (recent.error) throw recent.error;

  const today = localDate(now, prefs.data.timezone);
  return {
    streak: displayStreak(profile.data.streak, profile.data.last_study_date, today),
    longestStreak: profile.data.longest_streak,
    currentDifficulty: Number(profile.data.current_difficulty),
    stats: parseStats(stats.data),
    recent: recent.data.map((s) => ({
      id: s.id,
      problemSlug: s.problems?.slug ?? "",
      problemTitle: s.problems?.title ?? "알 수 없는 문제",
      language: s.language === "c" ? "c" : "java",
      result: s.result as SubmissionResult,
      solvingTimeSec: s.solving_time_sec,
      hintCount: s.hint_count,
      createdAt: s.created_at,
    })),
    skills,
  };
}
