export type UserPreferences = {
  /** 0~100. C 비율은 100 - javaRatio로 계산한다. */
  javaRatio: number;
  preferredDifficulty: number | null;
  timezone: string;
};

export type UserStats = {
  /** 소수 단위 추천 난이도 (예: 3.2) */
  currentDifficulty: number;
  streak: number;
  longestStreak: number;
  solvedCount: number;
  /** 0~1 */
  accuracy: number;
  avgSolvingMinutes: number;
  javaSolved: number;
  cSolved: number;
};
