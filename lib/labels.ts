import { TAGS } from "@/content/tags";
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

// 태그 표시 이름은 문제 콘텐츠와 같은 목록(content/tags.ts)을 쓴다.
// 같은 키가 여러 종류에 있어도(예: string) 표시 이름은 같다.
const TAG_LABELS: Record<string, string> = Object.assign({}, ...Object.values(TAGS));

/** 등록되지 않은 태그는 키를 그대로 보여준다. */
export function tagLabel(key: string): string {
  return TAG_LABELS[key] ?? key;
}
