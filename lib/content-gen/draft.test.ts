import { describe, expect, it } from "vitest";
import { type CaseRun, crossCheck, parseDraft, type ProblemDraft, renderPreview, renderProblemTs } from "./draft";

const validDraft: ProblemDraft = {
  slug: "sum-of-two",
  title: "두 수의 합",
  difficulty: 1,
  estimatedMinutes: 10,
  tags: { algorithm: ["simulation"], data_structure: [], java: ["basic-syntax"], c: ["basic-syntax"] },
  description: "정수 두 개 A와 B가 주어질 때 A + B를 출력하세요. 입력은 한 줄입니다.",
  input: "첫째 줄에 A와 B가 주어집니다.",
  output: "A + B를 출력합니다.",
  constraints: "- 0 ≤ A, B ≤ 1,000",
  examples: [{ input: "1 2\n", explanation: "1 + 2 = 3입니다." }],
  tests: [
    { input: "0 0\n", note: "최솟값" },
    { input: "1000 1000\n", note: "최댓값" },
    { input: "5 7\n", note: "일반" },
    { input: "0 9\n", note: "한쪽이 0" },
    { input: "3 0\n", note: "다른 쪽이 0" },
  ],
  hints: ["입력을 두 개 읽어 보세요.", "더하기만 하면 돼요.", "정수 덧셈입니다.", "a, b 읽기 → a + b 출력"],
  solution: "두 수를 읽어 더한 값을 출력합니다. 시간복잡도 O(1).",
  javaCode: "public class Main { public static void main(String[] a) {} }",
  cCode: "int main(void) { return 0; }",
  bruteForceC: "int main(void) { return 0; }",
};

describe("parseDraft", () => {
  it("```json 코드 블록에서 꺼내 검사한다", () => {
    const r = parseDraft(`설명입니다.\n\`\`\`json\n${JSON.stringify(validDraft)}\n\`\`\`\n끝`);
    expect(r).toEqual({ ok: true, draft: validDraft });
  });

  it("코드 블록이 없으면 맨 바깥 중괄호를 쓴다", () => {
    expect(parseDraft(`여기요 ${JSON.stringify(validDraft)}`).ok).toBe(true);
  });

  it("JSON이 아니면 이유와 함께 실패 (다음 시도에 이유를 알려주기 위해)", () => {
    const r = parseDraft("```json\n{ slug: 'x' }\n```");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toContain("JSON 형식 오류");
  });

  it("목록에 없는 태그, 잘못된 slug, 테스트 부족, Main이 아닌 Java 클래스는 거부", () => {
    const bad = {
      ...validDraft,
      slug: "Sum Of Two",
      tags: { algorithm: ["quantum-sort"] },
      tests: validDraft.tests.slice(0, 2),
      javaCode: "public class Solution {}",
    };
    const r = parseDraft(JSON.stringify(bad));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      const all = r.errors.join("\n");
      expect(all).toContain("slug");
      expect(all).toContain("알 수 없는 algorithm 태그");
      expect(all).toContain("tests");
      expect(all).toContain("class Main");
    }
  });

  it("AI가 기대 출력을 써도 형식상 무시된다 (기대 출력은 실행 결과로만 만든다)", () => {
    const withOutput = { ...validDraft, examples: [{ ...validDraft.examples[0], output: "999\n" }] };
    const r = parseDraft(JSON.stringify(withOutput));
    expect(r.ok && "output" in r.draft.examples[0]).toBe(false);
  });

  it("실제 초안에서 본 문제들을 거부: 태그 과다, 힌트 접두어, 시간복잡도 없는 해설", () => {
    const overTagged = {
      ...validDraft,
      tags: { algorithm: ["sliding-window"], data_structure: ["deque", "array"], java: ["basic-syntax", "collection"], c: ["pointer", "dynamic-memory", "array"] },
    };
    const r1 = parseDraft(JSON.stringify(overTagged));
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.errors.join("\n")).toContain("c 태그는 풀이의 핵심 개념만 최대 2개");

    const tooMany = { ...validDraft, tags: { algorithm: ["sliding-window", "greedy"], data_structure: ["deque", "array"], c: ["pointer", "array"] } };
    const r2 = parseDraft(JSON.stringify(tooMany));
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.errors[0]).toContain("전체 5개 이하");

    const prefixed = { ...validDraft, hints: ["1단계 핵심 개념: 덱을 떠올려 보세요.", ...validDraft.hints.slice(1)] };
    const r3 = parseDraft(JSON.stringify(prefixed));
    expect(r3.ok).toBe(false);
    if (!r3.ok) expect(r3.errors.join("\n")).toContain("'1단계 …' 같은 이름을 쓰지 마세요");

    const thin = { ...validDraft, solution: "덱을 쓰면 효율적으로 풀 수 있습니다. 인덱스를 저장하는 것이 핵심입니다." };
    const r4 = parseDraft(JSON.stringify(thin));
    expect(r4.ok).toBe(false);
    if (!r4.ok) expect(r4.errors.join("\n")).toContain("시간복잡도");
  });

  it("LaTeX 수식은 거부 (실제 두 번째 초안에서 '$K = 3$'), 코드의 $는 괜찮다", () => {
    const latex = { ...validDraft, description: `${validDraft.description} 윈도우 크기 $K = 3$이라면` };
    const r = parseDraft(JSON.stringify(latex));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toContain("LaTeX");
    const dollarInCode = { ...validDraft, cCode: 'int main(void) { printf("$%d", 1); return 0; }' };
    expect(parseDraft(JSON.stringify(dollarInCode)).ok).toBe(true);
  });

  it("태그가 하나도 없으면 거부", () => {
    const r = parseDraft(JSON.stringify({ ...validDraft, tags: {} }));
    expect(r.ok).toBe(false);
  });
});

