import { previousDate } from "@/lib/learning/streak";

/**
 * 화면에 보여줄 연속 학습일.
 * DB의 streak는 제출할 때만 갱신되므로, 며칠 쉬었으면 저장된 값이 그대로 남아 있다.
 * 마지막 학습일이 오늘이나 어제일 때만 저장된 값이 "아직 이어지는 중"이다.
 */
export function displayStreak(streak: number, lastStudyDate: string | null, today: string): number {
  if (!lastStudyDate) return 0;
  return lastStudyDate === today || lastStudyDate === previousDate(today) ? streak : 0;
}

export type DashboardStatsRaw = {
  total_submissions: number;
  correct_submissions: number;
  avg_correct_time_sec: number | null;
  java_solved: number;
  c_solved: number;
  solved_count: number;
};

/** DB 함수(dashboard_stats)의 JSON을 안전하게 숫자로 바꾼다. 형식이 이상하면 0으로 본다. */
export function parseStats(value: unknown): DashboardStatsRaw {
  const v = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
  const num = (key: string) => (typeof v[key] === "number" ? (v[key] as number) : Number(v[key] ?? 0) || 0);
  return {
    total_submissions: num("total_submissions"),
    correct_submissions: num("correct_submissions"),
    avg_correct_time_sec: v.avg_correct_time_sec == null ? null : num("avg_correct_time_sec"),
    java_solved: num("java_solved"),
    c_solved: num("c_solved"),
    solved_count: num("solved_count"),
  };
}

/** 정답률 표시. 제출이 없으면 "-" */
export function formatAccuracy(correct: number, total: number): string {
  return total === 0 ? "-" : `${Math.round((correct / total) * 100)}%`;
}

/** 평균 풀이 시간 표시. 측정값이 없으면 "-" */
export function formatAvgMinutes(seconds: number | null): string {
  if (seconds === null) return "-";
  return seconds < 60 ? "1분 미만" : `${Math.round(seconds / 60)}분`;
}
