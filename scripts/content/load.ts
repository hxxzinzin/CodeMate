import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { TAGS, type TagType } from "../../content/tags.ts";
import type { ContentLanguage, ProblemContent } from "../../content/types.ts";

export const PROBLEMS_DIR = path.resolve(import.meta.dirname, "../../content/problems");

/**
 * slug → UUID (SHA-1 기반, RFC 4122 v5 형식).
 * 같은 slug는 항상 같은 id라서 seed와 클라우드 동기화(sync)를 여러 번 해도 행이 늘지 않는다.
 */
export function problemId(slug: string): string {
  const h = createHash("sha1").update(`codemate:problem:${slug}`).digest();
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const hex = h.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export const SOLUTION_FILES: Record<ContentLanguage, string> = {
  java: "Main.java",
  c: "main.c",
};

export type LoadedProblem = {
  dir: string;
  problem: ProblemContent;
  /** 언어별 정답 코드 */
  code: Partial<Record<ContentLanguage, string>>;
};

/** content/problems 아래 모든 문제를 slug 순으로 읽는다. */
export async function loadProblems(onlySlugs: string[] = []): Promise<LoadedProblem[]> {
  const slugs = readdirSync(PROBLEMS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((slug) => onlySlugs.length === 0 || onlySlugs.includes(slug))
    .sort();

  const loaded: LoadedProblem[] = [];
  for (const slug of slugs) {
    const dir = path.join(PROBLEMS_DIR, slug);
    const mod = (await import(pathToFileURL(path.join(dir, "problem.ts")).href)) as { default: ProblemContent };
    const problem = mod.default;
    const code: LoadedProblem["code"] = {};
    for (const lang of problem.languages) {
      const file = path.join(dir, SOLUTION_FILES[lang]);
      if (existsSync(file)) code[lang] = readFileSync(file, "utf8");
    }
    loaded.push({ dir, problem, code });
  }
  return loaded;
}

/** 형식 검사. 문제가 없으면 빈 배열을 반환한다. */
export function validate({ dir, problem: p, code }: LoadedProblem): string[] {
  const errors: string[] = [];
  const dirName = path.basename(dir);

  if (p.slug !== dirName) errors.push(`slug(${p.slug})가 폴더 이름(${dirName})과 다릅니다`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) errors.push("slug는 kebab-case여야 합니다");
  if (!p.title || p.title.length > 100) errors.push("title은 1~100자여야 합니다");
  if (!(p.difficulty >= 1 && p.difficulty <= 5)) errors.push("difficulty는 1~5입니다");
  if (!(p.estimatedMinutes > 0)) errors.push("estimatedMinutes는 양수여야 합니다");
  if (p.languages.length === 0) errors.push("languages가 비어 있습니다");

  for (const field of ["description", "input", "output", "constraints", "solution"] as const) {
    if (!p[field]?.trim()) errors.push(`${field}가 비어 있습니다`);
  }
  if (p.hints.length !== 4 || p.hints.some((h) => !h.trim())) errors.push("hints는 비어 있지 않은 4개여야 합니다");
  if (p.examples.length < 1) errors.push("examples가 1개 이상 필요합니다");
  if (p.examples.some((e) => !e.explanation.trim())) errors.push("모든 예제에 explanation이 필요합니다");
  if (p.tests.length < 3) errors.push("tests가 3개 이상 필요합니다 (경계값 포함)");

  const tagCount = Object.values(p.tags).reduce((n, list) => n + (list?.length ?? 0), 0);
  if (tagCount === 0) errors.push("태그가 하나 이상 필요합니다");
  for (const [type, keys] of Object.entries(p.tags) as [TagType, string[] | undefined][]) {
    for (const key of keys ?? []) {
      if (!(key in TAGS[type])) errors.push(`알 수 없는 태그: ${type}/${key} (content/tags.ts에 추가 필요)`);
    }
  }
  if (p.tags.java?.length && !p.languages.includes("java")) errors.push("java 태그가 있지만 languages에 java가 없습니다");
  if (p.tags.c?.length && !p.languages.includes("c")) errors.push("c 태그가 있지만 languages에 c가 없습니다");

  for (const lang of p.languages) {
    if (!code[lang]) errors.push(`${SOLUTION_FILES[lang]} 파일이 없습니다`);
  }
  return errors;
}
