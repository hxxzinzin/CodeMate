import "server-only";
import {
  type DailyRow,
  getCandidates,
  getDaily,
  getRecommendationHistory,
  getRecommendationProfile,
  insertDaily,
  replaceDaily,
} from "@/lib/db/daily";
import { getProgress } from "@/lib/db/learning";
import { getUserSkills } from "@/lib/db/skills";
import { localDate, previousDate } from "@/lib/learning/streak";
import {
  type Candidate,
  randomProblem,
  RECOMMENDATION_CONFIG,
  recommendProblem,
  type RecommendationInput,
  seededRandom,
} from "@/lib/recommendation/problemSelector";
import type { Language, ProblemTag } from "@/types/problem";

/** 하루에 새로 뽑을 수 있는 횟수 (daily_problems.reroll_count check 제약과 같음) */
export const MAX_REROLLS = 2;

export type DailyProblemView = {
  date: string;
  problem: {
    slug: string;
    title: string;
    difficulty: number;
    estimatedMinutes: number;
    languages: Language[];
    tags: ProblemTag[];
  };
  language: Language;
  mode: "recommended" | "random";
  reason: string;
  rerollsLeft: number;
  /** 오늘의 문제를 이미 해결했는지 */
  solved: boolean;
};

function daysBefore(date: string, days: number): string {
  let d = date;
  for (let i = 0; i < days; i++) d = previousDate(d);
  return d;
}

/** 추천에 필요한 데이터를 모아 순수 함수 입력으로 만든다. */
async function buildInput(userId: string, now: Date, excludeIds: Set<string>, seed: string) {
  const profile = await getRecommendationProfile(userId);
  const today = localDate(now, profile.timezone);
  const sinceDate = daysBefore(today, RECOMMENDATION_CONFIG.recentDays);
  const sinceIso = new Date(now.getTime() - RECOMMENDATION_CONFIG.recentDays * 86_400_000).toISOString();

  const [candidates, skills, history] = await Promise.all([
    getCandidates(),
    getUserSkills(userId),
    getRecommendationHistory(userId, sinceDate, sinceIso),
  ]);

  const byId = new Map(candidates.map((c) => [c.id, c]));
  const recentDaily = new Map<string, string>();
  const recentLanguageCounts: Record<Language, number> = { java: 0, c: 0 };
  for (const d of history.recentDaily) {
    if (d.date === today) continue; // 오늘 행(교체 대상)은 언어 비율 계산에서 뺀다.
    recentLanguageCounts[d.language]++;
    if (!recentDaily.has(d.problemId) || recentDaily.get(d.problemId)! < d.date) recentDaily.set(d.problemId, d.date);
  }
  const recentFailTags = new Set(
    history.recentWrongProblemIds.flatMap((id) => byId.get(id)?.tags.map((t) => t.key) ?? []),
  );

  const input: RecommendationInput = {
    candidates,
    currentDifficulty: profile.currentDifficulty,
    javaRatio: profile.javaRatio,
    recentLanguageCounts,
    skills,
    progress: history.progress,
    recentDaily,
    recentFailTags,
    excludeIds,
    today,
    now,
    random: seededRandom(seed),
  };
  return { input, today, byId, progress: history.progress };
}

function toView(row: DailyRow, problem: Candidate & { estimatedMinutes: number }, solved: boolean): DailyProblemView {
  return {
    date: row.date,
    problem: {
      slug: problem.slug,
      title: problem.title,
      difficulty: problem.difficulty,
      estimatedMinutes: problem.estimatedMinutes,
      languages: problem.languages,
      tags: problem.tags,
    },
    language: row.language,
    mode: row.mode,
    reason: row.reason ?? "오늘의 문제예요.",
    rerollsLeft: Math.max(0, MAX_REROLLS - row.rerollCount),
    solved,
  };
}

/**
 * 오늘의 문제. 오늘(사용자 시간대) 이미 정해졌으면 그 문제를, 없으면 새로 추천해 저장한다.
 * → 같은 날에는 새로고침해도 같은 문제, 날짜가 바뀌면 새 문제
 */
export async function getTodayProblem(userId: string, now = new Date()): Promise<DailyProblemView | null> {
  const { timezone } = await getRecommendationProfile(userId);
  const today = localDate(now, timezone);

  const existing = await getDaily(userId, today);
  if (existing) {
    // 대부분의 방문은 이미 정해진 문제를 보여주기만 하므로, 추천 데이터 전체를 모으지 않는다.
    const [candidates, progress] = await Promise.all([getCandidates(), getProgress(userId, existing.problemId)]);
    const problem = candidates.find((c) => c.id === existing.problemId);
    if (problem) return toView(existing, problem, progress?.status === "solved");
    // 문제가 비공개로 바뀐 경우에만 아래에서 다시 추천하지 않고 비워 둔다.
    return null;
  }

  const { input, byId, progress } = await buildInput(userId, now, new Set(), `${userId}:${today}:0`);
  const rec = recommendProblem(input);
  if (!rec) return null;
  const row = await insertDaily(userId, {
    problemId: rec.problem.id,
    date: today,
    language: rec.language,
    mode: "recommended",
    reason: rec.reason,
  });
  const problem = byId.get(row.problemId);
  return problem ? toView(row, problem, progress.get(problem.id)?.status === "solved") : null;
}

export type RerollResult = { ok: true; daily: DailyProblemView } | { ok: false; message: string };

/** 새로 뽑기 (하루 2회). 지금 문제는 제외하고, 추천 또는 랜덤으로 다시 고른다. */
export async function rerollTodayProblem(
  userId: string,
  mode: "recommended" | "random",
  now = new Date(),
): Promise<RerollResult> {
  const { timezone } = await getRecommendationProfile(userId);
  const today = localDate(now, timezone);
  const current = await getDaily(userId, today);
  if (!current) {
    const created = await getTodayProblem(userId, now);
    return created ? { ok: true, daily: created } : { ok: false, message: "추천할 문제가 없어요." };
  }
  if (current.rerollCount >= MAX_REROLLS) {
    return { ok: false, message: `오늘은 새 문제를 ${MAX_REROLLS}번 모두 뽑았어요. 내일 새로운 문제가 준비돼요.` };
  }

  const rerollCount = current.rerollCount + 1;
  const { input, byId, progress } = await buildInput(
    userId,
    now,
    new Set([current.problemId]),
    `${userId}:${today}:${rerollCount}`,
  );
  const rec = mode === "random" ? randomProblem(input) : recommendProblem(input);
  if (!rec) return { ok: false, message: "새로 뽑을 수 있는 문제가 없어요." };

  const row = await replaceDaily(current.id, {
    problemId: rec.problem.id,
    language: rec.language,
    mode,
    reason: rec.reason,
    rerollCount,
  });
  const problem = byId.get(row.problemId)!;
  return { ok: true, daily: toView(row, problem, progress.get(problem.id)?.status === "solved") };
}
