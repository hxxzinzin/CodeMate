import { tagLabel } from "@/lib/labels";
import { DIFFICULTY_CONFIG } from "@/lib/recommendation/difficulty";
import type { Language, ProblemTag } from "@/types/problem";
import type { UserSkill } from "@/types/skill";

/**
 * 오늘의 문제 추천 (규칙 기반, ADR-004). DB와 화면에 의존하지 않는 순수 함수다.
 * 나중에 다른 추천 방식(ML 등)으로 바꿀 때 이 파일만 교체한다.
 */

// ---------------------------------------------------------------------------
// 재현 가능한 난수 (같은 사용자·같은 날짜·같은 새로 뽑기 횟수면 같은 결과)
// ---------------------------------------------------------------------------

export type Random = () => number;

/** 문자열 시드로 만든 의사 난수 (mulberry32) */
export function seededRandom(seed: string): Random {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// 설정 (조정하기 쉽도록 한 곳에)
// ---------------------------------------------------------------------------

export const RECOMMENDATION_CONFIG = {
  /** 현재 수준 / 한 단계 쉬운 복습 / 한 단계 어려운 도전 (기획서 43) */
  bandRatio: { same: 0.7, easier: 0.2, harder: 0.1 },
  /** 최근 N일 안에 낸 문제는 다시 내지 않는다. */
  recentDays: 14,
  /** 후보가 없을 때 줄이는 중복 제외 기간 */
  relaxedRecentDays: 7,
  /** 상위 N개 중에서 점수 비례로 고른다. (가장 약한 분야만 반복하지 않도록) */
  topK: 5,
  weights: {
    weakness: 0.3,
    recentFail: 0.2,
    staleness: 0.15,
    reviewDue: 0.15,
    novelty: 0.1,
    underPractice: 0.1,
    tooEasy: -0.15,
  },
  stalenessDays: 30,
  underPracticeAttempts: 3,
  tooEasy: { score: 80, withinDays: 7 },
} as const;

// ---------------------------------------------------------------------------
// 입력 타입
// ---------------------------------------------------------------------------

export type Candidate = {
  id: string;
  slug: string;
  title: string;
  difficulty: number;
  languages: Language[];
  tags: ProblemTag[];
};

export type ProgressInfo = { status: "attempted" | "solved"; nextReviewAt: string | null };

export type RecommendationInput = {
  candidates: Candidate[];
  currentDifficulty: number;
  /** 0~100 */
  javaRatio: number;
  /** 최근 오늘의 문제 언어 횟수 (비율 보정용) */
  recentLanguageCounts: Record<Language, number>;
  skills: UserSkill[];
  progress: Map<string, ProgressInfo>;
  /** 오늘의 문제로 낸 날짜 (problemId → YYYY-MM-DD 중 가장 최근) */
  recentDaily: Map<string, string>;
  /** 최근 틀린 문제의 태그 키 */
  recentFailTags: Set<string>;
  /** 이번에 제외할 문제 (새로 뽑기 시 지금 문제) */
  excludeIds: Set<string>;
  today: string;
  now: Date;
  random: Random;
};

export type Recommendation = {
  problem: Candidate;
  language: Language;
  /** 화면에 보여줄 추천 이유 */
  reason: string;
};

// ---------------------------------------------------------------------------
// ① 언어
// ---------------------------------------------------------------------------

/**
 * 설정 비율을 목표로, 최근에 한쪽이 많이 나왔으면 다른 쪽 확률을 높인다. (자기 보정)
 * 0% 또는 100%로 설정하면 항상 그 언어만 낸다.
 */
export function pickLanguage(javaRatio: number, recent: Record<Language, number>, random: Random): Language {
  const target = Math.min(100, Math.max(0, javaRatio)) / 100;
  if (target <= 0) return "c";
  if (target >= 1) return "java";
  const total = recent.java + recent.c;
  const actual = total === 0 ? target : recent.java / total;
  const probability = Math.min(0.95, Math.max(0.05, target + (target - actual)));
  return random() < probability ? "java" : "c";
}

// ---------------------------------------------------------------------------
// ② 난이도 구간
// ---------------------------------------------------------------------------

export function pickDifficultyBand(currentDifficulty: number, random: Random): number {
  const { same, easier } = RECOMMENDATION_CONFIG.bandRatio;
  const base = Math.round(currentDifficulty);
  const r = random();
  const level = r < same ? base : r < same + easier ? base - 1 : base + 1;
  return Math.min(DIFFICULTY_CONFIG.max, Math.max(DIFFICULTY_CONFIG.min, level));
}

// ---------------------------------------------------------------------------
// ③ 후보 필터 / ④ 점수
// ---------------------------------------------------------------------------

function daysBetween(fromDate: string, toDate: string): number {
  return (new Date(`${toDate}T00:00:00Z`).getTime() - new Date(`${fromDate}T00:00:00Z`).getTime()) / 86_400_000;
}

/**
 * 다시 풀 때가 된 문제.
 * - solved: 푼 문제의 복습 예정일이 지남
 * - attempted: 못 푼 채 정답을 본 문제의 "다시 풀기" 예정일이 지남 (lib/learning/progress.ts progressAfterReveal)
 */
function isReviewDue(progress: ProgressInfo | undefined, now: Date): boolean {
  return progress !== undefined && progress.nextReviewAt !== null && new Date(progress.nextReviewAt) <= now;
}

export function isEligible(
  c: Candidate,
  input: RecommendationInput,
  opts: { language: Language | null; difficulty: number | null; recentDays: number },
): boolean {
  if (input.excludeIds.has(c.id)) return false;
  if (opts.language && !c.languages.includes(opts.language)) return false;
  if (opts.difficulty !== null && c.difficulty !== opts.difficulty) return false;
  const progress = input.progress.get(c.id);
  const reviewDue = isReviewDue(progress, input.now);
  // 다시 풀 때가 된 문제는 "최근에 낸 문제 제외"보다 우선한다. (오늘의 문제로 나왔다가 정답을 본 문제도 3일 뒤 다시 나오게)
  // 매일 반복되지 않는 것은 예정일을 뒤로 미루는 쪽(nextProgress)이 보장한다.
  const lastDaily = input.recentDaily.get(c.id);
  if (!reviewDue && lastDaily && daysBetween(lastDaily, input.today) < opts.recentDays) return false;
  if (progress?.status === "solved" && !reviewDue) return false;
  return true;
}

/** 이 언어로 풀 때 점수에 반영되는 태그 (#20 skillsForSubmission과 같은 규칙) */
function relevantTags(c: Candidate, language: Language): ProblemTag[] {
  return c.tags.filter((t) => t.type === "algorithm" || t.type === "data_structure" || t.type === language);
}

export type ScoreBreakdown = Record<keyof typeof RECOMMENDATION_CONFIG.weights, number> & { total: number };

export function scoreCandidate(c: Candidate, language: Language, input: RecommendationInput): ScoreBreakdown {
  const cfg = RECOMMENDATION_CONFIG;
  const skillMap = new Map(input.skills.map((s) => [`${s.category}:${s.skill}`, s]));
  const tags = relevantTags(c, language);
  const skills = tags.map((t) => skillMap.get(`${t.type}:${t.key}`));
  const measured = skills.filter((s): s is UserSkill => s !== undefined && s.attempts > 0);
  const avg = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

  const daysSince = (s: UserSkill) =>
    s.lastPracticedAt ? (input.now.getTime() - new Date(s.lastPracticedAt).getTime()) / 86_400_000 : cfg.stalenessDays;

  const parts = {
    // 측정 전 태그는 중립(0.5)으로 본다.
    weakness: avg(skills.map((s) => (s && s.attempts > 0 ? (100 - s.score) / 100 : 0.5))),
    recentFail: tags.some((t) => input.recentFailTags.has(t.key)) ? 1 : 0,
    staleness: avg(measured.map((s) => Math.min(1, daysSince(s) / cfg.stalenessDays))),
    reviewDue: isReviewDue(input.progress.get(c.id), input.now) ? 1 : 0,
    // 새 개념은 현재 수준 이하 문제에서만 소개한다.
    novelty: c.difficulty <= Math.round(input.currentDifficulty) && tags.length ? 1 - measured.length / tags.length : 0,
    underPractice: (() => {
      const ds = tags.filter((t) => t.type === "data_structure");
      if (!ds.length) return 0;
      return ds.filter((t) => (skillMap.get(`${t.type}:${t.key}`)?.attempts ?? 0) < cfg.underPracticeAttempts).length / ds.length;
    })(),
    tooEasy: measured.length
      ? measured.filter((s) => s.score >= cfg.tooEasy.score && daysSince(s) <= cfg.tooEasy.withinDays).length / measured.length
      : 0,
  };

  const total = (Object.keys(parts) as (keyof typeof parts)[]).reduce((sum, k) => sum + cfg.weights[k] * parts[k], 0);
  return { ...parts, total };
}

/** 점수 비례로 상위 K개 중 하나를 고른다. */
function weightedPick<T extends { score: number }>(items: T[], random: Random): T {
  const top = [...items].sort((a, b) => b.score - a.score).slice(0, RECOMMENDATION_CONFIG.topK);
  const min = Math.min(...top.map((i) => i.score));
  const weights = top.map((i) => i.score - min + 0.05);
  let r = random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < top.length; i++) {
    r -= weights[i];
    if (r <= 0) return top[i];
  }
  return top[top.length - 1];
}

