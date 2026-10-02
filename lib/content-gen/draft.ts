import { z } from "zod";
import { TAGS } from "../../content/tags.ts";
import { normalizeOutput } from "../judge/compare.ts";

/**
 * AI 문제 초안 (ADR-015).
 * - AI는 문제 글, 정답 코드 3개(Java, C, 완전 탐색 C), 테스트 "입력"만 쓴다. 기대 출력은 쓰지 않는다.
 * - 기대 출력은 sandbox에서 정답 코드를 실행해 얻고, 세 풀이가 모든 테스트에서 같은 답이어야 통과한다.
 *
 * 스크립트(Node로 바로 실행)에서도 쓰므로 실행 시점 import는 상대 경로로 쓴다.
 */

/** 태그가 많으면 한 문제가 여러 Skill 점수에 과하게 반영된다. 풀이의 핵심 개념만 분야별 최대 2개. */
export const MAX_TAGS_PER_TYPE = 2;
export const MAX_TAGS_TOTAL = 5;

const tagList = (type: keyof typeof TAGS) =>
  z
    .array(z.string())
    .optional()
    .refine((keys) => (keys ?? []).every((k) => k in TAGS[type]), {
      message: `알 수 없는 ${type} 태그가 있어요. content/tags.ts의 키만 쓸 수 있어요.`,
    })
    .refine((keys) => (keys ?? []).length <= MAX_TAGS_PER_TYPE, {
      message: `${type} 태그는 풀이의 핵심 개념만 최대 ${MAX_TAGS_PER_TYPE}개까지 쓰세요.`,
    });

/** 화면이 단계 이름(핵심 개념, 생각할 부분 …)을 이미 보여주므로 힌트 글에 "1단계" 같은 접두어를 쓰지 않는다. */
const hint = z
  .string()
  .min(5)
  .refine((h) => !/^\s*\d+\s*단계/.test(h), { message: "힌트 앞에 '1단계 …' 같은 이름을 쓰지 마세요. 내용만 쓰세요." });

export const draftSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug는 kebab-case 영어여야 해요."),
  title: z.string().min(1).max(40),
  difficulty: z.number().int().min(1).max(5),
  estimatedMinutes: z.number().int().min(5).max(120),
  tags: z.object({
    algorithm: tagList("algorithm"),
    data_structure: tagList("data_structure"),
    java: tagList("java"),
    c: tagList("c"),
  }),
  description: z.string().min(20),
  input: z.string().min(5),
  output: z.string().min(5),
  constraints: z.string().min(5),
  examples: z.array(z.object({ input: z.string().min(1), explanation: z.string().min(5) })).min(1).max(3),
  tests: z.array(z.object({ input: z.string().min(1), note: z.string().min(2) })).min(5).max(12),
  hints: z.tuple([hint, hint, hint, hint]),
  solution: z
    .string()
    .min(20)
    .refine((s) => s.includes("시간복잡도"), { message: "해설에 **시간복잡도**를 쓰세요. (자주 하는 실수, 언어별 팁도 기존 문제처럼)" }),
  javaCode: z.string().includes("class Main", { message: "Java 정답은 public class Main이어야 해요." }),
  cCode: z.string().includes("main", { message: "C 정답에 main 함수가 없어요." }),
  bruteForceC: z.string().includes("main", { message: "완전 탐색 풀이에 main 함수가 없어요." }),
});

export type ProblemDraft = z.infer<typeof draftSchema>;

/** AI 응답에서 JSON을 꺼낸다. ```json 코드 블록 또는 맨 바깥 중괄호. */
function extractJson(text: string): string | null {
  const block = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (block) return block[1];
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return start >= 0 && end > start ? text.slice(start, end + 1) : null;
}

export function parseDraft(text: string): { ok: true; draft: ProblemDraft } | { ok: false; errors: string[] } {
  const json = extractJson(text);
  if (!json) return { ok: false, errors: ["응답에서 JSON을 찾지 못했어요."] };
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch (error) {
    return { ok: false, errors: [`JSON 형식 오류: ${error instanceof Error ? error.message : String(error)}`] };
  }
  const parsed = draftSchema.safeParse(value);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => `${i.path.join(".") || "(전체)"}: ${i.message}`) };
  }
  // 화면은 LaTeX를 그리지 않아서 $K = 3$이 그대로 보인다. (AI 코치 응답에서도 겪은 문제, 프롬프트로 막아도 새어 나옴)
  const d = parsed.data;
  const texts = [d.description, d.input, d.output, d.constraints, d.solution, ...d.hints, ...d.examples.map((e) => e.explanation)];
  if (texts.some((t) => /\$[^$\n]+\$/.test(t))) {
    return { ok: false, errors: ["LaTeX 수식($...$)을 쓰지 마세요. K = 3, N² 처럼 일반 문자로 쓰세요."] };
  }
  const tagCount = Object.values(parsed.data.tags).reduce((n, list) => n + (list?.length ?? 0), 0);
  if (tagCount === 0) return { ok: false, errors: ["tags: 태그가 하나 이상 필요해요."] };
  if (tagCount > MAX_TAGS_TOTAL) {
    return { ok: false, errors: [`tags: 태그가 ${tagCount}개예요. 풀이의 핵심 개념만 전체 ${MAX_TAGS_TOTAL}개 이하로 쓰세요.`] };
  }
  return { ok: true, draft: parsed.data };
}

