import "server-only";
import { getUserSkills, saveUserSkills } from "@/lib/db/skills";
import { performanceScore, type PerformanceInput } from "@/lib/learning/performance";
import { isCorrectResult } from "@/lib/learning/progress";
import { skillsForSubmission, type SkillSummary, summarizeSkills, updateSkill } from "@/lib/skills/skillCalculator";
import type { Language, ProblemTag } from "@/types/problem";
import type { SkillChange } from "@/types/submission";

/**
 * 제출 한 번을 사용자 Skill 점수에 반영한다.
 * 문제 태그 중 이번 제출과 관련된 Skill만 갱신하고, 바뀐 내용(전후 점수)을 돌려준다.
 */
export async function applySubmissionToSkills(params: {
  userId: string;
  tags: ProblemTag[];
  language: Language;
  difficulty: number;
  performanceInput: PerformanceInput;
  now: Date;
}): Promise<{ performance: number; changes: SkillChange[] }> {
  const refs = skillsForSubmission(params.tags, params.language);
  const performance = performanceScore(params.performanceInput);
  if (refs.length === 0) return { performance, changes: [] };

  const existing = new Map((await getUserSkills(params.userId)).map((s) => [`${s.category}:${s.skill}`, s]));
  const correct = isCorrectResult(params.performanceInput.result);

  const updated = refs.map((ref) =>
    updateSkill({
      previous: existing.get(`${ref.category}:${ref.skill}`) ?? null,
      ref,
      performance,
      difficulty: params.difficulty,
      correct,
      now: params.now,
    }),
  );
  await saveUserSkills(params.userId, updated);

  return {
    performance,
    changes: updated.map((s) => ({
      category: s.category,
      skill: s.skill,
      before: existing.get(`${s.category}:${s.skill}`)?.score ?? null,
      after: s.score,
    })),
  };
}

/** 대시보드·학습 현황용 강점·취약점·복습 추천 */
export async function getSkillSummary(userId: string, now = new Date()): Promise<SkillSummary> {
  return summarizeSkills(await getUserSkills(userId), now);
}
