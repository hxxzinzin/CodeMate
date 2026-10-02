import { describe, expect, it } from "vitest";
import { preferencesRequestSchema } from "./schema";

const parse = (javaRatio: unknown) => preferencesRequestSchema.safeParse({ javaRatio });
const message = (javaRatio: unknown) => {
  const r = parse(javaRatio);
  return r.success ? null : r.error.issues[0].message;
};

describe("preferencesRequestSchema", () => {
  it("0~100 사이 10 단위는 통과 (한 언어만 0%·100%도 허용)", () => {
    for (const v of [0, 10, 70, 100]) expect(parse(v).success).toBe(true);
  });

  it("범위를 벗어나면 한국어 안내", () => {
    expect(message(-10)).toBe("비율은 0~100% 사이여야 해요.");
    expect(message(110)).toBe("비율은 0~100% 사이여야 해요.");
  });

  it("10 단위가 아니거나 정수가 아니면 거부", () => {
    expect(message(75)).toBe("비율은 10% 단위로 정할 수 있어요.");
    expect(message(70.5)).toBe("비율 형식이 올바르지 않아요.");
  });

  it("숫자가 아니면 거부 (문자열 \"70\"도 받지 않음)", () => {
    expect(message("70")).toBe("비율 형식이 올바르지 않아요.");
    expect(message(undefined)).toBe("비율 형식이 올바르지 않아요.");
  });
});
