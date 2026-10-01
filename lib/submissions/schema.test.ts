import { describe, expect, it } from "vitest";
import { MAX_DRAFT_LENGTH } from "@/lib/editor/draft-storage";
import { CODE_TEMPLATES } from "@/lib/editor/templates";
import { firstIssueMessage, submissionRequestSchema } from "./schema";

const valid = { slug: "valid-brackets", language: "java", code: "class Main {}", selfReport: "correct" };

function errorOf(input: unknown) {
  const r = submissionRequestSchema.safeParse(input);
  return r.success ? null : firstIssueMessage(r.error);
}

describe("submissionRequestSchema", () => {
  it("올바른 요청은 통과한다", () => {
    expect(submissionRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("빈 코드와 공백뿐인 코드는 거부한다", () => {
    expect(errorOf({ ...valid, code: "" })).toBe("빈 코드는 제출할 수 없어요.");
    expect(errorOf({ ...valid, code: "  \n\t " })).toBe("빈 코드는 제출할 수 없어요.");
  });

  it("최대 길이를 넘는 코드는 거부한다", () => {
    expect(submissionRequestSchema.safeParse({ ...valid, code: "a".repeat(MAX_DRAFT_LENGTH) }).success).toBe(true);
    expect(errorOf({ ...valid, code: "a".repeat(MAX_DRAFT_LENGTH + 1) })).toContain("이하로 제출");
  });

  it("지원하지 않는 언어는 거부한다", () => {
    expect(errorOf({ ...valid, language: "python" })).toBe("지원하지 않는 언어예요.");
  });

  it("자기 보고 결과가 없거나 잘못되면 거부한다", () => {
    expect(errorOf({ ...valid, selfReport: undefined })).toBe("결과(맞았어요/틀렸어요)를 선택해주세요.");
    expect(errorOf({ ...valid, selfReport: "ac" })).toBe("결과(맞았어요/틀렸어요)를 선택해주세요.");
  });

  it("템플릿을 그대로(공백만 바꿔서) 제출하면 거부한다", () => {
    const untouched = "아직 코드를 작성하지 않았어요. 템플릿에 풀이를 작성한 뒤 제출해주세요.";
    expect(errorOf({ ...valid, code: CODE_TEMPLATES.java })).toBe(untouched);
    expect(errorOf({ ...valid, code: CODE_TEMPLATES.java.replace(/ {4}/g, "\t") + "\n\n" })).toBe(untouched);
    expect(errorOf({ ...valid, language: "c", code: CODE_TEMPLATES.c })).toBe(untouched);
    // 한 줄이라도 작성하면 통과
    const written = CODE_TEMPLATES.java.replace("main(String[] args) {", "main(String[] args) { System.out.println(1);");
    expect(written).not.toBe(CODE_TEMPLATES.java);
    expect(errorOf({ ...valid, code: written })).toBeNull();
  });

  it("풀이 시간이 음수·소수·문자면 한국어 안내와 함께 거부하고, 없어도 된다", () => {
    const message = "풀이 시간 형식이 올바르지 않아요.";
    expect(errorOf({ ...valid, solvingTimeSec: -10 })).toBe(message);
    expect(errorOf({ ...valid, solvingTimeSec: 1.5 })).toBe(message);
    expect(errorOf({ ...valid, solvingTimeSec: "60" })).toBe(message);
    expect(errorOf({ ...valid, solvingTimeSec: 600 })).toBeNull();
    expect(errorOf(valid)).toBeNull();
  });

  it("모든 검증 오류 메시지는 한국어다 (zod 기본 영어 메시지가 사용자에게 노출되지 않게)", () => {
    const inputs = [
      {},
      { ...valid, slug: 1 },
      { ...valid, code: 123 },
      { ...valid, language: 1 },
      { ...valid, selfReport: 1 },
      { ...valid, solvingTimeSec: null },
    ];
    for (const input of inputs) {
      expect(errorOf(input)).toMatch(/[가-힣]/);
    }
  });

  it("slug 형식이 잘못되면 거부한다", () => {
    expect(errorOf({ ...valid, slug: "../etc/passwd" })).toBe("잘못된 문제 주소예요.");
  });

  it("허용되지 않은 필드(user_id 등)는 결과에 포함되지 않는다", () => {
    const r = submissionRequestSchema.safeParse({ ...valid, userId: "someone-else", result: "ac" });
    expect(r.success).toBe(true);
    expect(r.success && Object.keys(r.data).sort()).toEqual(["code", "language", "selfReport", "slug"]);
  });
});
