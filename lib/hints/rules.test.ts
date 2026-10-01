import { describe, expect, it } from "vitest";
import { canOpenLevel, isHintLevel, REMOVED_CODE_NOTICE, stripLongCodeBlocks, summarizeHintUsage } from "./rules";

describe("canOpenLevel", () => {
  it("처음에는 1단계만 열 수 있다", () => {
    expect(canOpenLevel(0, 1)).toBe(true);
    expect(canOpenLevel(0, 2)).toBe(false);
    expect(canOpenLevel(0, 4)).toBe(false);
  });

  it("본 단계의 다음 단계까지 열 수 있고, 이미 본 단계는 다시 볼 수 있다", () => {
    expect(canOpenLevel(2, 3)).toBe(true);
    expect(canOpenLevel(2, 4)).toBe(false);
    expect(canOpenLevel(3, 1)).toBe(true);
  });
});

describe("isHintLevel", () => {
  it("1~4 정수만 허용한다", () => {
    expect([1, 2, 3, 4].every(isHintLevel)).toBe(true);
    expect([0, 5, 1.5, "1", null].some(isHintLevel)).toBe(false);
  });
});

describe("stripLongCodeBlocks", () => {
  it("4줄 이상 코드 블록은 안내 문구로 바꾼다", () => {
    const text = "스택을 써 보세요.\n```java\nDeque<Character> s = new ArrayDeque<>();\nfor (char c : str.toCharArray()) {\n  s.push(c);\n}\n```\n끝";
    const r = stripLongCodeBlocks(text);
    expect(r.removed).toBe(1);
    expect(r.text).toContain(REMOVED_CODE_NOTICE);
    expect(r.text).not.toContain("ArrayDeque");
    expect(r.text).toContain("스택을 써 보세요.");
  });

  it("짧은 한두 줄 예시와 인라인 코드는 그대로 둔다", () => {
    const text = "`push`를 써 보세요.\n```java\nstack.push(c);\n```";
    expect(stripLongCodeBlocks(text)).toEqual({ text, removed: 0 });
  });

  it("빈 줄은 줄 수에 세지 않는다", () => {
    const text = "```\na\n\n\nb\n```";
    expect(stripLongCodeBlocks(text).removed).toBe(0);
  });
});

describe("summarizeHintUsage", () => {
  it("본 힌트 수와 최고 단계를 센다", () => {
    expect(summarizeHintUsage([1, 2, 2, 3])).toEqual({ hintCount: 4, maxHintLevel: 3 });
    expect(summarizeHintUsage([])).toEqual({ hintCount: 0, maxHintLevel: 0 });
    expect(summarizeHintUsage([9, 1])).toEqual({ hintCount: 1, maxHintLevel: 1 });
  });
});