/** 한 테스트에서 세 풀이를 실행한 결과. null이면 정상 종료하지 못함(실행 에러·시간 초과). */
export type CaseRun = { input: string; java: string | null; c: string | null; brute: string | null };

/**
 * 세 풀이가 모든 테스트에서 정상 종료하고 같은 출력을 냈는지 확인한다.
 * 통과하면 Java 출력을 기대 출력으로 쓴다. (공백 규칙은 채점과 같은 normalizeOutput)
 */
export function crossCheck(runs: CaseRun[]): { ok: true; outputs: string[] } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  runs.forEach((r, i) => {
    const n = i + 1;
    const failed = (["java", "c", "brute"] as const).filter((k) => r[k] === null);
    if (failed.length > 0) {
      errors.push(`테스트 ${n}: ${failed.join(", ")} 풀이가 정상 종료하지 못했어요. (실행 에러 또는 시간 초과)`);
      return;
    }
    const [java, c, brute] = [r.java!, r.c!, r.brute!].map(normalizeOutput);
    if (java === "") errors.push(`테스트 ${n}: 출력이 비어 있어요.`);
    if (java !== c || java !== brute) {
      const short = (s: string) => JSON.stringify(s.length > 60 ? `${s.slice(0, 60)}…` : s);
      errors.push(`테스트 ${n}: 출력이 서로 달라요. java=${short(java)} c=${short(c)} brute=${short(brute)}`);
    }
  });
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, outputs: runs.map((r) => `${normalizeOutput(r.java!)}\n`) };
}

/** content/problems/<slug>/problem.ts 소스. 값은 JSON 문자열로 넣어 따옴표·백틱 이스케이프를 신경 쓰지 않는다. */
export function renderProblemTs(draft: ProblemDraft, outputs: string[]): string {
  const exampleCount = draft.examples.length;
  const tags = Object.fromEntries(Object.entries(draft.tags).filter(([, keys]) => keys && keys.length > 0));
  const problem = {
    slug: draft.slug,
    title: draft.title,
    difficulty: draft.difficulty,
    estimatedMinutes: draft.estimatedMinutes,
    languages: ["java", "c"],
    tags,
    description: draft.description,
    input: draft.input,
    output: draft.output,
    constraints: draft.constraints,
    examples: draft.examples.map((e, i) => ({ input: e.input, output: outputs[i], explanation: e.explanation })),
    hints: draft.hints,
    solution: draft.solution,
    tests: draft.tests.map((t, i) => ({ input: t.input, output: outputs[exampleCount + i], note: t.note })),
  };
  return `import type { ProblemContent } from "../../types.ts";

// AI 초안에서 만든 문제 (npm run content:generate). 기대 출력은 Java·C·완전 탐색 풀이를
// sandbox에서 실행해 모두 같은 답이 나온 값이다. 사람이 검토·승인한 뒤 공개한다. (ADR-015)
const problem: ProblemContent = ${JSON.stringify(problem, null, 2)};

export default problem;
`;
}

/** 검토용 미리보기 (사람이 읽는 문서) */
export function renderPreview(draft: ProblemDraft, outputs: string[], report: string[]): string {
  const ex = draft.examples
    .map((e, i) => `### 예제 ${i + 1}\n입력\n\`\`\`\n${e.input}\`\`\`\n출력\n\`\`\`\n${outputs[i]}\`\`\`\n${e.explanation}`)
    .join("\n\n");
  const tests = draft.tests
    .map((t, i) => `| ${i + 1} | ${t.note} | \`${JSON.stringify(outputs[draft.examples.length + i].trim()).slice(0, 40)}\` |`)
    .join("\n");
  const tags = Object.entries(draft.tags)
    .flatMap(([type, keys]) => (keys ?? []).map((k) => `${type}/${k}`))
    .join(", ");
  return `# [검토용 초안] ${draft.title} (\`${draft.slug}\`)

- 난이도 Lv.${draft.difficulty} · 예상 ${draft.estimatedMinutes}분 · 태그 ${tags}

## 검토 체크리스트
- [ ] 문제 설명만 읽고 입출력이 모호하지 않은가
- [ ] 예제 설명이 예제 출력과 맞는가
- [ ] 제한(constraints)이 테스트와 맞는가
- [ ] 난이도·태그가 적절한가
- [ ] 힌트가 정답 코드를 그대로 알려주지 않는가

## 자동 검증 결과
${report.map((r) => `- ${r}`).join("\n")}

## 문제
${draft.description}

## 입력
${draft.input}

## 출력
${draft.output}

## 제한
${draft.constraints}

${ex}

## 숨김 테스트
| # | 확인하는 경우 | 기대 출력(앞부분) |
|---|---|---|
${tests}

## 힌트
${draft.hints.map((h, i) => `${i + 1}. ${h}`).join("\n")}

## 해설
${draft.solution}
`;
}
