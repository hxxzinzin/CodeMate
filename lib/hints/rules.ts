/** 힌트 단계: 1 핵심 개념 → 2 생각할 부분 → 3 알고리즘 방향 → 4 의사코드 */
export const HINT_LEVELS = [1, 2, 3, 4] as const;
export type HintLevel = (typeof HINT_LEVELS)[number];

export const HINT_LEVEL_LABELS: Record<HintLevel, string> = {
  1: "핵심 개념",
  2: "생각할 부분",
  3: "알고리즘 방향",
  4: "의사코드",
};

export function isHintLevel(value: unknown): value is HintLevel {
  return typeof value === "number" && (HINT_LEVELS as readonly number[]).includes(value);
}

/** 순서대로만 열 수 있다: 지금까지 본 가장 높은 단계 + 1까지. (이미 본 단계는 다시 볼 수 있음) */
export function canOpenLevel(maxViewedLevel: number, level: HintLevel): boolean {
  return level <= maxViewedLevel + 1;
}

/**
 * AI 힌트에서 완성 코드에 가까운 부분을 지운다.
 * 프롬프트로 "코드를 주지 말라"고 해도 새어 나올 수 있어 서버에서 한 번 더 막는다.
 * - 4줄 이상의 코드 블록은 안내 문구로 바꾼다. (짧은 한두 줄 예시는 허용)
 */
export const REMOVED_CODE_NOTICE = "(코드는 생략했어요. 힌트를 보고 직접 작성해보세요!)";
const MAX_CODE_BLOCK_LINES = 3;

export function stripLongCodeBlocks(text: string): { text: string; removed: number } {
  let removed = 0;
  const result = text.replace(/```[^\n]*\n([\s\S]*?)```/g, (block, body: string) => {
    const lines = body.split("\n").filter((line) => line.trim() !== "").length;
    if (lines <= MAX_CODE_BLOCK_LINES) return block;
    removed++;
    return REMOVED_CODE_NOTICE;
  });
  return { text: result.trim(), removed };
}

export type HintUsage = { hintCount: number; maxHintLevel: number };

/** 이번 시도(직전 제출 이후)에 본 힌트 수와 가장 높은 단계 */
export function summarizeHintUsage(levels: number[]): HintUsage {
  const valid = levels.filter((l) => isHintLevel(l));
  return { hintCount: valid.length, maxHintLevel: valid.length ? Math.max(...valid) : 0 };
}
