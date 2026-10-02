/**
 * 임시 데이터 — Supabase 연동(Phase 2~3) 전까지 화면 구조를 확인하기 위한 값.
 * 실제 데이터로 교체하면 이 파일을 삭제한다.
 */
import type { ProblemStatus, ProblemSummary } from "@/types/problem";
import type { UserSkill } from "@/types/skill";
import type { Submission } from "@/types/submission";
import type { UserPreferences, UserStats } from "@/types/user";

export const mockProblems: (ProblemSummary & { status: ProblemStatus })[] = [
  {
    id: "p1",
    slug: "word-frequency",
    title: "단어 빈도 세기",
    difficulty: 2,
    estimatedMinutes: 20,
    languages: ["java"],
    tags: [
      { type: "algorithm", key: "frequency-count" },
      { type: "data_structure", key: "hashmap" },
      { type: "java", key: "collection" },
    ],
    status: "solved",
  },
  {
    id: "p2",
    slug: "pair-sum",
    title: "합이 K인 두 수",
    difficulty: 3,
    estimatedMinutes: 30,
    languages: ["java", "c"],
    tags: [
      { type: "algorithm", key: "two-pointer" },
      { type: "algorithm", key: "sorting" },
      { type: "data_structure", key: "array" },
      { type: "c", key: "pointer" },
    ],
    status: "attempted",
  },
  {
    id: "p3",
    slug: "maze-shortest-path",
    title: "미로 최단 거리",
    difficulty: 3,
    estimatedMinutes: 40,
    languages: ["java"],
    tags: [
      { type: "algorithm", key: "bfs" },
      { type: "data_structure", key: "queue" },
      { type: "data_structure", key: "graph" },
    ],
    status: "unsolved",
  },
  {
    id: "p4",
    slug: "valid-brackets",
    title: "올바른 괄호",
    difficulty: 1,
    estimatedMinutes: 15,
    languages: ["java", "c"],
    tags: [
      { type: "data_structure", key: "stack" },
      { type: "data_structure", key: "string" },
    ],
    status: "solved",
  },
  {
    id: "p5",
    slug: "student-records",
    title: "학생 성적 정렬",
    difficulty: 2,
    estimatedMinutes: 25,
    languages: ["c"],
    tags: [
      { type: "algorithm", key: "sorting" },
      { type: "c", key: "struct" },
    ],
    status: "unsolved",
  },
  {
    id: "p6",
    slug: "stair-climbing",
    title: "계단 오르기",
    difficulty: 4,
    estimatedMinutes: 45,
    languages: ["java", "c"],
    tags: [{ type: "algorithm", key: "dp" }],
    status: "unsolved",
  },
];

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

/** 강점·취약점은 Phase 7에서 Skill 점수로 계산한다. */
export const mockStrengths = ["array", "sorting", "hashmap"];
export const mockWeaknesses = ["dfs", "bfs", "dp"];

export const mockRecentSubmissions: Submission[] = [
  { id: "s1", problemId: "p1", language: "java", result: "self_correct", solvingTimeSec: 1080, hintCount: 0, attemptCount: 1, solutionRevealed: false, createdAt: "2026-09-30T13:20:00Z" },
  { id: "s2", problemId: "p2", language: "c", result: "self_wrong", solvingTimeSec: 2400, hintCount: 3, attemptCount: 2, solutionRevealed: false, createdAt: "2026-09-29T12:05:00Z" },
  { id: "s3", problemId: "p4", language: "java", result: "self_correct", solvingTimeSec: 600, hintCount: 1, attemptCount: 1, solutionRevealed: false, createdAt: "2026-09-28T11:40:00Z" },
];

export const mockPreferences: UserPreferences = {
  javaRatio: 70,
  preferredDifficulty: null,
  timezone: "Asia/Seoul",
};
