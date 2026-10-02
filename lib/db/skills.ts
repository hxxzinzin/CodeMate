import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SkillCategory, UserSkill } from "@/types/skill";

/** 사용자 Skill 점수 DB 접근. 사용자 세션으로 동작해 RLS가 본인 행만 허용한다. */

const CATEGORIES = new Set<SkillCategory>(["algorithm", "data_structure", "java", "c"]);

type SkillRow = {
  category: string;
  skill: string;
  score: number;
  attempts: number;
  correct: number;
  last_practiced_at: string | null;
};

function toUserSkill(row: SkillRow): UserSkill | null {
  if (!CATEGORIES.has(row.category as SkillCategory)) return null;
  return {
    category: row.category as SkillCategory,
    skill: row.skill,
    // numeric 컬럼은 문자열로 올 수 있어 숫자로 바꾼다.
    score: Number(row.score),
    attempts: row.attempts,
    correct: row.correct,
    lastPracticedAt: row.last_practiced_at,
  };
}

export async function getUserSkills(userId: string): Promise<UserSkill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_skills")
    .select("category, skill, score, attempts, correct, last_practiced_at")
    .eq("user_id", userId);
  if (error) throw error;
  return data.flatMap((row) => toUserSkill(row) ?? []);
}

export async function saveUserSkills(userId: string, skills: UserSkill[]): Promise<void> {
  if (skills.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("user_skills").upsert(
    skills.map((s) => ({
      user_id: userId,
      category: s.category,
      skill: s.skill,
      score: s.score,
      attempts: s.attempts,
      correct: s.correct,
      last_practiced_at: s.lastPracticedAt,
    })),
    { onConflict: "user_id,category,skill" },
  );
  if (error) throw error;
}
