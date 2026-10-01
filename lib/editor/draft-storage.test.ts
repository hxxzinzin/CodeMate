import { describe, expect, it } from "vitest";
import {
  clearDraft,
  type DraftStore,
  loadDraft,
  loadLastLanguage,
  MAX_DRAFT_LENGTH,
  saveDraft,
  saveLastLanguage,
} from "./draft-storage";

function memoryStore(): DraftStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

/** 시크릿 모드·용량 초과처럼 모든 접근이 실패하는 저장소 */
const brokenStore: DraftStore = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
  removeItem: () => {
    throw new Error("SecurityError");
  },
};

describe("draft storage", () => {
  it("문제별·언어별로 따로 저장하고 불러온다", () => {
    const store = memoryStore();
    expect(saveDraft(store, "valid-brackets", "java", "class Main {}")).toBe(true);
    saveDraft(store, "valid-brackets", "c", "int main(void) {}");
    saveDraft(store, "max-min", "java", "다른 문제");

    expect(loadDraft(store, "valid-brackets", "java")).toBe("class Main {}");
    expect(loadDraft(store, "valid-brackets", "c")).toBe("int main(void) {}");
    expect(loadDraft(store, "max-min", "java")).toBe("다른 문제");
    expect(loadDraft(store, "max-min", "c")).toBeNull();
  });

  it("초기화하면 그 언어의 코드만 지운다", () => {
    const store = memoryStore();
    saveDraft(store, "p", "java", "j");
    saveDraft(store, "p", "c", "c");
    clearDraft(store, "p", "java");
    expect(loadDraft(store, "p", "java")).toBeNull();
    expect(loadDraft(store, "p", "c")).toBe("c");
  });

  it("빈 코드도 저장한다 (사용자가 전부 지운 상태도 유지)", () => {
    const store = memoryStore();
    saveDraft(store, "p", "java", "");
    expect(loadDraft(store, "p", "java")).toBe("");
  });

  it("최대 길이를 넘는 코드는 저장하지 않는다", () => {
    const store = memoryStore();
    expect(saveDraft(store, "p", "java", "a".repeat(MAX_DRAFT_LENGTH + 1))).toBe(false);
    expect(loadDraft(store, "p", "java")).toBeNull();
    expect(saveDraft(store, "p", "java", "a".repeat(MAX_DRAFT_LENGTH))).toBe(true);
  });

  it("저장소를 쓸 수 없어도 예외 없이 실패를 알린다", () => {
    expect(saveDraft(brokenStore, "p", "java", "x")).toBe(false);
    expect(loadDraft(brokenStore, "p", "java")).toBeNull();
    expect(() => clearDraft(brokenStore, "p", "java")).not.toThrow();
    expect(loadLastLanguage(brokenStore, "p", ["java"])).toBeNull();
    expect(() => saveLastLanguage(brokenStore, "p", "java")).not.toThrow();
    expect(saveDraft(null, "p", "java", "x")).toBe(false);
  });

  it("마지막 언어는 문제가 지원하는 언어일 때만 돌려준다", () => {
    const store = memoryStore();
    saveLastLanguage(store, "p", "c");
    expect(loadLastLanguage(store, "p", ["java", "c"])).toBe("c");
    expect(loadLastLanguage(store, "p", ["java"])).toBeNull();
    expect(loadLastLanguage(store, "other", ["java", "c"])).toBeNull();
  });
});
