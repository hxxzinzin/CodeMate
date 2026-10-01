import type { DraftStore } from "./draft-storage";

/**
 * 문제별 풀이 시간(화면에 보이는 동안만 누적)을 localStorage에 보관한다.
 * - 새로고침해도 이어서 잰다.
 * - 마지막 기록 후 12시간이 지나면 새로 푸는 것으로 보고 0부터 시작한다.
 */
const PREFIX = "codemate:timer:v1";
export const TIMER_STALE_AFTER_MS = 12 * 60 * 60 * 1000;

type TimerRecord = { activeMs: number; updatedAt: number };

const key = (slug: string) => `${PREFIX}:${slug}`;

export function loadActiveMs(store: DraftStore | null, slug: string, now: number): number {
  try {
    const raw = store?.getItem(key(slug));
    if (!raw) return 0;
    const record = JSON.parse(raw) as Partial<TimerRecord>;
    if (typeof record.activeMs !== "number" || typeof record.updatedAt !== "number") return 0;
    if (record.activeMs < 0 || now - record.updatedAt > TIMER_STALE_AFTER_MS) return 0;
    return record.activeMs;
  } catch {
    return 0;
  }
}

export function saveActiveMs(store: DraftStore | null, slug: string, activeMs: number, now: number): void {
  try {
    store?.setItem(key(slug), JSON.stringify({ activeMs: Math.max(0, Math.round(activeMs)), updatedAt: now }));
  } catch {
    // 시간 기록은 부가 기능이라 저장에 실패해도 무시한다.
  }
}
