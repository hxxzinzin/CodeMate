import type { Language } from "@/types/problem";

/**
 * 작성 중인 코드를 브라우저 localStorage에 저장한다. (ADR-005: 입력할 때마다 DB에 쓰지 않음)
 * - 키에 버전(v1)을 넣어, 저장 형식이 바뀌면 이전 데이터와 섞이지 않게 한다.
 * - 시크릿 모드·용량 초과 등으로 저장소를 쓸 수 없으면 예외 대신 false/null을 돌려준다.
 */
const PREFIX = "codemate:draft:v1";

/** 저장 대상 최대 길이. 제출 시 DB 제약(20,000자)과 맞춘다. */
export const MAX_DRAFT_LENGTH = 20_000;

/** 테스트에서 가짜 저장소를 넣을 수 있도록 필요한 메서드만 정의한다. */
export type DraftStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const codeKey = (slug: string, language: Language) => `${PREFIX}:${slug}:${language}`;
const languageKey = (slug: string) => `${PREFIX}:${slug}:language`;

/** 브라우저 저장소. 접근만 해도 예외가 나는 환경(일부 시크릿 모드)이 있어 감싼다. */
export function browserStore(): DraftStore | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function loadDraft(store: DraftStore | null, slug: string, language: Language): string | null {
  try {
    return store?.getItem(codeKey(slug, language)) ?? null;
  } catch {
    return null;
  }
}

/** 저장에 성공하면 true. 너무 긴 코드나 저장소 오류는 false. */
export function saveDraft(store: DraftStore | null, slug: string, language: Language, code: string): boolean {
  if (!store || code.length > MAX_DRAFT_LENGTH) return false;
  try {
    store.setItem(codeKey(slug, language), code);
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(store: DraftStore | null, slug: string, language: Language): void {
  try {
    store?.removeItem(codeKey(slug, language));
  } catch {
    // 지우지 못해도 화면 동작에는 영향이 없다.
  }
}

export function loadLastLanguage(store: DraftStore | null, slug: string, allowed: Language[]): Language | null {
  try {
    const value = store?.getItem(languageKey(slug));
    // 문제가 더 이상 지원하지 않는 언어가 저장되어 있을 수 있으므로 확인한다.
    return allowed.find((lang) => lang === value) ?? null;
  } catch {
    return null;
  }
}

export function saveLastLanguage(store: DraftStore | null, slug: string, language: Language): void {
  try {
    store?.setItem(languageKey(slug), language);
  } catch {
    // 언어 기억은 부가 기능이라 실패해도 무시한다.
  }
}