/** 가장 크게 작용한 요소로 추천 이유를 만든다. */
export function explainChoice(c: Candidate, language: Language, breakdown: ScoreBreakdown, input: RecommendationInput): string {
  const tags = relevantTags(c, language);
  const skillMap = new Map(input.skills.map((s) => [`${s.category}:${s.skill}`, s]));
  const name = (pick: (t: ProblemTag) => boolean) => {
    const t = tags.find(pick);
    return t ? tagLabel(t.key) : null;
  };

  if (breakdown.reviewDue) {
    return input.progress.get(c.id)?.status === "solved"
      ? "예전에 푼 문제를 다시 풀어볼 때가 됐어요. 오래 기억하려면 복습이 중요해요."
      : "정답을 확인하고 넘어갔던 문제예요. 이제 스스로 다시 풀어볼 차례예요.";
  }
  if (breakdown.recentFail) {
    const tag = name((t) => input.recentFailTags.has(t.key));
    if (tag) return `최근에 어려워했던 ${tag}을(를) 다시 연습해봐요.`;
  }
  const weakest = tags
    .map((t) => ({ t, s: skillMap.get(`${t.type}:${t.key}`) }))
    .filter((x) => x.s && x.s.attempts > 0 && x.s.score < 50)
    .sort((a, b) => a.s!.score - b.s!.score)[0];
  if (weakest) return `아직 약한 ${tagLabel(weakest.t.key)}을(를) 연습할 차례예요.`;
  if (breakdown.novelty >= 0.5) {
    const tag = name((t) => !skillMap.get(`${t.type}:${t.key}`)?.attempts);
    if (tag) return `새로운 개념 ${tag}을(를) 만나볼 차례예요.`;
  }
  if (c.difficulty > Math.round(input.currentDifficulty)) return "조금 어려운 도전 문제예요. 막히면 힌트를 활용해보세요.";
  if (c.difficulty < Math.round(input.currentDifficulty)) return "가볍게 감을 유지하는 복습 문제예요.";
  return "지금 실력에 딱 맞는 문제예요.";
}

