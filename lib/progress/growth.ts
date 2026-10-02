import { z } from "zod";
import { TAGS } from "@/content/tags";
import { classifySkill, type SkillStatus } from "@/lib/skills/skillCalculator";
import type { SkillCategory, UserSkill } from "@/types/skill";

/** 학습 현황 화면 계산 (순수 함수). DB에서 읽은 기록을 화면에 맞게 가공한다. */

export const GROWTH_DAYS = 30;

// learning_history.metadata는 jsonb라 형식을 믿지 않고 검사한다. (예전 기록에는 변화량이 없다)
const historySchema = z.object({
  skillChanges: z
    .array(
      z.object({
        category: z.enum(["algorithm", "data_structure", "java", "c"]),
        skill: z.string(),
        before: z.number().nullable(),
        after: z.number(),
      }),
    )
    .optional(),
  difficultyChange: z.object({ before: z.number(), after: z.number() }).nullable().optional(),
});

export type HistoryEvent = { createdAt: string; metadata: unknown };

type ParsedEvent = { createdAt: string } & z.infer<typeof historySchema>;

function parseEvents(events: HistoryEvent[]): ParsedEvent[] {
  return events
    .flatMap((e) => {
      const parsed = historySchema.safeParse(e.metadata);
      return parsed.success ? [{ createdAt: e.createdAt, ...parsed.data }] : [];
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export type SkillGrowth = {
  category: SkillCategory;
  skill: string;
  /** 기간 시작 시점 점수. 기간 안에 처음 측정됐으면 null */
  from: number | null;
  to: number;
  delta: number;
};

/**
 * 기간 동안 Skill별 점수 변화. 기간 첫 기록의 before → 마지막 기록의 after.
 * 많이 오른 순서로, 처음 측정된 Skill은 0점에서 시작한 것으로 보지 않고 따로 표시한다.
 */
export function skillGrowth(events: HistoryEvent[], limit = 5): SkillGrowth[] {
  const map = new Map<string, SkillGrowth>();
  for (const e of parseEvents(events)) {
    for (const c of e.skillChanges ?? []) {
      const key = `${c.category}:${c.skill}`;
      const prev = map.get(key);
      if (prev) prev.to = c.after;
      else map.set(key, { category: c.category, skill: c.skill, from: c.before, to: c.after, delta: 0 });
    }
  }
  return [...map.values()]
    .map((g) => ({ ...g, delta: g.from === null ? 0 : g.to - g.from }))
    .filter((g) => g.from === null || Math.abs(g.delta) >= 0.5)
    .sort((a, b) => b.delta - a.delta || (a.from === null ? 1 : 0) - (b.from === null ? 1 : 0))
    .slice(0, limit);
}

export type DifficultyPoint = { at: string; value: number };

/**
 * 추천 난이도 변화 기록. 기간 첫 변화의 before를 시작점으로, 마지막 점은 현재 값으로 맞춘다.
 * 기록이 없으면 현재 값 한 점만 돌려준다.
 */
export function difficultyTimeline(events: HistoryEvent[], current: number, now: Date): DifficultyPoint[] {
  const changes = parseEvents(events).filter((e) => e.difficultyChange);
  const points: DifficultyPoint[] = [];
  if (changes.length > 0) points.push({ at: changes[0].createdAt, value: changes[0].difficultyChange!.before });
  for (const e of changes) points.push({ at: e.createdAt, value: e.difficultyChange!.after });
  points.push({ at: now.toISOString(), value: current });
  return points;
}

export type SkillRow = UserSkill & { label: string; status: SkillStatus };

export type CategoryProgress = {
  category: SkillCategory;
  /** 측정된 Skill (점수 높은 순) */
  measured: SkillRow[];
  /** 아직 한 번도 풀지 않은 Skill 이름 */
  unmeasured: string[];
  /** 측정된 Skill 평균. 없으면 null */
  average: number | null;
};

const CATEGORIES: SkillCategory[] = ["algorithm", "data_structure", "java", "c"];

/** 카테고리별로 전체 태그 목록(TAGS)과 내 Skill을 맞춰, 측정 전 Skill도 빠짐없이 보여준다. */
export function categoryProgress(skills: UserSkill[], now: Date): CategoryProgress[] {
  return CATEGORIES.map((category) => {
    const tags: Record<string, string> = TAGS[category];
    const mine = new Map(
      skills.filter((s) => s.category === category && s.attempts > 0).map((s) => [s.skill, s]),
    );
    const measured = [...mine.values()]
      .map((s) => ({ ...s, label: tags[s.skill] ?? s.skill, status: classifySkill(s, now) }))
      .sort((a, b) => b.score - a.score);
    const unmeasured = Object.entries(tags)
      .filter(([key]) => !mine.has(key))
      .map(([, label]) => label);
    const average = measured.length === 0 ? null : measured.reduce((sum, s) => sum + s.score, 0) / measured.length;
    return { category, measured, unmeasured, average };
  });
}
