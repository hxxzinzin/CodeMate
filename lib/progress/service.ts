import "server-only";
import { getCurrentDifficulty } from "@/lib/db/learning";
import { getSubmissionHistory } from "@/lib/db/progress";
import { getUserSkills } from "@/lib/db/skills";
import {
  type CategoryProgress,
  categoryProgress,
  type DifficultyPoint,
  difficultyTimeline,
  GROWTH_DAYS,
  type SkillGrowth,
  skillGrowth,
} from "@/lib/progress/growth";
import { summarizeSkills } from "@/lib/skills/skillCalculator";
import type { UserSkill } from "@/types/skill";

export type ProgressData = {
  currentDifficulty: number;
  difficulty: DifficultyPoint[];
  growth: SkillGrowth[];
  reviewRecommended: UserSkill[];
  categories: CategoryProgress[];
};

export async function getProgressData(userId: string, now = new Date()): Promise<ProgressData> {
  const since = new Date(now.getTime() - GROWTH_DAYS * 86_400_000).toISOString();
  const [skills, currentDifficulty, history] = await Promise.all([
    getUserSkills(userId),
    getCurrentDifficulty(userId),
    getSubmissionHistory(userId, since),
  ]);
  return {
    currentDifficulty,
    difficulty: difficultyTimeline(history, currentDifficulty, now),
    growth: skillGrowth(history),
    reviewRecommended: summarizeSkills(skills, now, 5).reviewRecommended,
    categories: categoryProgress(skills, now),
  };
}
