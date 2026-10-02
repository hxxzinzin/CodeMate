import { round2 } from "@/lib/learning/performance";
import type { Language, ProblemTag } from "@/types/problem";
import type { SkillCategory, UserSkill } from "@/types/skill";

/**
 * 분야별 Skill 점수 (0~100). 규칙 기반이며, 나중에 다른 계산 방식으로 바꿀 수 있도록 이 파일에 모은다. (ADR-004)
 *
 *   목표 = 수행 점수 p × (40 + 12 × 문제 난이도), 상한 100
 *     → Lv1을 완벽히 풀면 52, Lv5를 완벽히 풀면 100. 쉬운 문제만 풀어서는 고득점이 나오지 않는다.
 *   α   = max(0.15, 1 / (지금까지 시도 수 + 1))
 *     → 처음엔 결과를 크게 반영하고, 데이터가 쌓이면 한 번의 결과로 크게 흔들리지 않는다.
 *   새 점수 = 점수 + α × (목표 − 점수)
 */

export const MIN_LEARNING_RATE = 0.15;

export function targetScore(performance: number, difficulty: number): number {
  return Math.min(100, Math.max(0, performance * (40 + 12 * difficulty)));
}

export function learningRate(previousAttempts: number): number {
  return Math.max(MIN_LEARNING_RATE, 1 / (Math.max(0, previousAttempts) + 1));
}

export type SkillRef = { category: SkillCategory; skill: string };

/**
 * 제출에 반영할 Skill 목록.
 * 알고리즘·자료구조 태그는 항상, Java/C 개념 태그는 실제로 제출한 언어일 때만 반영한다.
 * (C로 풀었는데 Java Collection 점수가 오르면 안 된다)
 */
export function skillsForSubmission(tags: ProblemTag[], language: Language): SkillRef[] {
  const seen = new Set<string>();
  return tags
    .filter((t) => t.type === "algorithm" || t.type === "data_structure" || t.type === language)
    .map((t) => ({ category: t.type, skill: t.key }))
    .filter((ref) => {
      const key = `${ref.category}:${ref.skill}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export type SkillUpdateInput = {
  /** 기존 점수. 처음이면 null */
  previous: UserSkill | null;
  ref: SkillRef;
  performance: number;
  difficulty: number;
  correct: boolean;
  now: Date;
};

export function updateSkill({ previous, ref, performance, difficulty, correct, now }: SkillUpdateInput): UserSkill {
  const score = previous?.score ?? 0;
  const attempts = previous?.attempts ?? 0;
  const next = score + learningRate(attempts) * (targetScore(performance, difficulty) - score);

  return {
    category: ref.category,
    skill: ref.skill,
    score: round2(Math.min(100, Math.max(0, next))),
    attempts: attempts + 1,
    correct: (previous?.correct ?? 0) + (correct ? 1 : 0),
    lastPracticedAt: now.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// 강점·취약점·복습 추천
// ---------------------------------------------------------------------------

export const SKILL_THRESHOLDS = {
  strongScore: 70,
  strongMinAttempts: 3,
  weakScore: 50,
  weakAccuracy: 0.6,
  weakMinAttempts: 2,
  reviewAfterDays: 21,
} as const;

export type SkillStatus = "unmeasured" | "weak" | "strong" | "review" | "normal";

export function accuracy(skill: Pick<UserSkill, "attempts" | "correct">): number {
  return skill.attempts === 0 ? 0 : skill.correct / skill.attempts;
}

/**
 * - 측정 전: 한 번도 풀지 않음
 * - 취약: 2번 이상 풀었고 점수 50 미만이거나 정답률 60% 미만
 * - 강점: 3번 이상 풀었고 점수 70 이상
 * - 복습 추천: 강점이지만 21일 넘게 풀지 않음
 */
export function classifySkill(skill: UserSkill, now: Date): SkillStatus {
  const t = SKILL_THRESHOLDS;
  if (skill.attempts === 0) return "unmeasured";
  if (skill.attempts >= t.weakMinAttempts && (skill.score < t.weakScore || accuracy(skill) < t.weakAccuracy)) {
    return "weak";
  }
  if (skill.attempts >= t.strongMinAttempts && skill.score >= t.strongScore) {
    const last = skill.lastPracticedAt ? new Date(skill.lastPracticedAt).getTime() : 0;
    const days = (now.getTime() - last) / (24 * 60 * 60 * 1000);
    return days > t.reviewAfterDays ? "review" : "strong";
  }
  return "normal";
}

export type SkillSummary = {
  strengths: UserSkill[];
  weaknesses: UserSkill[];
  reviewRecommended: UserSkill[];
};

/** 대시보드용 요약. 강점은 점수 높은 순, 취약점은 낮은 순, 복습은 오래된 순으로 최대 limit개 */
export function summarizeSkills(skills: UserSkill[], now: Date, limit = 3): SkillSummary {
  const withStatus = skills.map((s) => ({ s, status: classifySkill(s, now) }));
  const pick = (status: SkillStatus) => withStatus.filter((x) => x.status === status).map((x) => x.s);

  return {
    strengths: pick("strong").sort((a, b) => b.score - a.score).slice(0, limit),
    weaknesses: pick("weak").sort((a, b) => a.score - b.score).slice(0, limit),
    reviewRecommended: pick("review")
      .sort((a, b) => (a.lastPracticedAt ?? "").localeCompare(b.lastPracticedAt ?? ""))
      .slice(0, limit),
  };
}
