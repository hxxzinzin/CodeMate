import { describe, expect, it } from "vitest";
import type { JudgeSummary } from "@/types/submission";
import { skillSkipReason } from "./measurable";

const failedAt = (number: number, message?: string): JudgeSummary => ({
  passed: number - 1,
  total: 8,
  maxTimeSec: null,
  failed: { number, sample: number <= 2 },
  ...(message && { message }),
});

describe("skillSkipReason", () => {
  it("컴파일 에러는 반영하지 않는다 (C)", () => {
    expect(skillSkipReason("ce", "c", failedAt(1, "1:21: error: expected ';'"))).toBe("compile_error");
  });

  it("Java가 첫 테스트부터 메시지 없이 실패하면 컴파일 에러일 수 있어 반영하지 않는다 (배포 사이트에서 확인한 사례)", () => {
    expect(skillSkipReason("re", "java", failedAt(1))).toBe("possible_compile_error");
  });

  it("Java가 예제를 통과한 뒤 실패하면 컴파일 에러일 수 없으므로 반영한다", () => {
    expect(skillSkipReason("re", "java", failedAt(3))).toBeNull();
  });

  it("C의 실행 에러는 반영한다 (C 컴파일 에러는 서비스가 따로 알려줌)", () => {
    expect(skillSkipReason("re", "c", failedAt(1))).toBeNull();
  });

  it("에러 메시지가 있는 실행 에러는 런타임 에러가 확실하므로 반영한다", () => {
    expect(skillSkipReason("re", "java", failedAt(1, "Exception in thread \"main\""))).toBeNull();
  });

  it("오답·시간 초과·정답·자기 보고는 반영한다", () => {
    expect(skillSkipReason("wa", "java", failedAt(1))).toBeNull();
    expect(skillSkipReason("tle", "java", failedAt(1))).toBeNull();
    expect(skillSkipReason("ac", "java", { passed: 8, total: 8, maxTimeSec: 1.2 })).toBeNull();
    expect(skillSkipReason("self_wrong", "java", null)).toBeNull();
  });
});
