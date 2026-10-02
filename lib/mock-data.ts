/**
 * 임시 데이터 — Supabase 연동(Phase 2~3) 전까지 화면 구조를 확인하기 위한 값.
 * 실제 데이터로 교체하면 이 파일을 삭제한다.
 */
import type { UserSkill } from "@/types/skill";
import type { UserPreferences, UserStats } from "@/types/user";

export const mockStats: UserStats = {
  currentDifficulty: 3.2,
  streak: 12,
  longestStreak: 18,
  solvedCount: 47,
  accuracy: 0.76,
  avgSolvingMinutes: 28,
  javaSolved: 35,
  cSolved: 12,
};

export const mockSkills: UserSkill[] = [
  { category: "algorithm", skill: "sorting", score: 82, attempts: 14, correct: 12, lastPracticedAt: "2026-09-28" },
  { category: "algorithm", skill: "binary-search", score: 65, attempts: 6, correct: 4, lastPracticedAt: "2026-09-20" },
  { category: "algorithm", skill: "dfs", score: 48, attempts: 5, correct: 2, lastPracticedAt: "2026-09-25" },
  { category: "algorithm", skill: "bfs", score: 40, attempts: 4, correct: 2, lastPracticedAt: "2026-09-26" },
  { category: "algorithm", skill: "dp", score: 31, attempts: 3, correct: 1, lastPracticedAt: "2026-09-15" },
  { category: "algorithm", skill: "greedy", score: 0, attempts: 0, correct: 0, lastPracticedAt: null },
  { category: "data_structure", skill: "array", score: 85, attempts: 20, correct: 18, lastPracticedAt: "2026-09-30" },
  { category: "data_structure", skill: "hashmap", score: 78, attempts: 11, correct: 9, lastPracticedAt: "2026-09-29" },
  { category: "data_structure", skill: "stack", score: 60, attempts: 5, correct: 4, lastPracticedAt: "2026-09-18" },
  { category: "data_structure", skill: "queue", score: 44, attempts: 4, correct: 2, lastPracticedAt: "2026-09-26" },
  { category: "java", skill: "collection", score: 75, attempts: 15, correct: 12, lastPracticedAt: "2026-09-29" },
  { category: "java", skill: "oop", score: 61, attempts: 7, correct: 5, lastPracticedAt: "2026-09-22" },
  { category: "java", skill: "generic", score: 50, attempts: 3, correct: 2, lastPracticedAt: "2026-09-10" },
  { category: "c", skill: "pointer", score: 49, attempts: 6, correct: 3, lastPracticedAt: "2026-09-27" },
  { category: "c", skill: "struct", score: 42, attempts: 3, correct: 1, lastPracticedAt: "2026-09-19" },
];

/** 학습 현황 화면(#25)에서 실제 데이터로 바꾸면 이 파일을 삭제한다. */
export const mockWeaknesses = ["dfs", "bfs", "dp"];

export const mockPreferences: UserPreferences = {
  javaRatio: 70,
  preferredDifficulty: null,
  timezone: "Asia/Seoul",
};
