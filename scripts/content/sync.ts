/**
 * 클라우드 DB에 문제 콘텐츠 반영 (ADR-015)
 *   npm run content:sync            반영할 내용만 보여줌 (변경 없음)
 *   npm run content:sync -- --yes   실제로 반영
 *
 * supabase db push --include-seed는 이미 적용한 seed.sql이 바뀌어도 다시 실행하지 않는다. (해시만 갱신)
 * 그래서 seed.sql과 같은 내용을 secret key로 직접 반영한다.
 * - 문제·해설: upsert (id는 slug로 만든 결정적 UUID → 여러 번 실행해도 행이 늘지 않음)
 * - 태그·힌트·테스트케이스: 문제별로 지우고 다시 넣음
 * - content에서 지운 문제는 DB에서 지우지 않는다. (제출 기록이 연결되어 있을 수 있음) 목록만 알려준다.
 *
 * 필요한 값(.env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY. 키 값은 출력하지 않는다.
 */
import { createClient } from "@supabase/supabase-js";
import { loadProblems, problemId, validate } from "./load.ts";

process.loadEnvFile?.(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const apply = process.argv.includes("--yes");

if (!url || !key) {
  console.error(".env.local에 NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SECRET_KEY가 필요해요.");
  process.exitCode = 1;
} else {
  await main(url, key);
}

async function main(url: string, key: string) {
  const problems = await loadProblems();
  const invalid = problems.map((p) => ({ slug: p.problem.slug, errors: validate(p) })).filter((p) => p.errors.length > 0);
  if (invalid.length > 0) {
    for (const p of invalid) console.error(`✗ ${p.slug}: ${p.errors.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data: inDb, error } = await sb.from("problems").select("slug");
  if (error) throw error;
  const dbSlugs = new Set(inDb.map((p) => p.slug));
  const added = problems.filter((p) => !dbSlugs.has(p.problem.slug)).map((p) => p.problem.slug);
  const contentSlugs = new Set(problems.map((p) => p.problem.slug));
  const onlyInDb = [...dbSlugs].filter((s) => !contentSlugs.has(s));

  console.log(`대상: ${new URL(url).host}`);
  console.log(`문제 ${problems.length}개 반영 (새 문제 ${added.length}개${added.length ? `: ${added.join(", ")}` : ""})`);
  if (onlyInDb.length > 0) console.log(`content에 없고 DB에만 있는 문제(지우지 않음): ${onlyInDb.join(", ")}`);
  if (!apply) {
    console.log("\n변경하지 않았어요. 실제로 반영하려면: npm run content:sync -- --yes");
    return;
  }

  const check = (what: string, r: { error: { message: string } | null }) => {
    if (r.error) throw new Error(`${what}: ${r.error.message}`);
  };
  for (const { problem: p, code } of problems) {
    const id = problemId(p.slug);
    check(
      `${p.slug} 문제`,
      await sb.from("problems").upsert({
        id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        input: p.input,
        output: p.output,
        constraints: p.constraints,
        examples: p.examples.map(({ input, output, explanation }) => ({ input, output, explanation })),
        difficulty: p.difficulty,
        estimated_minutes: p.estimatedMinutes,
        languages: p.languages,
        is_published: true,
      }),
    );
    check(`${p.slug} 태그 삭제`, await sb.from("problem_tags").delete().eq("problem_id", id));
    check(
      `${p.slug} 태그`,
      await sb.from("problem_tags").insert(
        Object.entries(p.tags).flatMap(([type, keys]) => (keys ?? []).map((tag) => ({ problem_id: id, tag_type: type, tag }))),
      ),
    );
    check(`${p.slug} 힌트 삭제`, await sb.from("problem_hints").delete().eq("problem_id", id));
    check(`${p.slug} 힌트`, await sb.from("problem_hints").insert(p.hints.map((content, i) => ({ problem_id: id, level: i + 1, content }))));
    check(
      `${p.slug} 해설`,
      await sb.from("problem_solutions").upsert({ problem_id: id, explanation: p.solution, reference_code: code }),
    );
    check(`${p.slug} 테스트 삭제`, await sb.from("problem_test_cases").delete().eq("problem_id", id));
    const cases = [
      ...p.examples.map((t) => ({ input: t.input, expected_output: t.output, is_sample: true })),
      ...p.tests.map((t) => ({ input: t.input, expected_output: t.output, is_sample: false })),
    ];
    check(`${p.slug} 테스트`, await sb.from("problem_test_cases").insert(cases.map((t, ord) => ({ problem_id: id, ord, ...t }))));
    process.stdout.write(".");
  }
  const { count } = await sb.from("problems").select("*", { count: "exact", head: true }).eq("is_published", true);
  console.log(`\n✓ 반영 완료. 클라우드 공개 문제 ${count}개`);
}
