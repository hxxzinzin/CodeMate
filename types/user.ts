export type UserPreferences = {
  /** 0~100. C 비율은 100 - javaRatio로 계산한다. */
  javaRatio: number;
  preferredDifficulty: number | null;
  timezone: string;
};
