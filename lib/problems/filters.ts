import { TAGS } from "@/content/tags";
import type { Language, ProblemStatus } from "@/types/problem";

/** 문제 목록 필터. URL 쿼리(?difficulty=2&language=java ...)와 1:1로 대응한다. */
export type ProblemFilters = {
  q?: string;
  difficulty?: number;
  language?: Language;
  algorithm?: string;
  dataStructure?: string;
  status?: ProblemStatus;
};

export const MAX_QUERY_LENGTH = 50;

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  const trimmed = v?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * URL 쿼리를 검증해 필터로 바꾼다. 허용되지 않는 값은 오류 대신 조용히 무시한다.
 * (사용자가 주소를 직접 고쳐도 페이지가 깨지지 않고, DB에 이상한 값이 전달되지 않게)
 */
export function parseProblemFilters(params: SearchParams): ProblemFilters {
  const filters: ProblemFilters = {};

  const q = first(params.q);
  if (q) filters.q = q.slice(0, MAX_QUERY_LENGTH);

  const difficulty = Number(first(params.difficulty));
  if (Number.isInteger(difficulty) && difficulty >= 1 && difficulty <= 5) filters.difficulty = difficulty;

  const language = first(params.language);
  if (language === "java" || language === "c") filters.language = language;

  const algorithm = first(params.algorithm);
  if (algorithm && algorithm in TAGS.algorithm) filters.algorithm = algorithm;

  const dataStructure = first(params.ds);
  if (dataStructure && dataStructure in TAGS.data_structure) filters.dataStructure = dataStructure;

  const status = first(params.status);
  if (status === "solved" || status === "attempted" || status === "unsolved") filters.status = status;

  return filters;
}

export function hasActiveFilters(filters: ProblemFilters): boolean {
  return Object.values(filters).some((v) => v !== undefined);
}

/** ILIKE 검색어의 와일드카드(%, _)와 이스케이프 문자를 글자 그대로 검색되게 바꾼다. */
export function escapeLikePattern(text: string): string {
  return text.replace(/[\\%_]/g, (c) => `\\${c}`);
}
