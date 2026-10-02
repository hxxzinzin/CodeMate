import { round2 } from "@/lib/learning/performance";

/**
 * 추천 난이도 D (1.00 ~ 5.00) 조정. 날짜가 아니라 실제 풀이 결과로만 움직인다. (기획서 7, 8)
 *
 *   D' = D + 0.4 × 가중치 × (p − 0.65)      p: 수행 점수(0~1.2)
 *   - p가 0.65(힌트 몇 개 쓰고 시간 안에 푼 정도)보다 높으면 오르고, 낮으면 내린다.
 *   - 한 번에 ±0.3을 넘게 움직이지 않는다.
 *   - 소수 둘째 자리까지 저장한다. (profiles.current_difficulty numeric(4,2))
 *
 * 가중치: 문제 난이도와 D의 차이로 "얼마나 의미 있는 결과인지"를 반영한다.
 *   쉬운 문제를 잘 풀면 0.5 / 어려운 문제를 잘 풀면 1.25
 *   어려운 문제를 못 풀면 0.5 / 쉬운 문제를 못 풀면 1.0
 */

export const DIFFICULTY_CONFIG = {
  min: 1,
  /** 지금은 1~5단계. 10단계로 늘리면 여기만 바꾼다. */
  max: 5,
  /** 처음 가입한 사용자의 D (DB 기본값과 같음) */
  initial: 1.5,
  /** 이 수행 점수보다 높으면 오르고 낮으면 내린다. */
  pivot: 0.65,
  rate: 0.4,
  maxStep: 0.3,
} as const;

export function difficultyWeight(problemDifficulty: number, current: number, performance: number): number {
  const gap = problemDifficulty - current;
  if (performance >= DIFFICULTY_CONFIG.pivot) {
    if (gap >= 0.5) return 1.25; // 도전 문제 성공
    if (gap <= -0.5) return 0.5; // 쉬운 문제 성공
    return 1;
  }
  return gap >= 0.5 ? 0.5 : 1; // 도전 문제 실패는 덜, 쉬운 문제 실패는 그대로
}

export function nextDifficulty(current: number, problemDifficulty: number, performance: number): number {
  const c = DIFFICULTY_CONFIG;
  const raw = c.rate * difficultyWeight(problemDifficulty, current, performance) * (performance - c.pivot);
  const step = Math.max(-c.maxStep, Math.min(c.maxStep, raw));
  return round2(Math.max(c.min, Math.min(c.max, current + step)));
}

/**
 * 이번 제출로 난이도를 조정할지.
 * - 그 문제의 첫 제출이거나, 이번에 처음 해결했을 때만 반영한다.
 * - 같은 문제를 여러 번 틀려도 D가 계속 내려가지 않고, 이미 푼 문제를 복습해도 D가 오르지 않는다.
 */
export function shouldAdjustDifficulty(attemptCount: number, newlySolved: boolean): boolean {
  return attemptCount === 1 || newlySolved;
}
