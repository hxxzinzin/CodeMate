import { describe, expect, it } from "vitest";
import {
  FIRST_REVIEW_AFTER_DAYS,
  NEXT_REVIEW_AFTER_DAYS,
  nextProgress,
  progressAfterReveal,
  type ProgressState,
  RETRY_AFTER_REVEAL_DAYS,
} from "./progress";

const now = new Date("2026-10-02T12:00:00Z");
const days = (n: number, from = now) => new Date(from.getTime() + n * 86_400_000).toISOString();

describe("progressAfterReveal (정답을 본 뒤 다시 풀기 예약)", () => {
  it("한 번도 제출하지 않은 문제도 3일 뒤 다시 풀기로 예약 (attempts 0)", () => {
    expect(progressAfterReveal(null, now)).toEqual({
      status: "attempted",
      attempts: 0,
      firstSolvedAt: null,
      lastAttemptAt: now.toISOString(),
      nextReviewAt: days(RETRY_AFTER_REVEAL_DAYS),
    });
  });

  it("틀린 적 있는 문제는 시도 기록을 유지하고 다시 풀기만 예약", () => {
    const prev: ProgressState = { status: "attempted", attempts: 2, firstSolvedAt: null, lastAttemptAt: "2026-10-01T00:00:00Z", nextReviewAt: null };
    expect(progressAfterReveal(prev, now)).toEqual({ ...prev, nextReviewAt: days(3) });
  });

  it("이미 푼 문제는 바꾸지 않는다 (해결 기록·복습 일정 유지)", () => {
    const solved: ProgressState = { status: "solved", attempts: 1, firstSolvedAt: "2026-09-01T00:00:00Z", lastAttemptAt: "2026-09-01T00:00:00Z", nextReviewAt: "2026-09-08T00:00:00Z" };
    expect(progressAfterReveal(solved, now)).toBeNull();
  });
});

describe("nextProgress — 다시 풀기 예약된 문제", () => {
  const scheduled: ProgressState = {
    status: "attempted",
    attempts: 1,
    firstSolvedAt: null,
    lastAttemptAt: "2026-09-28T00:00:00Z",
    nextReviewAt: "2026-10-01T00:00:00Z",
  };

  it("다시 틀리면 3일 뒤로 다시 미룬다 (매일 나오지 않게)", () => {
    expect(nextProgress(scheduled, "wa", now).nextReviewAt).toBe(days(RETRY_AFTER_REVEAL_DAYS));
  });

  it("스스로 풀면 해결 + 일반 복습 주기(7일)로 바뀐다", () => {
    const p = nextProgress(scheduled, "ac", now);
    expect(p.status).toBe("solved");
    expect(p.nextReviewAt).toBe(days(FIRST_REVIEW_AFTER_DAYS));
  });

  it("푼 문제를 복습 예정일 이후에 다시 풀면 다음 복습을 14일 뒤로 (그대로 두면 계속 '복습할 때'로 남음)", () => {
    const solvedDue: ProgressState = { status: "solved", attempts: 1, firstSolvedAt: "2026-09-20T00:00:00Z", lastAttemptAt: "2026-09-20T00:00:00Z", nextReviewAt: "2026-09-27T00:00:00Z" };
    expect(nextProgress(solvedDue, "ac", now).nextReviewAt).toBe(days(NEXT_REVIEW_AFTER_DAYS));
    expect(nextProgress(solvedDue, "wa", now).nextReviewAt).toBe(days(NEXT_REVIEW_AFTER_DAYS));
    // 예정일 전에 다시 푼 경우는 예정일 그대로
    const notDue = { ...solvedDue, nextReviewAt: "2026-10-09T00:00:00Z" };
    expect(nextProgress(notDue, "ac", now).nextReviewAt).toBe("2026-10-09T00:00:00Z");
  });

  it("예약이 없는 문제를 틀리면 기존처럼 예약을 만들지 않는다", () => {
    expect(nextProgress({ ...scheduled, nextReviewAt: null }, "wa", now).nextReviewAt).toBeNull();
    expect(nextProgress(null, "self_wrong", now).nextReviewAt).toBeNull();
  });
});
