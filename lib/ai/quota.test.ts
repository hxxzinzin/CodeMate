import { describe, expect, it } from "vitest";
import { AI_LIMITS, checkLimit, limitMessage, requestHash, startOfTodayKst } from "./quota";

describe("requestHash", () => {
  it("같은 요청은 같은 키, 내용이나 종류가 다르면 다른 키", () => {
    const a = requestHash("hint", "sys", "prompt");
    expect(requestHash("hint", "sys", "prompt")).toBe(a);
    expect(requestHash("review", "sys", "prompt")).not.toBe(a);
    expect(requestHash("hint", "sys", "prompt ")).not.toBe(a);
    expect(requestHash("hint", "sys2", "prompt")).not.toBe(a);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("startOfTodayKst", () => {
  it("한국 시간 0시(= 전날 UTC 15시)를 돌려준다", () => {
    expect(startOfTodayKst(new Date("2026-10-02T10:00:00Z"))).toBe("2026-10-01T15:00:00.000Z");
    // KST 10월 3일 00:30 → 오늘 시작은 10월 3일 0시
    expect(startOfTodayKst(new Date("2026-10-02T15:30:00Z"))).toBe("2026-10-02T15:00:00.000Z");
    // KST 10월 2일 23:59 → 아직 10월 2일
    expect(startOfTodayKst(new Date("2026-10-02T14:59:00Z"))).toBe("2026-10-01T15:00:00.000Z");
  });
});

describe("checkLimit", () => {
  it("한도 안이면 허용", () => {
    expect(checkLimit({ mine: AI_LIMITS.perUser - 1, total: 0 }, false)).toEqual({ allowed: true });
    expect(checkLimit({ mine: AI_LIMITS.perDemo - 1, total: 0 }, true)).toEqual({ allowed: true });
  });

  it("로그인 사용자와 Demo는 한도가 다르다", () => {
    expect(checkLimit({ mine: AI_LIMITS.perUser, total: 0 }, false)).toMatchObject({ allowed: false, reason: "user" });
    expect(checkLimit({ mine: AI_LIMITS.perDemo, total: 0 }, true)).toMatchObject({ allowed: false, reason: "demo" });
  });

  it("서비스 전체 한도가 가장 먼저 적용된다", () => {
    expect(checkLimit({ mine: 0, total: AI_LIMITS.total }, false)).toMatchObject({ allowed: false, reason: "total" });
  });

  it("모든 한도 안내는 한국어이고 숫자를 포함한다", () => {
    for (const d of [checkLimit({ mine: 99, total: 0 }, false), checkLimit({ mine: 99, total: 0 }, true)]) {
      if (d.allowed) throw new Error("expected limit");
      expect(limitMessage(d)).toMatch(/[가-힣]/);
      expect(limitMessage(d)).toContain(String(d.limit));
    }
  });
});
