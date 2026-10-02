/**
 * AI 문제 초안 생성 (ADR-015)
 *   npm run content:generate -- --tag bfs --difficulty 3
 *
 * 1. Gemini가 문제 글, Java·C 정답, 완전 탐색(C) 풀이, 테스트 "입력"을 JSON으로 쓴다.
 * 2. 세 풀이를 sandbox(OnlineCompiler.io)에서 모든 입력에 실행한다. AI 코드는 이 컴퓨터에서 실행하지 않는다.
 * 3. 세 풀이가 모두 같은 답이어야 통과. 실패하면 이유를 붙여 다시 요청한다(최대 --attempts번).
 * 4. 통과하면 content/drafts/<slug>/ (Git에 올리지 않음)에 저장한다. 사람이 preview.md를 읽고 승인하면
 *    npm run content:approve -- <slug> 로 정식 문제가 된다.
 *
 * 필요한 키(.env.local): GEMINI_API_KEY, ONLINECOMPILER_API_KEY. 키 값은 출력하지 않는다.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { TAGS } from "../../content/tags.ts";
import {
  type CaseRun,
  crossCheck,
  MAX_TAGS_PER_TYPE,
  MAX_TAGS_TOTAL,
  parseDraft,
  type ProblemDraft,
  renderPreview,
  renderProblemTs,
} from "../../lib/content-gen/draft.ts";
import { generateText } from "../../lib/ai/gemini.ts";
import { createOnlineCompilerRunner, MAX_INPUT_BYTES } from "../../lib/judge/online-compiler.ts";
import { loadProblems, validate } from "./load.ts";

process.loadEnvFile?.(".env.local");

const DRAFTS_DIR = path.resolve(import.meta.dirname, "../../content/drafts");

const { values } = parseArgs({
  options: {
    tag: { type: "string" },
    difficulty: { type: "string", default: "2" },
    attempts: { type: "string", default: "3" },
  },
});

const tagType = Object.entries(TAGS).find(([, keys]) => values.tag && values.tag in keys)?.[0];
const difficulty = Number(values.difficulty);
if (!values.tag || !tagType || !(difficulty >= 1 && difficulty <= 5)) {
  console.error("사용법: npm run content:generate -- --tag <content/tags.ts의 키> --difficulty <1~5>");
  console.error("예: npm run content:generate -- --tag bfs --difficulty 3");
  process.exitCode = 1;
} else if (!process.env.GEMINI_API_KEY || !process.env.ONLINECOMPILER_API_KEY) {
  console.error(".env.local에 GEMINI_API_KEY와 ONLINECOMPILER_API_KEY가 모두 필요해요.");
  process.exitCode = 1;
} else {
  await main(values.tag, tagType, difficulty, Number(values.attempts));
}

function systemPrompt(): string {
  const tagCatalog = Object.entries(TAGS)
    .map(([type, keys]) => `- ${type}: ${Object.keys(keys).join(", ")}`)
    .join("\n");
  return `당신은 한국어 코딩테스트 문제 출제자입니다. Java와 C로 풀 수 있는 표준 입출력 문제를 하나 만듭니다.
반드시 아래 형식의 JSON 하나만 \`\`\`json 코드 블록으로 답하세요. 다른 설명은 쓰지 마세요.

{
  "slug": "제목 내용을 그대로 옮긴 kebab-case 영어 (예: island-count). 내용과 다른 단어를 넣지 마세요",
  "title": "한국어 제목 (40자 이하)",
  "difficulty": 1~5,
  "estimatedMinutes": 예상 풀이 시간(분),
  "tags": { "algorithm": [...], "data_structure": [...], "java": [...], "c": [...] },
  "description": "문제 설명 (마크다운, 상황 이야기 + 구할 것)",
  "input": "입력 형식 설명",
  "output": "출력 형식 설명",
  "constraints": "제한 (마크다운 목록, 숫자 범위를 정확히)",
  "examples": [ { "input": "예제 입력 (줄 끝 \\n 포함)", "explanation": "예제 출력이 왜 그런지 설명" } ],
  "tests": [ { "input": "숨김 테스트 입력", "note": "어떤 경우를 확인하는지 (예: N = 1 경계값)" } ],
  "hints": ["1단계 핵심 개념", "2단계 생각할 부분", "3단계 알고리즘 방향", "4단계 의사코드"],
  "solution": "해설 (풀이 아이디어, 시간·공간복잡도, 자주 하는 실수, 언어별 팁). 전체 코드는 쓰지 않음",
  "javaCode": "Java 정답 (public class Main, 표준 입력 → 표준 출력)",
  "cCode": "C 정답 (C11 표준 라이브러리만)",
  "bruteForceC": "C로 쓴 완전 탐색 풀이 (느려도 되지만 누가 봐도 맞는 가장 단순한 방법)"
}

규칙
- 기대 출력은 쓰지 마세요. 출력은 정답 코드를 실행해서 자동으로 만듭니다.
- examples는 1~3개, tests는 5~10개. tests에는 최솟값·최댓값·특수한 경우(경계값)를 꼭 넣으세요.
- 모든 입력은 완전 탐색 풀이가 1초 안에 끝날 만큼 작게 만드세요. 입력 하나는 ${MAX_INPUT_BYTES / 1000}KB를 넘으면 안 됩니다.
- 세 풀이(javaCode, cCode, bruteForceC)는 모든 입력에서 글자 하나까지 같은 출력을 내야 합니다. 출력 형식을 명확히 정하세요.
- 프로그램은 항상 0으로 종료해야 합니다. (main에서 return 0, System.exit 금지)
- 수식은 LaTeX를 쓰지 말고 일반 문자(≤, ×, N²)로 쓰세요.
- 문제 설명(description)에는 풀이 방법이나 쓸 자료구조를 암시하지 마세요. ("효율적인 자료구조를 쓰세요" 같은 문장 금지)
- 힌트는 정답 코드를 그대로 알려주지 말고 단계적으로 생각을 돕게 쓰세요. 힌트 앞에 "1단계", "핵심 개념:" 같은 이름을 붙이지 마세요.
- 해설에는 **시간복잡도**, **공간복잡도**, **자주 하는 실수**(목록), **언어별 팁**(Java, C)을 소제목으로 넣으세요.
- 태그는 풀이의 핵심 개념만 분야별 최대 ${MAX_TAGS_PER_TYPE}개, 전체 ${MAX_TAGS_TOTAL}개 이하로 쓰세요. basic-syntax처럼 모든 문제에 해당하는 태그는 쓰지 마세요.
- 태그는 아래 목록의 키만 쓸 수 있습니다.
${tagCatalog}`;
}

function userPrompt(tag: string, type: string, difficulty: number, existingTitles: string[], feedback: string[]): string {
  return [
    `요청: 태그 ${type}/${tag}를 반드시 포함하는 난이도 ${difficulty}(1 쉬움 ~ 5 어려움) 문제를 만드세요.`,
    `이미 있는 문제와 겹치지 않게 하세요: ${existingTitles.join(", ")}`,
    feedback.length > 0 ? `이전 시도가 아래 이유로 실패했습니다. 고쳐서 처음부터 다시 쓰세요.\n${feedback.map((f) => `- ${f}`).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** 세 풀이를 sandbox에서 실행한다. 한 테스트의 세 풀이를 동시에(3개), 테스트는 차례로. */
