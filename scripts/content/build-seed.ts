/**
 * content/problems → supabase/seed.sql
 *   node scripts/content/build-seed.ts
 *
 * - 문제 id는 slug로부터 결정적으로 만든 UUID다. 같은 문제를 여러 번 seed해도 행이 늘어나지 않는다. (멱등)
 * - 태그·힌트는 지우고 다시 넣고, 문제·해설은 upsert한다.
 * - 채점 테스트케이스 = 예제(is_sample) + 숨김 테스트. 지우고 다시 넣는다.
 */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { loadProblems, validate } from "./load.ts";

const OUTPUT = path.resolve(import.meta.dirname, "../../supabase/seed.sql");

/** slug → UUID (SHA-1 기반, RFC 4122 v5 형식) */
function problemId(slug: string): string {
  const h = createHash("sha1").update(`codemate:problem:${slug}`).digest();
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const hex = h.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/** SQL 문자열 리터럴. standard_conforming_strings가 켜져 있으므로 작은따옴표만 이스케이프하면 된다. */
const lit = (value: string) => `'${value.replace(/'/g, "''")}'`;
const jsonb = (value: unknown) => `${lit(JSON.stringify(value))}::jsonb`;

const problems = await loadProblems();
const invalid = problems.map((p) => ({ slug: p.problem.slug, errors: validate(p) })).filter((p) => p.errors.length > 0);
if (invalid.length > 0) {
  for (const p of invalid) console.error(`✗ ${p.slug}: ${p.errors.join(", ")}`);
  process.exit(1);
}

const statements: string[] = [];
for (const { problem: p, code } of problems) {
  const id = lit(problemId(p.slug));
  const examples = p.examples.map(({ input, output, explanation }) => ({ input, output, explanation }));

  statements.push(`-- ${p.slug}: ${p.title}
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  (${id}, ${lit(p.slug)}, ${lit(p.title)}, ${lit(p.description)}, ${lit(p.input)}, ${lit(p.output)}, ${lit(p.constraints)},
   ${jsonb(examples)}, ${p.difficulty}, ${p.estimatedMinutes}, array[${p.languages.map(lit).join(", ")}], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = ${id};
insert into public.problem_tags (problem_id, tag_type, tag) values
${Object.entries(p.tags).flatMap(([type, keys]) => (keys ?? []).map((key) => `  (${id}, ${lit(type)}, ${lit(key)})`)).join(",\n")};

delete from public.problem_hints where problem_id = ${id};
insert into public.problem_hints (problem_id, level, content) values
${p.hints.map((h, i) => `  (${id}, ${i + 1}, ${lit(h)})`).join(",\n")};

insert into public.problem_solutions (problem_id, explanation, reference_code)
values (${id}, ${lit(p.solution)}, ${jsonb(code)})
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

delete from public.problem_test_cases where problem_id = ${id};
insert into public.problem_test_cases (problem_id, ord, input, expected_output, is_sample) values
${[...p.examples.map((t) => ({ ...t, sample: true })), ...p.tests.map((t) => ({ ...t, sample: false }))]
  .map((t, i) => `  (${id}, ${i}, ${lit(t.input)}, ${lit(t.output)}, ${t.sample})`)
  .join(",\n")};
`);
}

const sql = `-- 자동 생성 파일입니다. 직접 수정하지 말고 content/problems를 수정한 뒤
-- npm run content:seed 로 다시 생성하세요.
-- 문제 수: ${problems.length}

begin;

${statements.join("\n")}
commit;
`;

writeFileSync(OUTPUT, sql);
console.log(`supabase/seed.sql 생성 완료 (문제 ${problems.length}개)`);
