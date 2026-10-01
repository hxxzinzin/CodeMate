import { describe, expect, it } from "vitest";
import type { DraftStore } from "./draft-storage";
import { loadActiveMs, saveActiveMs, TIMER_STALE_AFTER_MS } from "./solving-timer";

function memoryStore(): DraftStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe("solving timer storage", () => {
  const now = 1_800_000_000_000;

  it("저장한 누적 시간을 문제별로 불러온다", () => {
    const store = memoryStore();
    saveActiveMs(store, "a", 90_000, now);
    expect(loadActiveMs(store, "a", now + 1000)).toBe(90_000);
    expect(loadActiveMs(store, "b", now)).toBe(0);
  });

  it("마지막 기록 후 12시간이 지나면 0부터 다시 잰다", () => {
    const store = memoryStore();
    saveActiveMs(store, "a", 90_000, now);
    expect(loadActiveMs(store, "a", now + TIMER_STALE_AFTER_MS)).toBe(90_000);
    expect(loadActiveMs(store, "a", now + TIMER_STALE_AFTER_MS + 1)).toBe(0);
  });

  it("손상된 값이나 음수는 0으로 취급한다", () => {
    const store = memoryStore();
    store.setItem("codemate:timer:v1:a", "{not json");
    expect(loadActiveMs(store, "a", now)).toBe(0);
    store.setItem("codemate:timer:v1:a", JSON.stringify({ activeMs: -5, updatedAt: now }));
    expect(loadActiveMs(store, "a", now)).toBe(0);
    store.setItem("codemate:timer:v1:a", JSON.stringify({ activeMs: "10" }));
    expect(loadActiveMs(store, "a", now)).toBe(0);
  });

  it("저장소가 없어도 예외 없이 동작한다", () => {
    expect(loadActiveMs(null, "a", now)).toBe(0);
    expect(() => saveActiveMs(null, "a", 1, now)).not.toThrow();
  });
});