describe("crossCheck", () => {
  const run = (java: string | null, c: string | null, brute: string | null): CaseRun => ({ input: "x", java, c, brute });

  it("세 풀이가 같으면 통과, 공백 규칙은 채점과 같다", () => {
    expect(crossCheck([run("3\n", "3  \r\n", "3"), run("0\n", "0\n", "0\n")])).toEqual({ ok: true, outputs: ["3\n", "0\n"] });
  });

  it("하나라도 다르면 어느 테스트에서 누가 달랐는지 알려준다", () => {
    const r = crossCheck([run("3\n", "3\n", "3\n"), run("5\n", "5\n", "6\n")]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors).toEqual(['테스트 2: 출력이 서로 달라요. java="5" c="5" brute="6"']);
  });

  it("정상 종료하지 못한 풀이가 있으면 실패", () => {
    const r = crossCheck([run("3\n", null, "3\n")]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toContain("c 풀이가 정상 종료하지 못했어요");
  });

  it("셋 다 아무것도 출력하지 않으면 실패 (모두 같아도 의미 없음)", () => {
    expect(crossCheck([run("", "", "")]).ok).toBe(false);
  });
});

describe("renderProblemTs", () => {
  it("실행으로 얻은 출력을 예제·테스트에 순서대로 넣고, 따옴표·백틱이 있어도 올바른 TS다", async () => {
    const tricky = { ...validDraft, description: "백틱 ` 과 \"따옴표\", ${템플릿} 그리고 \\ 역슬래시를 포함한 설명입니다." };
    const outputs = ["3\n", "0\n", "2000\n", "12\n", "9\n", "3\n"];
    const src = renderProblemTs(tricky, outputs);
    const json = src.slice(src.indexOf("= {") + 2, src.lastIndexOf("};") + 1);
    const problem = JSON.parse(json);
    expect(problem.description).toBe(tricky.description);
    expect(problem.examples[0]).toEqual({ input: "1 2\n", output: "3\n", explanation: "1 + 2 = 3입니다." });
    expect(problem.tests.map((t: { output: string }) => t.output)).toEqual(outputs.slice(1));
    expect(problem.tags).toEqual({ algorithm: ["simulation"], java: ["basic-syntax"], c: ["basic-syntax"] });
    expect(src).toContain('import type { ProblemContent } from "../../types.ts";');
  });
});

describe("renderPreview", () => {
  it("검토 체크리스트와 검증 결과를 담는다", () => {
    const md = renderPreview(validDraft, ["3\n", "0\n", "2000\n", "12\n", "9\n", "3\n"], ["세 풀이 일치 6/6"]);
    expect(md).toContain("검토 체크리스트");
    expect(md).toContain("세 풀이 일치 6/6");
    expect(md).toContain("두 수의 합");
  });
});