async function runAll(draft: ProblemDraft): Promise<CaseRun[] | string[]> {
  const runner = createOnlineCompilerRunner({ apiKey: process.env.ONLINECOMPILER_API_KEY! });
  const inputs = [...draft.examples.map((e) => e.input), ...draft.tests.map((t) => t.input)];
  const tooBig = inputs.flatMap((input, i) => (Buffer.byteLength(input, "utf8") > MAX_INPUT_BYTES ? [`입력 ${i + 1}이 ${MAX_INPUT_BYTES / 1000}KB를 넘어요.`] : []));
  if (tooBig.length > 0) return tooBig;

  const runs: CaseRun[] = [];
  for (const input of inputs) {
    const [java, c, brute] = await Promise.all([
      runner.run("java", draft.javaCode, input),
      runner.run("c", draft.cCode, input),
      runner.run("c", draft.bruteForceC, input),
    ]);
    const out = (o: typeof java) => (o.kind === "ok" ? o.stdout : null);
    runs.push({ input, java: out(java), c: out(c), brute: out(brute) });
    process.stdout.write(".");
  }
  process.stdout.write("\n");
  return runs;
}

async function main(tag: string, type: string, difficulty: number, attempts: number) {
  const existing = await loadProblems();
  const existingSlugs = new Set(existing.map((p) => p.problem.slug));
  const existingTitles = existing.map((p) => p.problem.title);
  const feedback: string[] = [];

  for (let attempt = 1; attempt <= attempts; attempt++) {
    console.log(`\n[시도 ${attempt}/${attempts}] Gemini에 초안 요청 중…`);
    const res = await generateText(
      { system: systemPrompt(), prompt: userPrompt(tag, type, difficulty, existingTitles, feedback), maxOutputTokens: 16_000, temperature: 0.7 },
      {
        fetch: globalThis.fetch,
        env: {
          GEMINI_API_KEY: process.env.GEMINI_API_KEY,
          // 문제 출제는 정확성이 중요해서 힌트용(lite)보다 큰 모델을 쓴다. 무료 한도는 하루 몇 번 생성에 충분하다.
          GEMINI_MODEL: process.env.GEMINI_GENERATE_MODEL ?? "gemini-3.5-flash",
          GEMINI_FALLBACK_MODEL: "gemini-3.5-flash-lite",
        },
      },
    );
    console.log(`  모델 ${res.model}, 토큰 입력 ${res.tokensIn} / 출력 ${res.tokensOut}${res.truncated ? " (잘림)" : ""}`);

    feedback.length = 0;
    if (res.truncated) {
      feedback.push("답변이 길이 제한에서 잘렸어요. 설명과 테스트를 더 짧게 쓰세요.");
      continue;
    }
    const parsed = parseDraft(res.text);
    if (!parsed.ok) {
      feedback.push(...parsed.errors);
      console.log(`  ✗ 형식 오류 ${parsed.errors.length}개: ${parsed.errors.slice(0, 3).join(" / ")}`);
      continue;
    }
    const draft = parsed.draft;
    if (existingSlugs.has(draft.slug)) {
      feedback.push(`slug ${draft.slug}는 이미 있어요. 다른 문제를 만드세요.`);
      continue;
    }
    if (!(draft.tags[type as keyof typeof draft.tags] ?? []).includes(tag)) {
      feedback.push(`요청한 태그 ${type}/${tag}가 tags에 없어요.`);
      continue;
    }

    console.log(`  "${draft.title}" — sandbox에서 세 풀이 실행 중 (${draft.examples.length + draft.tests.length}개 테스트 × 3)`);
    const runs = await runAll(draft);
    if (typeof runs[0] === "string") {
      feedback.push(...(runs as string[]));
      continue;
    }
    const checked = crossCheck(runs as CaseRun[]);
    if (!checked.ok) {
      feedback.push(...checked.errors.slice(0, 5));
      console.log(`  ✗ 교차 검증 실패: ${checked.errors.slice(0, 3).join(" / ")}`);
      continue;
    }

    const total = runs.length;
    const report = [
      `Java·C·완전 탐색 풀이가 테스트 ${total}개에서 모두 같은 출력 (sandbox 실행)`,
      `기대 출력은 실행 결과로 만듦 (AI가 쓴 값 아님)`,
      `생성 모델 ${res.model}, 시도 ${attempt}번째`,
    ];
    const dir = path.join(DRAFTS_DIR, draft.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "problem.ts"), renderProblemTs(draft, checked.outputs));
    writeFileSync(path.join(dir, "Main.java"), `${draft.javaCode.trimEnd()}\n`);
    writeFileSync(path.join(dir, "main.c"), `${draft.cCode.trimEnd()}\n`);
    writeFileSync(path.join(dir, "brute.c"), `${draft.bruteForceC.trimEnd()}\n`);
    writeFileSync(path.join(dir, "preview.md"), renderPreview(draft, checked.outputs, report));

    // 저장한 파일이 기존 문제와 같은 형식 검사를 통과하는지 확인한다.
    const { default: problem } = await import(pathToFileURL(path.join(dir, "problem.ts")).href);
    const errors = validate({ dir, problem, code: { java: draft.javaCode, c: draft.cCode } });
    if (errors.length > 0) {
      console.log(`  ✗ 형식 검사 실패: ${errors.join(" / ")}`);
      feedback.push(...errors);
      continue;
    }

    console.log(`\n✓ 초안 완성: content/drafts/${draft.slug}/preview.md 를 읽고 검토하세요.`);
    console.log(`  승인: npm run content:approve -- ${draft.slug}`);
    return;
  }
  console.error(`\n✗ ${attempts}번 시도했지만 검증을 통과한 초안을 만들지 못했어요. 마지막 실패 이유:`);
  for (const f of feedback) console.error(`  - ${f}`);
  process.exitCode = 1;
}
