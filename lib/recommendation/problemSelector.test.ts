import { describe, expect, it } from "vitest";
import type { UserSkill } from "@/types/skill";
import {
  type Candidate,
  explainChoice,
  isEligible,
  pickDifficultyBand,
  pickLanguage,
  randomProblem,
  recommendProblem,
  type RecommendationInput,
  scoreCandidate,
  seededRandom,
} from "./problemSelector";

const now = new Date("2026-10-02T03:00:00Z");
const today = "2026-10-02";

function problem(id: string, difficulty: number, tags: Candidate["tags"], languages: Candidate["languages"] = ["java", "c"]): Candidate {
  return { id, slug: id, title: id, difficulty, languages, tags };
}

const bfs = problem("bfs", 3, [{ type: "algorithm", key: "bfs" }, { type: "data_structure", key: "queue" }]);
const sort = problem("sort", 3, [{ type: "algorithm", key: "sorting" }, { type: "data_structure", key: "array" }]);
const dp = problem("dp", 3, [{ type: "algorithm", key: "dp" }]);
const easy = problem("easy", 2, [{ type: "data_structure", key: "array" }]);
const hard = problem("hard", 4, [{ type: "algorithm", key: "dijkstra" }], ["java"]);
const cOnly = problem("c-only", 3, [{ type: "c", key: "pointer" }], ["c"]);

function skill(category: UserSkill["category"], name: string, score: number, attempts = 5, daysAgo = 1): UserSkill {
  return {
    category,
    skill: name,
    score,
    attempts,
    correct: Math.round((attempts * score) / 100),
    lastPracticedAt: new Date(now.getTime() - daysAgo * 86_400_000).toISOString(),
  };
}

function input(partial: Partial<RecommendationInput> = {}): RecommendationInput {
  return {
    candidates: [bfs, sort, dp, easy, hard, cOnly],
    currentDifficulty: 3,
    javaRatio: 70,
    recentLanguageCounts: { java: 0, c: 0 },
    skills: [],
    progress: new Map(),
    recentDaily: new Map(),
    recentFailTags: new Set(),
    excludeIds: new Set(),
    today,
    now,
    random: seededRandom("test"),
    ...partial,
  };
}