// ---------------------------------------------------------------------------
// ⑤ 추천 / 랜덤
// ---------------------------------------------------------------------------

/**
 * 오늘의 문제 추천.
 * 후보가 없으면 조건을 차례로 완화한다: 다른 난이도 → 중복 제외 기간 단축 → 다른 언어 → 남은 아무 문제
 */
export function recommendProblem(input: RecommendationInput): Recommendation | null {
  const cfg = RECOMMENDATION_CONFIG;
  const preferred = pickLanguage(input.javaRatio, input.recentLanguageCounts, input.random);
  const band = pickDifficultyBand(input.currentDifficulty, input.random);
  const other: Language = preferred === "java" ? "c" : "java";

  // 못 푼 채 정답을 본 문제의 "다시 풀기"는 난이도 구간·점수와 상관없이 먼저 낸다. (가장 오래 기다린 것부터)
  // 난이도 구간 안에서만 경쟁하면 그 구간이 뽑히는 날에만 나와서, 사실상 다시 안 나올 수 있다.
  // 푼 문제의 복습은 새 학습을 밀어내지 않도록 기존처럼 점수로만 우대한다.
  const retry = input.candidates
    .filter((c) => !input.excludeIds.has(c.id))
    .map((c) => ({ c, progress: input.progress.get(c.id) }))
    .filter(({ progress }) => progress?.status === "attempted" && isReviewDue(progress, input.now))
    .sort((a, b) => a.progress!.nextReviewAt!.localeCompare(b.progress!.nextReviewAt!))[0];
  if (retry) {
    const language = retry.c.languages.includes(preferred) ? preferred : retry.c.languages[0];
    const breakdown = scoreCandidate(retry.c, language, input);
    return { problem: retry.c, language, reason: explainChoice(retry.c, language, breakdown, input) };
  }

  const attempts: { language: Language | null; difficulty: number | null; recentDays: number }[] = [
    { language: preferred, difficulty: band, recentDays: cfg.recentDays },
    { language: preferred, difficulty: null, recentDays: cfg.recentDays },
    { language: preferred, difficulty: null, recentDays: cfg.relaxedRecentDays },
    { language: other, difficulty: null, recentDays: cfg.relaxedRecentDays },
    { language: null, difficulty: null, recentDays: 1 },
  ];

  for (const opts of attempts) {
    const pool = input.candidates.filter((c) => isEligible(c, input, opts));
    if (pool.length === 0) continue;

    const scored = pool.map((c) => {
      const language = opts.language ?? (c.languages.includes(preferred) ? preferred : c.languages[0]);
      const breakdown = scoreCandidate(c, language, input);
      // 난이도 구간을 넓혔을 때는 목표 구간에 가까운 문제를 우선한다.
      const distance = opts.difficulty === null ? Math.abs(c.difficulty - band) * 0.1 : 0;
      return { c, language, breakdown, score: breakdown.total - distance };
    });
    const chosen = weightedPick(scored, input.random);
    return { problem: chosen.c, language: chosen.language, reason: explainChoice(chosen.c, chosen.language, chosen.breakdown, input) };
  }
  return null;
}

/** 랜덤 모드: 추천 점수를 무시하고 고른다. (최근 낸 문제와 지금 문제는 제외, 언어 비율은 따름) */
export function randomProblem(input: RecommendationInput): Recommendation | null {
  const language = pickLanguage(input.javaRatio, input.recentLanguageCounts, input.random);
  const recentDays = RECOMMENDATION_CONFIG.recentDays;
  const pool =
    [input.candidates.filter((c) => isEligible(c, input, { language, difficulty: null, recentDays }))]
      .concat([input.candidates.filter((c) => isEligible(c, input, { language: null, difficulty: null, recentDays: 1 }))])
      .find((p) => p.length > 0) ?? [];
  if (pool.length === 0) return null;
  const problem = pool[Math.floor(input.random() * pool.length)];
  return {
    problem,
    language: problem.languages.includes(language) ? language : problem.languages[0],
    reason: "랜덤으로 고른 문제예요. 새로운 유형을 만나볼 수 있어요.",
  };
}
