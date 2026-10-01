import { describe, expect, it } from "vitest";
import { COACH_SYSTEM_PROMPT, MAX_CODE_CHARS, problemContext, userCodeBlock } from "./prompts";

describe("prompts", () => {
  it("시스템 프롬프트에 핵심 규칙이 들어 있다", () => {
    expect(COACH_SYSTEM_PROMPT).toContain("한국어");
    expect(COACH_SYSTEM_PROMPT).toContain("완성된 정답 코드를 주지 않는다");
    expect(COACH_SYSTEM_PROMPT).toContain("실행 결과를 확인한 것처럼 말하지 않는다");
    expect(COACH_SYSTEM_PROMPT).toContain("<user_code>");
    // 실제 응답에서 발견한 문제: 화면이 렌더링하지 못하는 수식 표기($O(N)$), Python 예시
    expect(COACH_SYSTEM_PROMPT).toContain("수식 표기");
    expect(COACH_SYSTEM_PROMPT).toContain("Java 또는 C");
  });

  it("문제 맥락에는 설명·입출력·제한만 넣는다", () => {
    const text = problemContext({ title: "괄호", description: "설명", input: "입력", output: "출력", constraints: "제한" });
    expect(text).toContain("# 문제: 괄호");
    expect(text).toContain("## 제한\n제한");
  });

  it("사용자 코드는 태그로 감싸고, 너무 길면 잘라낸다", () => {
    expect(userCodeBlock("java", "class Main {}")).toBe('<user_code language="java">\nclass Main {}\n</user_code>');
    const long = userCodeBlock("c", "a".repeat(MAX_CODE_CHARS + 100));
    expect(long).toContain("일부만 전달됨");
    expect(long.length).toBeLessThan(MAX_CODE_CHARS + 100);
  });
});
