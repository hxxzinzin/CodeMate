/**
 * 연속 학습일(streak) 계산. "하루"는 사용자의 시간대(기본 Asia/Seoul) 기준이다.
 * 서버는 UTC로 동작하므로 new Date().toISOString().slice(0, 10)을 쓰면
 * 한국 시간 오전 9시 전 제출이 전날로 계산되는 버그가 생긴다.
 */

/** 시간대 기준 날짜 문자열 (YYYY-MM-DD) */
export function localDate(now: Date, timeZone: string): string {
  try {
    // en-CA 로캘은 YYYY-MM-DD 형식으로 출력한다.
    return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  } catch {
    // 잘못된 시간대 문자열이면 서비스 기본값을 쓴다.
    return localDate(now, "Asia/Seoul");
  }
}

/** YYYY-MM-DD의 전날 */
export function previousDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export type StreakState = {
  streak: number;
  longestStreak: number;
  /** 마지막으로 학습한 날 (YYYY-MM-DD), 없으면 null */
  lastStudyDate: string | null;
};

/**
 * 오늘 학습했을 때의 새 streak.
 * - 오늘 이미 학습했으면 그대로
 * - 마지막 학습일이 어제면 +1
 * - 그 외(처음이거나 하루 이상 쉼)면 1부터 다시
 */
export function nextStreak(prev: StreakState, today: string): StreakState {
  if (prev.lastStudyDate === today) return prev;
  const streak = prev.lastStudyDate === previousDate(today) ? prev.streak + 1 : 1;
  return { streak, longestStreak: Math.max(prev.longestStreak, streak), lastStudyDate: today };
}
