export type SkillCategory = "algorithm" | "data_structure" | "java" | "c";

export type UserSkill = {
  category: SkillCategory;
  /** problem_tags.key와 같은 값 */
  skill: string;
  /** 0~100 */
  score: number;
  /** 0이면 아직 측정되지 않은 Skill (0점과 구분) */
  attempts: number;
  correct: number;
  lastPracticedAt: string | null;
};
