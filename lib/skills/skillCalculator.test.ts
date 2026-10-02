import { describe, expect, it } from "vitest";
import { performanceScore, type PerformanceInput, timeAdjustment } from "@/lib/learning/performance";
import type { ProblemTag } from "@/types/problem";
import type { UserSkill } from "@/types/skill";
import {
  classifySkill,
  learningRate,
  skillsForSubmission,
  summarizeSkills,
  targetScore,
  updateSkill,
} from "./skillCalculator";

const base: PerformanceInput = {
  result: "self_correct",
  solvingTimeSec: null,
  estimatedMinutes: 20,
  hintCount: 0,
  maxHintLevel: 0,
  attemptCount: 1,
  aiReviewUsed: false,
  solutionRevealed: false,
};

describe("performanceScore — 기획서 8. Adaptive Difficulty 예시", () => {
  it("난이도 2, 정답, 힌트 0, 15분(예상 20분) → 1.0 (난이도를 조금 높일 근거)", () => {
    expect(performanceScore({ ...base, solvingTimeSec: 15 * 60, estimatedMinutes: 20 })).toBe(1);
  });

  it("난이도 3, 정답, 힌트 4, 45분(예상 30분) → 0.61 (유지 수준)", () => {
    expect(performanceScore({ ...base, solvingTimeSec: 45 * 60, estimatedMinutes: 30, hintCount: 4, maxHintLevel: 3 })).toBe(0.61);
  });

  it("난이도 4, 오답, 힌트 3 → 0 (낮추거나 복습)", () => {
    expect(performanceScore({ ...base, result: "self_wrong", hintCount: 3 })).toBe(0);
  });

  it("난이도 3, 정답, 힌트 0, 매우 빠른 풀이 → 1.2 (더 높은 난이도)", () => {
    expect(performanceScore({ ...base, solvingTimeSec: 5 * 60, estimatedMinutes: 30 })).toBe(1.2);
  });
});

describe("performanceScore — 세부 규칙", () => {
  it("의사코드(4단계) 힌트는 추가 감점", () => {
    expect(performanceScore({ ...base, hintCount: 1, maxHintLevel: 3 })).toBe(0.94);
    expect(performanceScore({ ...base, hintCount: 1, maxHintLevel: 4 })).toBe(0.84);
  });

  it("추가 시도 감점은 최대 0.2", () => {
    expect(performanceScore({ ...base, attemptCount: 3 })).toBe(0.9);
    expect(performanceScore({ ...base, attemptCount: 20 })).toBe(0.8);
  });

  it("정답을 봤으면 아무리 빨라도 최대 0.2", () => {
    expect(performanceScore({ ...base, solvingTimeSec: 60, solutionRevealed: true })).toBe(0.2);
  });

  it("감점이 많아도 0 아래로 내려가지 않는다", () => {
    expect(performanceScore({ ...base, solvingTimeSec: 99_999, hintCount: 20, maxHintLevel: 4, attemptCount: 9 })).toBe(0);
  });

  it("시간 조정: 측정값이 없으면 0, 예상 대비 비율로 구간을 나눈다", () => {
    expect(timeAdjustment(null, 20)).toBe(0);
    expect(timeAdjustment(600, 20)).toBe(0.2);
    expect(timeAdjustment(1200, 20)).toBe(0);
    expect(timeAdjustment(2400, 20)).toBe(-0.15);
    expect(timeAdjustment(2401, 20)).toBe(-0.3);
  });
});

const now = new Date("2026-10-02T12:00:00Z");
const ref = { category: "algorithm" as const, skill: "bfs" };

function solveRepeatedly(times: number, performance: number, difficulty: number): UserSkill {
  let skill: UserSkill | null = null;
  for (let i = 0; i < times; i++) {
    skill = updateSkill({ previous: skill, ref, performance, difficulty, correct: performance > 0, now });
  }
  return skill!;
}

