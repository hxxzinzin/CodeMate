import { describe, expect, it } from "vitest";
import { buildExplainPrompt, buildReviewPrompt, MAX_QUESTION_CHARS, REVIEW_SECTIONS } from "@/lib/ai/coach-prompts";
import { firstIssueMessage } from "@/lib/submissions/schema";
import { explainRequestSchema, reviewRequestSchema, solutionRequestSchema } from "./schema";

const problem = { title: "괄호", description: "설명", input: "입력", output: "출력", constraints: "N ≤ 100,000" };

function errorOf(schema: { safeParse: (v: unknown) => { success: boolean; error?: unknown } }, input: unknown) {
  const r = schema.safeParse(input);
  // zod 오류를 공용 함수로 한국어 메시지로 바꾼다.
  return r.success ? null : firstIssueMessage(r.error as Parameters<typeof firstIssueMessage>[0]);
}

describe("buildReviewPrompt", () => {
  it("리뷰 순서대로 모든 섹션 제목을 요구한다", () => {
    const prompt = buildReviewPrompt({ problem, language: "java", code: "class Main {}" });
    const positions = REVIEW_SECTIONS.map((s) => prompt.indexOf(`### ${s}`));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("언어별 리뷰 관점과 실행하지 않았다는 주의를 넣는다", () => {
    expect(buildReviewPrompt({ problem, language: "c", code: "int main(void){}" })).toContain("malloc/free");
    expect(buildReviewPrompt({ problem, language: "java", code: "x" })).toContain("코드를 실행하지 않았으므로");
  });
});

describe("buildExplainPrompt", () => {
  it("질문은 태그로 감싸고 길이를 제한한다", () => {
    const prompt = buildExplainPrompt({ problem, question: "가".repeat(MAX_QUESTION_CHARS + 50) });
    const inside = prompt.split("<user_question>\n")[1].split("\n</user_question>")[0];
    expect(inside).toHaveLength(MAX_QUESTION_CHARS);
  });

  it("코드가 비어 있으면 코드 블록을 넣지 않는다", () => {
    expect(buildExplainPrompt({ problem, question: "스택이 뭐예요?", language: "java", code: "  " })).not.toContain("<user_code");
    expect(buildExplainPrompt({ problem, question: "스택이 뭐예요?", language: "java", code: "x" })).toContain("<user_code");
  });
});

describe("coach request schemas", () => {
  it("리뷰 요청은 slug, 언어, 코드가 필요하다", () => {
    expect(reviewRequestSchema.safeParse({ slug: "a", language: "java", code: "x" }).success).toBe(true);
    expect(errorOf(reviewRequestSchema, { slug: "a", language: "py", code: "x" })).toBe("지원하지 않는 언어예요.");
  });

  it("질문은 공백을 빼고 2자 이상, 최대 길이 이하", () => {
    expect(errorOf(explainRequestSchema, { slug: "a", question: "  가  " })).toBe("질문을 2자 이상 입력해주세요.");
    expect(errorOf(explainRequestSchema, { slug: "a", question: "가".repeat(MAX_QUESTION_CHARS + 1) })).toContain("이하로");
    expect(explainRequestSchema.safeParse({ slug: "a", question: "스택이 뭐예요?" }).success).toBe(true);
  });

  it("정답 보기는 confirm: true가 없으면 거부한다", () => {
    expect(errorOf(solutionRequestSchema, { slug: "a", language: "java" })).toBe("정답 보기를 한 번 더 확인해주세요.");
    expect(errorOf(solutionRequestSchema, { slug: "a", language: "java", confirm: "true" })).toBe("정답 보기를 한 번 더 확인해주세요.");
    expect(solutionRequestSchema.safeParse({ slug: "a", language: "java", confirm: true }).success).toBe(true);
  });
});
