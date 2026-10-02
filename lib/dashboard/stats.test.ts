import { describe, expect, it } from "vitest";
import { displayStreak, formatAccuracy, formatAvgMinutes, parseStats } from "./stats";

describe("displayStreak", () => {
  const today = "2026-10-02";

  it("오늘이나 어제 학습했으면 저장된 연속 일수를 그대로 보여준다", () => {
    expect(displayStreak(12, "2026-10-02", today)).toBe(12);
    expect(displayStreak(12, "2026-10-01", today)).toBe(12); // 오늘 아직 안 풀었어도 끊긴 건 아니다
  });

  it("이틀 이상 쉬었으면 0 (DB 값은 다음 제출 때 갱신되므로 화면에서 바로잡는다)", () => {
    expect(displayStreak(12, "2026-09-30", today)).toBe(0);
  });

  it("학습 기록이 없으면 0", () => {
    expect(displayStreak(0, null, today)).toBe(0);
  });

  it("월초 경계: 10월 1일의 어제는 9월 30일", () => {
    expect(displayStreak(5, "2026-09-30", "2026-10-01")).toBe(5);
  });
});

describe("parseStats", () => {
  it("DB 함수 JSON을 숫자로 바꾼다", () => {
    expect(
      parseStats({ total_submissions: 4, correct_submissions: 3, avg_correct_time_sec: 750, java_solved: 2, c_solved: 1, solved_count: 2 }),
    ).toEqual({ total_submissions: 4, correct_submissions: 3, avg_correct_time_sec: 750, java_solved: 2, c_solved: 1, solved_count: 2 });
  });

  it("값이 없거나 형식이 이상하면 0, 평균 시간이 없으면 null", () => {
    expect(parseStats(null)).toEqual({
      total_submissions: 0,
      correct_submissions: 0,
      avg_correct_time_sec: null,
      java_solved: 0,
      c_solved: 0,
      solved_count: 0,
    });
    expect(parseStats({ total_submissions: "7" }).total_submissions).toBe(7);
  });
});

describe("formatters", () => {
  it("정답률", () => {
    expect(formatAccuracy(0, 0)).toBe("-");
    expect(formatAccuracy(3, 4)).toBe("75%");
  });

  it("평균 풀이 시간", () => {
    expect(formatAvgMinutes(null)).toBe("-");
    expect(formatAvgMinutes(30)).toBe("1분 미만");
    expect(formatAvgMinutes(750)).toBe("13분");
  });
});
