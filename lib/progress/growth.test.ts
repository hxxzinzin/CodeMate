import { describe, expect, it } from "vitest";
import type { UserSkill } from "@/types/skill";
import { categoryProgress, difficultyTimeline, skillGrowth } from "./growth";

const ev = (createdAt: string, metadata: unknown) => ({ createdAt, metadata });

describe("skillGrowth", () => {
  it("기간 첫 before → 마지막 after, 많이 오른 순", () => {
    const events = [
      ev("2026-09-20T00:00:00Z", { skillChanges: [{ category: "algorithm", skill: "bfs", before: 30, after: 36 }] }),
      ev("2026-09-25T00:00:00Z", {
        skillChanges: [
          { category: "algorithm", skill: "bfs", before: 36, after: 45 },
          { category: "data_structure", skill: "array", before: 70, after: 68 },
        ],
      }),
    ];
    expect(skillGrowth(events)).toEqual([
      { category: "algorithm", skill: "bfs", from: 30, to: 45, delta: 15 },
      { category: "data_structure", skill: "array", from: 70, to: 68, delta: -2 },
    ]);
  });

  it("기록 순서가 섞여 있어도 시간순으로 계산한다", () => {
    const events = [
      ev("2026-09-25T00:00:00Z", { skillChanges: [{ category: "algorithm", skill: "dp", before: 40, after: 50 }] }),
      ev("2026-09-20T00:00:00Z", { skillChanges: [{ category: "algorithm", skill: "dp", before: 20, after: 40 }] }),
    ];
    expect(skillGrowth(events)[0]).toMatchObject({ from: 20, to: 50, delta: 30 });
  });

  it("기간 안에 처음 측정된 Skill은 from=null로 구분하고, 오른 Skill 뒤에 둔다", () => {
    const events = [
      ev("2026-09-20T00:00:00Z", {
        skillChanges: [
          { category: "c", skill: "pointer", before: null, after: 42 },
          { category: "algorithm", skill: "dfs", before: 40, after: 43 },
        ],
      }),
    ];
    const result = skillGrowth(events);
    expect(result.map((g) => g.skill)).toEqual(["dfs", "pointer"]);
    expect(result[1]).toMatchObject({ from: null, delta: 0 });
  });

  it("변화가 거의 없는 Skill(0.5 미만)은 뺀다", () => {
    const events = [ev("2026-09-20T00:00:00Z", { skillChanges: [{ category: "algorithm", skill: "dp", before: 50, after: 50.2 }] })];
    expect(skillGrowth(events)).toEqual([]);
  });

  it("형식이 다른 예전 기록은 무시한다", () => {
    const events = [ev("2026-09-20T00:00:00Z", { result: "self_correct" }), ev("2026-09-21T00:00:00Z", { skillChanges: "x" })];
    expect(skillGrowth(events)).toEqual([]);
  });
});

describe("difficultyTimeline", () => {
  const now = new Date("2026-10-02T00:00:00Z");

  it("첫 변화의 before에서 시작해 현재 값으로 끝난다", () => {
    const events = [
      ev("2026-09-20T00:00:00Z", { difficultyChange: { before: 1.5, after: 1.6 } }),
      ev("2026-09-21T00:00:00Z", { difficultyChange: null }),
      ev("2026-09-22T00:00:00Z", { difficultyChange: { before: 1.6, after: 1.8 } }),
    ];
    expect(difficultyTimeline(events, 1.8, now).map((p) => p.value)).toEqual([1.5, 1.6, 1.8, 1.8]);
  });

  it("기록이 없으면 현재 값 한 점", () => {
    expect(difficultyTimeline([], 1.5, now)).toEqual([{ at: now.toISOString(), value: 1.5 }]);
  });
});

describe("categoryProgress", () => {
  const now = new Date("2026-10-02T00:00:00Z");
  const skill = (category: UserSkill["category"], key: string, score: number, attempts = 3): UserSkill => ({
    category,
    skill: key,
    score,
    attempts,
    correct: attempts,
    lastPracticedAt: "2026-10-01T00:00:00Z",
  });

  it("측정된 Skill은 점수 순, 전체 태그 중 나머지는 측정 전으로 구분한다", () => {
    const result = categoryProgress([skill("algorithm", "dfs", 40), skill("algorithm", "sorting", 80)], now);
    const algo = result.find((c) => c.category === "algorithm")!;
    expect(algo.measured.map((s) => s.label)).toEqual(["Sorting", "DFS"]);
    expect(algo.unmeasured).toContain("BFS");
    expect(algo.unmeasured).not.toContain("DFS");
    expect(algo.average).toBe(60);
  });

  it("attempts=0인 행은 측정 전으로 본다 (0점과 구분)", () => {
    const result = categoryProgress([skill("c", "pointer", 0, 0)], now);
    const c = result.find((x) => x.category === "c")!;
    expect(c.measured).toEqual([]);
    expect(c.unmeasured).toContain("Pointer");
    expect(c.average).toBeNull();
  });

  it("같은 키라도 카테고리별로 따로 본다 (자료구조 array ≠ C array)", () => {
    const result = categoryProgress([skill("data_structure", "array", 90)], now);
    expect(result.find((x) => x.category === "c")!.unmeasured).toContain("Array");
  });

  it("상태(강점·취약)를 함께 붙인다", () => {
    const result = categoryProgress([skill("algorithm", "sorting", 85), { ...skill("algorithm", "dp", 30), correct: 0 }], now);
    const algo = result.find((c) => c.category === "algorithm")!;
    expect(algo.measured.map((s) => s.status)).toEqual(["strong", "weak"]);
  });
});
