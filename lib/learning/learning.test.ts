import { describe, expect, it } from "vitest";
import { clampSolvingTime, isNewlySolved, nextProgress, type ProgressState } from "./progress";
import { localDate, nextStreak, previousDate, type StreakState } from "./streak";

describe("localDate", () => {
  it("한국 시간 자정을 기준으로 날짜가 바뀐다 (UTC 15:00 = KST 다음 날 00:00)", () => {
    expect(localDate(new Date("2026-10-01T14:59:59Z"), "Asia/Seoul")).toBe("2026-10-01");
    expect(localDate(new Date("2026-10-01T15:00:00Z"), "Asia/Seoul")).toBe("2026-10-02");
  });

  it("UTC로 계산하면 생기는 오류: 한국 오전 8시 제출이 전날로 잡히지 않는다", () => {
    const kst8am = new Date("2026-10-01T23:00:00Z"); // KST 10월 2일 08:00
    expect(kst8am.toISOString().slice(0, 10)).toBe("2026-10-01"); // 잘못된 방식
    expect(localDate(kst8am, "Asia/Seoul")).toBe("2026-10-02"); // 올바른 방식
  });

  it("잘못된 시간대는 서울 기준으로 대체한다", () => {
    expect(localDate(new Date("2026-10-01T15:00:00Z"), "Not/AZone")).toBe("2026-10-02");
  });
});

describe("previousDate", () => {
  it.each([
    ["2026-10-02", "2026-10-01"],
    ["2026-03-01", "2026-02-28"],
    ["2028-03-01", "2028-02-29"],
    ["2027-01-01", "2026-12-31"],
  ])("%s의 전날은 %s", (date, expected) => {
    expect(previousDate(date)).toBe(expected);
  });
});

describe("nextStreak", () => {
  const base: StreakState = { streak: 3, longestStreak: 5, lastStudyDate: "2026-10-01" };

  it("처음 학습하면 1일", () => {
    expect(nextStreak({ streak: 0, longestStreak: 0, lastStudyDate: null }, "2026-10-01")).toEqual({
      streak: 1,
      longestStreak: 1,
      lastStudyDate: "2026-10-01",
    });
  });

  it("같은 날 여러 번 제출해도 늘지 않는다", () => {
    expect(nextStreak(base, "2026-10-01")).toBe(base);
  });

  it("어제 학습했으면 1 늘어난다", () => {
    expect(nextStreak(base, "2026-10-02")).toEqual({ streak: 4, longestStreak: 5, lastStudyDate: "2026-10-02" });
  });

  it("하루 이상 쉬면 1부터 다시 시작하고, 최장 기록은 유지한다", () => {
    expect(nextStreak(base, "2026-10-03")).toEqual({ streak: 1, longestStreak: 5, lastStudyDate: "2026-10-03" });
  });

  it("최장 기록을 넘으면 함께 갱신한다", () => {
    expect(nextStreak({ streak: 5, longestStreak: 5, lastStudyDate: "2026-12-31" }, "2027-01-01")).toEqual({
      streak: 6,
      longestStreak: 6,
      lastStudyDate: "2027-01-01",
    });
  });
});

describe("nextProgress", () => {
  const now = new Date("2026-10-01T12:00:00Z");

  it("처음 틀리면 attempted", () => {
    const p = nextProgress(null, "self_wrong", now);
    expect(p).toMatchObject({ status: "attempted", attempts: 1, firstSolvedAt: null, nextReviewAt: null });
  });

  it("처음 맞히면 solved, 해결 시각과 7일 뒤 복습일을 정한다", () => {
    const p = nextProgress(null, "self_correct", now);
    expect(p).toMatchObject({ status: "solved", attempts: 1, firstSolvedAt: now.toISOString() });
    expect(p.nextReviewAt).toBe("2026-10-08T12:00:00.000Z");
    expect(isNewlySolved(null, p)).toBe(true);
  });

  it("해결한 뒤 틀려도 solved를 유지하고 해결 시각은 바뀌지 않는다", () => {
    const solved = nextProgress(null, "ac", now);
    const later = nextProgress(solved, "self_wrong", new Date("2026-10-05T00:00:00Z"));
    expect(later).toMatchObject({ status: "solved", attempts: 2, firstSolvedAt: now.toISOString() });
    expect(later.nextReviewAt).toBe(solved.nextReviewAt);
    expect(isNewlySolved(solved, later)).toBe(false);
  });

  it("틀린 뒤 맞히면 그때 처음 해결한 것으로 기록한다", () => {
    const tried: ProgressState = nextProgress(null, "self_wrong", now);
    const solvedAt = new Date("2026-10-02T00:00:00Z");
    const p = nextProgress(tried, "self_correct", solvedAt);
    expect(p).toMatchObject({ status: "solved", attempts: 2, firstSolvedAt: solvedAt.toISOString() });
    expect(isNewlySolved(tried, p)).toBe(true);
  });

  it("pending(채점 전)은 정답이 아니다", () => {
    expect(nextProgress(null, "pending", now).status).toBe("attempted");
  });
});

describe("clampSolvingTime", () => {
  it("정상 값은 반올림해서 그대로", () => {
    expect(clampSolvingTime(125.6, 20)).toBe(126);
  });

  it("예상 시간의 3배를 넘으면 상한으로 자른다", () => {
    expect(clampSolvingTime(99_999, 20)).toBe(20 * 60 * 3);
  });

  it("없거나 음수·비정상 값은 기록하지 않는다", () => {
    expect(clampSolvingTime(undefined, 20)).toBeNull();
    expect(clampSolvingTime(-5, 20)).toBeNull();
    expect(clampSolvingTime(Number.NaN, 20)).toBeNull();
    expect(clampSolvingTime(Number.POSITIVE_INFINITY, 20)).toBeNull();
  });
});
