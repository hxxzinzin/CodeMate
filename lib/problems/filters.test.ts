import { describe, expect, it } from "vitest";
import { escapeLikePattern, hasActiveFilters, MAX_QUERY_LENGTH, parseProblemFilters } from "./filters";

describe("parseProblemFilters", () => {
  it("올바른 값은 그대로 필터가 된다", () => {
    expect(
      parseProblemFilters({
        q: " 괄호 ",
        difficulty: "3",
        language: "java",
        algorithm: "bfs",
        ds: "queue",
        status: "solved",
      }),
    ).toEqual({ q: "괄호", difficulty: 3, language: "java", algorithm: "bfs", dataStructure: "queue", status: "solved" });
  });

  it("빈 값과 없는 값은 무시한다 (필터 폼이 빈 값을 보내는 경우)", () => {
    expect(parseProblemFilters({ q: "", difficulty: "", language: undefined })).toEqual({});
  });

  it.each([
    ["0"], ["6"], ["2.5"], ["abc"], ["-1"],
  ])("범위를 벗어난 난이도 %s는 무시한다", (difficulty) => {
    expect(parseProblemFilters({ difficulty })).toEqual({});
  });

  it("지원하지 않는 언어, 등록되지 않은 태그, 잘못된 상태는 무시한다", () => {
    expect(
      parseProblemFilters({ language: "python", algorithm: "quantum", ds: "bfs", status: "done" }),
    ).toEqual({});
  });

  it("알고리즘 태그를 자료구조 자리에 넣으면 무시한다 (태그 종류 구분)", () => {
    expect(parseProblemFilters({ ds: "dfs" })).toEqual({});
    expect(parseProblemFilters({ ds: "stack" })).toEqual({ dataStructure: "stack" });
  });

  it("같은 이름의 쿼리가 여러 번 오면 첫 번째 값만 쓴다", () => {
    expect(parseProblemFilters({ language: ["c", "java"] })).toEqual({ language: "c" });
  });

  it("검색어는 최대 길이로 자른다", () => {
    const filters = parseProblemFilters({ q: "가".repeat(200) });
    expect(filters.q).toHaveLength(MAX_QUERY_LENGTH);
  });
});

describe("hasActiveFilters", () => {
  it("필터가 하나라도 있으면 true", () => {
    expect(hasActiveFilters({})).toBe(false);
    expect(hasActiveFilters({ language: "c" })).toBe(true);
  });
});

describe("escapeLikePattern", () => {
  it("%, _, \\는 글자 그대로 검색되도록 이스케이프한다", () => {
    expect(escapeLikePattern("100%_완료\\")).toBe("100\\%\\_완료\\\\");
    expect(escapeLikePattern("미로")).toBe("미로");
  });
});