describe("updateSkill", () => {
  it("목표 점수는 난이도가 높을수록 크고 100을 넘지 않는다", () => {
    expect(targetScore(1, 1)).toBe(52);
    expect(targetScore(1, 5)).toBe(100);
    expect(targetScore(1.2, 5)).toBe(100);
  });

  it("학습률은 처음엔 크고 점점 줄어 0.15에서 멈춘다", () => {
    expect(learningRate(0)).toBe(1);
    expect(learningRate(1)).toBe(0.5);
    expect(learningRate(3)).toBe(0.25);
    expect(learningRate(100)).toBe(0.15);
  });

  it("쉬운 문제(Lv1)만 완벽히 풀어도 52점 근처에서 멈춘다", () => {
    const skill = solveRepeatedly(30, 1, 1);
    expect(skill.score).toBeGreaterThan(51);
    expect(skill.score).toBeLessThanOrEqual(52);
    expect(skill).toMatchObject({ attempts: 30, correct: 30 });
  });

  it("어려운 문제(Lv4)를 잘 풀면 더 높이 올라간다", () => {
    expect(solveRepeatedly(30, 1, 4).score).toBeGreaterThan(85);
  });

  it("틀리면 점수가 내려가고 정답 수는 늘지 않는다", () => {
    const good = solveRepeatedly(5, 1, 3);
    const after = updateSkill({ previous: good, ref, performance: 0, difficulty: 3, correct: false, now });
    expect(after.score).toBeLessThan(good.score);
    expect(after).toMatchObject({ attempts: 6, correct: 5 });
  });

  it("데이터가 쌓이면 한 번의 실수로 크게 흔들리지 않는다", () => {
    const early = updateSkill({ previous: solveRepeatedly(1, 1, 3), ref, performance: 0, difficulty: 3, correct: false, now });
    const late = solveRepeatedly(20, 1, 3);
    const lateAfter = updateSkill({ previous: late, ref, performance: 0, difficulty: 3, correct: false, now });
    expect(76 - early.score).toBeGreaterThan(late.score - lateAfter.score);
  });
});

describe("skillsForSubmission", () => {
  const tags: ProblemTag[] = [
    { type: "algorithm", key: "two-pointer" },
    { type: "data_structure", key: "string" },
    { type: "java", key: "collection" },
    { type: "c", key: "pointer" },
    { type: "c", key: "string" },
  ];

  it("Java로 제출하면 C 개념은 반영하지 않는다", () => {
    expect(skillsForSubmission(tags, "java")).toEqual([
      { category: "algorithm", skill: "two-pointer" },
      { category: "data_structure", skill: "string" },
      { category: "java", skill: "collection" },
    ]);
  });

  it("C로 제출하면 Java 개념은 반영하지 않고, 자료구조 string과 C string은 따로 센다", () => {
    expect(skillsForSubmission(tags, "c").map((r) => `${r.category}:${r.skill}`)).toEqual([
      "algorithm:two-pointer",
      "data_structure:string",
      "c:pointer",
      "c:string",
    ]);
  });
});

function skill(partial: Partial<UserSkill>): UserSkill {
  return { ...ref, score: 60, attempts: 5, correct: 4, lastPracticedAt: now.toISOString(), ...partial };
}

describe("classifySkill / summarizeSkills", () => {
  it("측정 전, 취약, 강점, 복습 추천, 보통을 구분한다", () => {
    expect(classifySkill(skill({ attempts: 0, correct: 0, score: 0 }), now)).toBe("unmeasured");
    expect(classifySkill(skill({ score: 45 }), now)).toBe("weak");
    expect(classifySkill(skill({ score: 75, attempts: 5, correct: 2 }), now)).toBe("weak"); // 정답률 40%
    expect(classifySkill(skill({ score: 80 }), now)).toBe("strong");
    expect(classifySkill(skill({ score: 80, lastPracticedAt: "2026-09-01T00:00:00Z" }), now)).toBe("review");
    expect(classifySkill(skill({ score: 60 }), now)).toBe("normal");
  });

  it("한 번만 풀었으면 점수가 낮아도 아직 취약으로 단정하지 않는다", () => {
    expect(classifySkill(skill({ score: 10, attempts: 1, correct: 0 }), now)).toBe("normal");
  });

  it("기획서 42 예시: 강점은 높은 순, 취약점은 낮은 순", () => {
    const skills = [
      skill({ skill: "array", score: 90, attempts: 10, correct: 9 }),
      skill({ skill: "sorting", score: 85, attempts: 10, correct: 9 }),
      skill({ skill: "hashmap", score: 82, attempts: 10, correct: 8 }),
      skill({ skill: "dfs", score: 45, attempts: 6, correct: 3 }),
      skill({ skill: "bfs", score: 40, attempts: 5, correct: 2 }),
      skill({ skill: "dp", score: 30, attempts: 4, correct: 1 }),
    ];
    const summary = summarizeSkills(skills, now);
    expect(summary.strengths.map((s) => s.skill)).toEqual(["array", "sorting", "hashmap"]);
    expect(summary.weaknesses.map((s) => s.skill)).toEqual(["dp", "bfs", "dfs"]);
    expect(summary.reviewRecommended).toEqual([]);
  });
});