function frequency<T>(n: number, run: (seed: string) => T): Map<T, number> {
  const counts = new Map<T, number>();
  for (let i = 0; i < n; i++) {
    const v = run(`seed-${i}`);
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return counts;
}

describe("seededRandom", () => {
  it("같은 시드는 같은 수열, 다른 시드는 다른 수열", () => {
    const a = seededRandom("user:2026-10-02:0");
    const b = seededRandom("user:2026-10-02:0");
    const c = seededRandom("user:2026-10-02:1");
    const seqA = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(seqA);
    expect([c(), c(), c()]).not.toEqual(seqA);
    expect(seqA.every((x) => x >= 0 && x < 1)).toBe(true);
  });
});

describe("pickLanguage", () => {
  it("기본 비율(Java 70%)을 따른다", () => {
    const counts = frequency(2000, (s) => pickLanguage(70, { java: 0, c: 0 }, seededRandom(s)));
    expect(counts.get("java")! / 2000).toBeGreaterThan(0.65);
    expect(counts.get("java")! / 2000).toBeLessThan(0.75);
  });

  it("최근 Java가 너무 많았으면 C 확률을 높인다 (자기 보정)", () => {
    const counts = frequency(2000, (s) => pickLanguage(70, { java: 10, c: 0 }, seededRandom(s)));
    expect(counts.get("c")! / 2000).toBeGreaterThan(0.5);
  });

  it("0% 또는 100%로 설정하면 그 언어만 낸다", () => {
    expect(frequency(200, (s) => pickLanguage(100, { java: 50, c: 0 }, seededRandom(s))).get("c")).toBeUndefined();
    expect(frequency(200, (s) => pickLanguage(0, { java: 0, c: 50 }, seededRandom(s))).get("java")).toBeUndefined();
  });
});

describe("pickDifficultyBand", () => {
  it("현재 수준 70% / 한 단계 쉬움 20% / 한 단계 어려움 10% (기획서 43)", () => {
    const counts = frequency(2000, (s) => pickDifficultyBand(3.2, seededRandom(s)));
    expect(counts.get(3)! / 2000).toBeCloseTo(0.7, 1);
    expect(counts.get(2)! / 2000).toBeCloseTo(0.2, 1);
    expect(counts.get(4)! / 2000).toBeCloseTo(0.1, 1);
  });

  it("1~5 범위를 벗어나지 않는다", () => {
    const low = frequency(500, (s) => pickDifficultyBand(1, seededRandom(s)));
    const high = frequency(500, (s) => pickDifficultyBand(5, seededRandom(s)));
    expect([...low.keys()].every((d) => d >= 1)).toBe(true);
    expect([...high.keys()].every((d) => d <= 5)).toBe(true);
  });
});

describe("isEligible", () => {
  const opts = { language: "java" as const, difficulty: 3, recentDays: 14 };

  it("최근 14일 안에 낸 문제는 제외하고, 그보다 오래됐으면 허용한다", () => {
    expect(isEligible(bfs, input({ recentDaily: new Map([["bfs", "2026-09-25"]]) }), opts)).toBe(false);
    expect(isEligible(bfs, input({ recentDaily: new Map([["bfs", "2026-09-10"]]) }), opts)).toBe(true);
  });

  it("이미 푼 문제는 제외하되 복습 예정일이 지났으면 허용한다", () => {
    const solved = (nextReviewAt: string) => input({ progress: new Map([["bfs", { status: "solved" as const, nextReviewAt }]]) });
    expect(isEligible(bfs, solved("2026-10-09T00:00:00Z"), opts)).toBe(false);
    expect(isEligible(bfs, solved("2026-10-01T00:00:00Z"), opts)).toBe(true);
  });

  it("정답을 보고 넘어간 문제는 다시 풀기 예정일이 지나면 최근에 냈더라도 다시 낸다", () => {
    const retry = (nextReviewAt: string) =>
      input({
        recentDaily: new Map([["bfs", "2026-09-28"]]),
        progress: new Map([["bfs", { status: "attempted" as const, nextReviewAt }]]),
      });
    expect(isEligible(bfs, retry("2026-10-01T00:00:00Z"), opts)).toBe(true);
    // 예정일 전에는 기존 규칙(최근 14일 제외) 그대로
    expect(isEligible(bfs, retry("2026-10-09T00:00:00Z"), opts)).toBe(false);
  });

  it("시도만 하고 못 푼 문제는 다시 낼 수 있다", () => {
    expect(isEligible(bfs, input({ progress: new Map([["bfs", { status: "attempted" as const, nextReviewAt: null }]]) }), opts)).toBe(true);
  });

  it("언어·난이도·제외 목록을 지킨다", () => {
    expect(isEligible(cOnly, input(), opts)).toBe(false);
    expect(isEligible(easy, input(), opts)).toBe(false);
    expect(isEligible(bfs, input({ excludeIds: new Set(["bfs"]) }), opts)).toBe(false);
  });
});

describe("scoreCandidate", () => {
  it("약한 태그가 있는 문제가 강한 태그 문제보다 점수가 높다", () => {
    const skills = [skill("algorithm", "bfs", 30), skill("data_structure", "queue", 40), skill("algorithm", "sorting", 90), skill("data_structure", "array", 85)];
    const s = input({ skills });
    expect(scoreCandidate(bfs, "java", s).total).toBeGreaterThan(scoreCandidate(sort, "java", s).total);
  });

  it("최근 틀린 태그, 복습 예정 문제는 점수가 오른다", () => {
    const base = scoreCandidate(bfs, "java", input()).total;
    expect(scoreCandidate(bfs, "java", input({ recentFailTags: new Set(["bfs"]) })).total).toBeGreaterThan(base);
    const due = input({ progress: new Map([["bfs", { status: "solved" as const, nextReviewAt: "2026-10-01T00:00:00Z" }]]) });
    expect(scoreCandidate(bfs, "java", due).reviewDue).toBe(1);
    const retryDue = input({ progress: new Map([["bfs", { status: "attempted" as const, nextReviewAt: "2026-10-01T00:00:00Z" }]]) });
    expect(scoreCandidate(bfs, "java", retryDue).reviewDue).toBe(1);
  });

  it("추천 이유: 복습과 다시 풀기를 구분한다", () => {
    const reason = (status: "solved" | "attempted") => {
      const s = input({ progress: new Map([["bfs", { status, nextReviewAt: "2026-10-01T00:00:00Z" }]]) });
      return explainChoice(bfs, "java", scoreCandidate(bfs, "java", s), s);
    };
    expect(reason("solved")).toContain("예전에 푼 문제");
    expect(reason("attempted")).toContain("정답을 확인하고 넘어갔던 문제");
  });

  it("최근에 너무 쉽게 푼 분야는 점수가 내려간다", () => {
    const easyRecently = input({ skills: [skill("algorithm", "dp", 95, 5, 2)] });
    const longAgo = input({ skills: [skill("algorithm", "dp", 95, 5, 20)] });
    expect(scoreCandidate(dp, "java", easyRecently).tooEasy).toBe(1);
    expect(scoreCandidate(dp, "java", longAgo).tooEasy).toBe(0);
  });

  it("새 개념은 현재 수준 이하 문제에서만 가산한다", () => {
    expect(scoreCandidate(dp, "java", input({ currentDifficulty: 3 })).novelty).toBe(1);
    expect(scoreCandidate(hard, "java", input({ currentDifficulty: 3 })).novelty).toBe(0);
  });
});

describe("recommendProblem — 다시 풀기", () => {
  const attempted = (nextReviewAt: string) => ({ status: "attempted" as const, nextReviewAt });

  it("예정일이 지난 다시 풀기 문제는 난이도 구간과 상관없이 매번 먼저 낸다 (로컬 확인에서 구간이 달라 빠졌던 사례)", () => {
    // easy(Lv2)는 현재 수준(3)과 다른 구간이지만, 어떤 시드에서도 먼저 나와야 한다.
    for (let s = 0; s < 50; s++) {
      const r = recommendProblem(input({ random: seededRandom(`retry:${s}`), progress: new Map([["easy", attempted("2026-10-01T00:00:00Z")]]) }));
      expect(r?.problem.id).toBe("easy");
      expect(r?.reason).toContain("정답을 확인하고 넘어갔던 문제");
    }
  });

  it("여러 개면 가장 오래 기다린 것부터, 새로 뽑기로 제외한 문제는 건너뛴다", () => {
    const progress = new Map([
      ["bfs", attempted("2026-09-30T00:00:00Z")],
      ["dp", attempted("2026-09-25T00:00:00Z")],
    ]);
    expect(recommendProblem(input({ progress }))?.problem.id).toBe("dp");
    expect(recommendProblem(input({ progress, excludeIds: new Set(["dp"]) }))?.problem.id).toBe("bfs");
  });

  it("예정일 전이거나, 푼 문제의 복습이면 먼저 내지 않는다 (기존 점수 방식)", () => {
    const notYet = new Map([["easy", attempted("2026-10-09T00:00:00Z")]]);
    const solvedReview = new Map([["easy", { status: "solved" as const, nextReviewAt: "2026-10-01T00:00:00Z" }]]);
    const picks = (progress: Map<string, ReturnType<typeof attempted> | { status: "solved"; nextReviewAt: string }>) =>
      Array.from({ length: 50 }, (_, s) => recommendProblem(input({ random: seededRandom(`x:${s}`), progress }))?.problem.id);
    expect(picks(notYet).every((id) => id === "easy")).toBe(false);
    expect(picks(solvedReview).every((id) => id === "easy")).toBe(false);
  });
});

describe("recommendProblem", () => {
  it("같은 입력과 시드면 항상 같은 문제 (하루 동안 유지)", () => {
    const a = recommendProblem(input({ random: seededRandom("u1:2026-10-02:0") }));
    const b = recommendProblem(input({ random: seededRandom("u1:2026-10-02:0") }));
    expect(a?.problem.id).toBe(b?.problem.id);
    expect(a?.language).toBe(b?.language);
  });

  it("약한 분야 문제가 더 자주 나오지만, 그것만 나오지는 않는다 (기획서 42)", () => {
    const skills = [skill("algorithm", "bfs", 30), skill("data_structure", "queue", 35), skill("algorithm", "sorting", 90), skill("data_structure", "array", 90), skill("algorithm", "dp", 70)];
    const counts = frequency(1000, (s) => recommendProblem(input({ skills, random: seededRandom(s) }))?.problem.id);
    expect(counts.get("bfs")!).toBeGreaterThan(counts.get("sort") ?? 0);
    expect(counts.get("bfs")! / 1000).toBeLessThan(0.9);
  });

  it("추천 이유를 함께 준다", () => {
    const skills = [skill("algorithm", "bfs", 30), skill("data_structure", "queue", 35)];
    const onlyBfs = input({ candidates: [bfs], skills });
    expect(recommendProblem(onlyBfs)?.reason).toContain("BFS");
  });

  it("후보가 없으면 조건을 완화해서라도 문제를 낸다", () => {
    // 현재 수준(3) 문제는 모두 최근에 냈고, 쉬운 문제 하나만 남은 경우
    const recentDaily = new Map([["bfs", "2026-10-01"], ["sort", "2026-10-01"], ["dp", "2026-10-01"], ["hard", "2026-10-01"], ["c-only", "2026-10-01"]]);
    expect(recommendProblem(input({ recentDaily }))?.problem.id).toBe("easy");
  });

  it("제외 목록(지금 문제)은 새로 뽑을 때 나오지 않는다", () => {
    const counts = frequency(300, (s) => recommendProblem(input({ excludeIds: new Set(["bfs"]), random: seededRandom(s) }))?.problem.id);
    expect(counts.get("bfs")).toBeUndefined();
  });

  it("문제가 하나도 없으면 null", () => {
    expect(recommendProblem(input({ candidates: [] }))).toBeNull();
  });
});

describe("randomProblem", () => {
  it("최근 낸 문제와 지금 문제를 빼고 고르게 고른다", () => {
    const counts = frequency(600, (s) =>
      randomProblem(input({ excludeIds: new Set(["bfs"]), recentDaily: new Map([["sort", "2026-10-01"]]), random: seededRandom(s) }))?.problem.id,
    );
    expect(counts.get("bfs")).toBeUndefined();
    expect(counts.get("sort")).toBeUndefined();
    expect(counts.size).toBeGreaterThanOrEqual(3);
  });
});
