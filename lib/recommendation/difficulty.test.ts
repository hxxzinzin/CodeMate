import { describe, expect, it } from "vitest";
import { performanceScore, type PerformanceInput } from "@/lib/learning/performance";
import { DIFFICULTY_CONFIG, difficultyWeight, nextDifficulty, shouldAdjustDifficulty } from "./difficulty";

const solved: PerformanceInput = {
  result: "self_correct",
  solvingTimeSec: null,
  estimatedMinutes: 30,
  hintCount: 0,
  maxHintLevel: 0,
  attemptCount: 1,
  aiReviewUsed: false,
  solutionRevealed: false,
};

describe("기획서 8. Adaptive Difficulty 예시", () => {
  it("난이도 2, 정답, 힌트 0, 15분 → 난이도를 조금 높인다", () => {
    const p = performanceScore({ ...solved, solvingTimeSec: 15 * 60, estimatedMinutes: 20 });
    const next = nextDifficulty(2, 2, p);
    expect(next).toBeGreaterThan(2);
    expect(next).toBeLessThanOrEqual(2.2);
  });

  it("난이도 3, 정답, 힌트 4, 45분 → 난이도를 유지한다 (변화 0.05 미만)", () => {
    const p = performanceScore({ ...solved, solvingTimeSec: 45 * 60, hintCount: 4, maxHintLevel: 3 });
    expect(Math.abs(nextDifficulty(3, 3, p) - 3)).toBeLessThan(0.05);
  });

  it("난이도 4, 오답, 힌트 3 → 난이도를 낮춘다", () => {
    const p = performanceScore({ ...solved, result: "self_wrong", hintCount: 3 });
    expect(nextDifficulty(4, 4, p)).toBeLessThan(4);
  });

  it("난이도 3, 정답, 힌트 0, 매우 빠른 풀이 → 더 높은 난이도", () => {
    const p = performanceScore({ ...solved, solvingTimeSec: 5 * 60 });
    expect(nextDifficulty(3, 3, p)).toBeCloseTo(3.22, 2);
  });
});

describe("nextDifficulty — 세부 규칙", () => {
  it("한 번에 ±0.3을 넘게 움직이지 않는다", () => {
    // 도전 문제를 아주 잘 푼 경우: 0.4 × 1.25 × 0.55 = 0.275 → 그대로
    expect(nextDifficulty(2, 4, 1.2)).toBe(2.28);
    for (const p of [0, 1.2]) {
      for (const problem of [1, 3, 5]) {
        expect(Math.abs(nextDifficulty(3, problem, p) - 3)).toBeLessThanOrEqual(DIFFICULTY_CONFIG.maxStep);
      }
    }
  });

  it("1 아래, 5 위로 벗어나지 않는다", () => {
    expect(nextDifficulty(1, 1, 0)).toBe(1);
    expect(nextDifficulty(5, 5, 1.2)).toBe(5);
    expect(nextDifficulty(4.95, 5, 1.2)).toBe(5);
  });

  it("쉬운 문제를 잘 푼 것보다 같은 수준 문제를 잘 푼 것이 더 많이 오른다", () => {
    expect(nextDifficulty(3, 2, 1) - 3).toBeLessThan(nextDifficulty(3, 3, 1) - 3);
  });

  it("어려운 문제를 못 푼 것보다 쉬운 문제를 못 푼 것이 더 많이 내려간다", () => {
    expect(3 - nextDifficulty(3, 4, 0)).toBeLessThan(3 - nextDifficulty(3, 2, 0));
  });

  it("정답을 보고 해결하면 난이도가 내려간다", () => {
    const p = performanceScore({ ...solved, solvingTimeSec: 60, solutionRevealed: true });
    expect(nextDifficulty(3, 3, p)).toBeLessThan(3);
  });

  it("소수 둘째 자리로 저장한다", () => {
    expect(Number.isInteger(nextDifficulty(2.37, 3, 0.83) * 100)).toBe(true);
  });

  it("가중치 표", () => {
    expect(difficultyWeight(3, 3, 1)).toBe(1);
    expect(difficultyWeight(4, 3, 1)).toBe(1.25);
    expect(difficultyWeight(2, 3, 1)).toBe(0.5);
    expect(difficultyWeight(4, 3, 0)).toBe(0.5);
    expect(difficultyWeight(2, 3, 0)).toBe(1);
  });
});

describe("오랜 기간 사용했을 때", () => {
  it("계속 잘 풀면 점점 올라가 상한에 닿는다", () => {
    let d: number = DIFFICULTY_CONFIG.initial;
    for (let i = 0; i < 60; i++) d = nextDifficulty(d, Math.round(d), 1);
    expect(d).toBe(5);
  });

  /**
   * 균형점: 성공 한 번은 약 +0.1, 실패 한 번은 -0.26이라
   * D가 제자리에 머무는 정답률 ≈ 0.65 ÷ (성공 시 평균 수행 점수) ≈ 70% 안팎이다.
   * → 정답률이 70%보다 낮으면 천천히 쉬워지고, 높으면 천천히 어려워진다. ("약간 어려운" 학습 구간 유지)
   */
  function simulate(pattern: number[], rounds: number): number {
    let d = 3;
    for (let i = 0; i < rounds; i++) d = nextDifficulty(d, 3, pattern[i % pattern.length]);
    return d;
  }

  it("정답률 약 67%(힌트 조금)면 천천히 내려간다", () => {
    const d = simulate([0.94, 0.88, 0], 30); // 맞힘(힌트 1) / 맞힘(힌트 2) / 틀림
    expect(d).toBeLessThan(3);
    expect(d).toBeGreaterThan(2.3); // 30문제 동안 0.7 미만으로만 내려간다
  });

  it("정답률 80%(힌트 조금)면 천천히 올라간다", () => {
    const d = simulate([0.94, 0.88, 0.94, 0.94, 0], 30);
    expect(d).toBeGreaterThan(3);
    expect(d).toBeLessThan(3.7);
  });

  it("정답률 70%(힌트 조금) 근처에서는 거의 움직이지 않는다", () => {
    const d = simulate([0.94, 0.94, 0.94, 0.88, 0.94, 0.94, 0.94, 0, 0, 0], 30);
    expect(Math.abs(d - 3)).toBeLessThan(0.15);
  });
});

describe("shouldAdjustDifficulty", () => {
  it("첫 제출이거나 처음 해결했을 때만 조정한다", () => {
    expect(shouldAdjustDifficulty(1, false)).toBe(true); // 첫 제출 오답
    expect(shouldAdjustDifficulty(3, true)).toBe(true); // 세 번째에 처음 해결
    expect(shouldAdjustDifficulty(2, false)).toBe(false); // 다시 틀림
    expect(shouldAdjustDifficulty(5, false)).toBe(false); // 이미 푼 문제 복습
  });
});
