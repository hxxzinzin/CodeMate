import "server-only";
import { toProblemTags } from "@/lib/db/problems";
import type { Candidate, ProgressInfo } from "@/lib/recommendation/problemSelector";
import { createClient } from "@/lib/supabase/server";
import type { Language } from "@/types/problem";

/** 오늘의 문제 추천에 필요한 데이터 조회·저장. 사용자 세션 + RLS로 본인 데이터만 다룬다. */

const isLanguage = (v: string): v is Language => v === "java" || v === "c";

export async function getCandidates(): Promise<(Candidate & { estimatedMinutes: number })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("problems")
    .select("id, slug, title, difficulty, estimated_minutes, languages, problem_tags(tag_type, tag)")
    .eq("is_published", true);
  if (error) throw error;
  return data.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
    estimatedMinutes: p.estimated_minutes,
    languages: p.languages.filter(isLanguage),
    tags: toProblemTags(p.problem_tags),
  }));
}

export type DailyRow = {
  id: string;
  problemId: string;
  date: string;
  language: Language;
  mode: "recommended" | "random";
  rerollCount: number;
  reason: string | null;
};

const DAILY_COLUMNS = "id, problem_id, date, language, mode, reroll_count, reason";

function toDailyRow(row: {
  id: string;
  problem_id: string;
  date: string;
  language: string;
  mode: string;
  reroll_count: number;
  reason: string | null;
}): DailyRow {
  return {
    id: row.id,
    problemId: row.problem_id,
    date: row.date,
    language: isLanguage(row.language) ? row.language : "java",
    mode: row.mode === "random" ? "random" : "recommended",
    rerollCount: row.reroll_count,
    reason: row.reason,
  };
}

export async function getDaily(userId: string, date: string): Promise<DailyRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_problems")
    .select(DAILY_COLUMNS)
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  return data ? toDailyRow(data) : null;
}

/**
 * 오늘의 문제 저장. (user_id, date)가 unique라서, 같은 순간 두 요청이 겹치면 한쪽은 실패한다.
 * 그때는 먼저 저장된 행을 그대로 쓴다. → 하루에 오늘의 문제는 항상 하나
 */
export async function insertDaily(
  userId: string,
  row: Omit<DailyRow, "id" | "rerollCount">,
): Promise<DailyRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_problems")
    .insert({ user_id: userId, problem_id: row.problemId, date: row.date, language: row.language, mode: row.mode, reason: row.reason })
    .select(DAILY_COLUMNS)
    .single();
  if (error?.code === "23505") {
    const existing = await getDaily(userId, row.date);
    if (existing) return existing;
  }
  if (error) throw error;
  return toDailyRow(data);
}

/** 새로 뽑기: 행을 추가하지 않고 교체한다. reroll_count는 DB check(0~2)로도 막혀 있다. */
export async function replaceDaily(
  id: string,
  row: Pick<DailyRow, "problemId" | "language" | "mode" | "reason" | "rerollCount">,
): Promise<DailyRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_problems")
    .update({ problem_id: row.problemId, language: row.language, mode: row.mode, reason: row.reason, reroll_count: row.rerollCount })
    .eq("id", id)
    .select(DAILY_COLUMNS)
    .single();
  if (error) throw error;
  return toDailyRow(data);
}

/** 추천 입력: 최근 오늘의 문제, 최근 오답 문제, 진도 */
export async function getRecommendationHistory(
  userId: string,
  sinceDate: string,
  sinceIso: string,
): Promise<{
  recentDaily: { problemId: string; date: string; language: Language }[];
  recentWrongProblemIds: string[];
  progress: Map<string, ProgressInfo>;
}> {
  const supabase = await createClient();
  const [daily, wrong, progress] = await Promise.all([
    supabase.from("daily_problems").select("problem_id, date, language").eq("user_id", userId).gte("date", sinceDate),
    supabase
      .from("submissions")
      .select("problem_id")
      .eq("user_id", userId)
      .in("result", ["self_wrong", "wa", "tle", "re", "ce"])
      .gte("created_at", sinceIso),
    supabase.from("user_problem_progress").select("problem_id, status, next_review_at").eq("user_id", userId),
  ]);
  if (daily.error) throw daily.error;
  if (wrong.error) throw wrong.error;
  if (progress.error) throw progress.error;

  return {
    recentDaily: daily.data.map((d) => ({
      problemId: d.problem_id,
      date: d.date,
      language: isLanguage(d.language) ? d.language : "java",
    })),
    recentWrongProblemIds: [...new Set(wrong.data.map((w) => w.problem_id))],
    progress: new Map(
      progress.data.map((p) => [
        p.problem_id,
        { status: p.status === "solved" ? "solved" : "attempted", nextReviewAt: p.next_review_at } satisfies ProgressInfo,
      ]),
    ),
  };
}

export async function getRecommendationProfile(
  userId: string,
): Promise<{ currentDifficulty: number; javaRatio: number; timezone: string }> {
  const supabase = await createClient();
  const [profile, prefs] = await Promise.all([
    supabase.from("profiles").select("current_difficulty").eq("id", userId).single(),
    supabase.from("user_preferences").select("java_ratio, timezone").eq("user_id", userId).single(),
  ]);
  if (profile.error) throw profile.error;
  if (prefs.error) throw prefs.error;
  return {
    currentDifficulty: Number(profile.data.current_difficulty),
    javaRatio: prefs.data.java_ratio,
    timezone: prefs.data.timezone,
  };
}
