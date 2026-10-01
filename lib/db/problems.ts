import "server-only";
import { escapeLikePattern, type ProblemFilters } from "@/lib/problems/filters";
import { createClient } from "@/lib/supabase/server";
import type { Language, ProblemListItem, ProblemStatus, ProblemTag } from "@/types/problem";

type TagRow = { tag_type: string; tag: string };

const TAG_TYPES = new Set<ProblemTag["type"]>(["algorithm", "data_structure", "java", "c"]);

export function toProblemTags(rows: TagRow[]): ProblemTag[] {
  return rows
    .filter((r): r is { tag_type: ProblemTag["type"]; tag: string } => TAG_TYPES.has(r.tag_type as ProblemTag["type"]))
    .map((r) => ({ type: r.tag_type, key: r.tag }));
}

/** 태그 조건(algorithm, data_structure)을 모두 만족하는 문제 id. 조건이 없으면 null(=제한 없음). */
async function problemIdsWithTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: ProblemFilters,
): Promise<string[] | null> {
  const conditions = [
    filters.algorithm && { type: "algorithm", tag: filters.algorithm },
    filters.dataStructure && { type: "data_structure", tag: filters.dataStructure },
  ].filter((c): c is { type: string; tag: string } => Boolean(c));
  if (conditions.length === 0) return null;

  const matches: Set<string>[] = [];
  for (const { type, tag } of conditions) {
    const { data, error } = await supabase.from("problem_tags").select("problem_id").eq("tag_type", type).eq("tag", tag);
    if (error) throw error;
    matches.push(new Set(data.map((r) => r.problem_id)));
  }
  // 모든 조건을 만족하는 문제만 남긴다. (교집합)
  const [firstMatch, ...rest] = matches;
  return [...firstMatch].filter((id) => rest.every((set) => set.has(id)));
}

/**
 * 공개된 문제 목록. userId가 있으면 사용자의 풀이 상태(해결/시도)를 함께 붙인다.
 * 조회 권한은 RLS가 결정한다. (비공개 문제는 DB가 돌려주지 않음)
 */
export async function listProblems(filters: ProblemFilters, userId: string | null): Promise<ProblemListItem[]> {
  const supabase = await createClient();

  const tagMatchedIds = await problemIdsWithTags(supabase, filters);
  if (tagMatchedIds?.length === 0) return [];

  let query = supabase
    .from("problems")
    .select("id, slug, title, difficulty, estimated_minutes, languages, problem_tags(tag_type, tag)")
    .eq("is_published", true)
    .order("difficulty")
    .order("title");

  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);
  if (filters.language) query = query.contains("languages", [filters.language]);
  if (filters.q) query = query.ilike("title", `%${escapeLikePattern(filters.q)}%`);
  if (tagMatchedIds) query = query.in("id", tagMatchedIds);

  const { data: problems, error } = await query;
  if (error) throw error;

  const statusById = new Map<string, ProblemStatus>();
  if (userId) {
    const { data: progress, error: progressError } = await supabase
      .from("user_problem_progress")
      .select("problem_id, status")
      .eq("user_id", userId);
    if (progressError) throw progressError;
    for (const row of progress) statusById.set(row.problem_id, row.status === "solved" ? "solved" : "attempted");
  }

  const items: ProblemListItem[] = problems.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
    estimatedMinutes: p.estimated_minutes,
    languages: p.languages.filter((l): l is Language => l === "java" || l === "c"),
    tags: toProblemTags(p.problem_tags),
    status: statusById.get(p.id) ?? "unsolved",
  }));

  return filters.status ? items.filter((item) => item.status === filters.status) : items;
}
