import type { Language } from "@/types/problem";
import type { SkillCategory } from "@/types/skill";

export const LANGUAGE_LABELS: Record<Language, string> = {
  java: "Java",
  c: "C",
};

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: "기초",
  2: "초급",
  3: "중급",
  4: "중상급",
  5: "고급",
};

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  algorithm: "알고리즘",
  data_structure: "자료구조",
  java: "Java",
  c: "C",
};

const TAG_LABELS: Record<string, string> = {
  "brute-force": "Brute Force",
  sorting: "Sorting",
  "binary-search": "Binary Search",
  "prefix-sum": "Prefix Sum",
  "two-pointer": "Two Pointer",
  "sliding-window": "Sliding Window",
  greedy: "Greedy",
  dfs: "DFS",
  bfs: "BFS",
  dp: "DP",
  "frequency-count": "Frequency Count",
  array: "Array",
  string: "String",
  stack: "Stack",
  queue: "Queue",
  hashmap: "HashMap",
  hashset: "HashSet",
  graph: "Graph",
  "basic-syntax": "Basic Syntax",
  oop: "OOP",
  collection: "Collection",
  generic: "Generic",
  pointer: "Pointer",
  struct: "Struct",
};

/** 등록되지 않은 태그는 키를 그대로 보여준다. */
export function tagLabel(key: string): string {
  return TAG_LABELS[key] ?? key;
}
