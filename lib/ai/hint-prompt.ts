import { HINT_LEVEL_LABELS, type HintLevel } from "@/lib/hints/rules";
import { problemContext, userCodeBlock } from "@/lib/ai/prompts";
import type { Language, Problem } from "@/types/problem";

const LEVEL_GUIDE: Record<HintLevel, string> = {
  1: "핵심 개념만 짚는다. 어떤 개념·자료구조가 관련 있는지 질문으로 떠올리게 한다. 풀이 방법은 말하지 않는다.",
  2: "어떤 부분을 생각해야 하는지 알려준다. 사용자 코드가 놓친 경우(반례)를 질문으로 제시한다.",
  3: "구체적인 알고리즘 방향을 알려준다. 어떤 순서로 무엇을 처리하면 되는지 설명하되 코드는 쓰지 않는다.",
  4: "의사코드 수준으로 도와준다. 실제 Java/C 문법이 아닌 짧은 의사코드만 쓴다.",
};

/**
 * 사용자 코드에 맞춘 AI 힌트 프롬프트.
 * 같은 단계의 정적 힌트를 참고로 주어 답변이 그 단계를 넘지 않게 한다. (해설은 주지 않음)
 */
export function buildHintPrompt(params: {
  problem: Pick<Problem, "title" | "description" | "input" | "output" | "constraints">;
  level: HintLevel;
  language: Language;
  code: string;
  staticHint: string | null;
}): string {
  const { problem, level, language, code, staticHint } = params;
  return [
    problemContext(problem),
    `## 요청
학습자가 힌트 ${level}단계(${HINT_LEVEL_LABELS[level]})를 요청했다.
이 단계의 기준: ${LEVEL_GUIDE[level]}
- 사용자 코드를 읽고, 지금 코드에 맞는 힌트를 3~5문장으로 준다. 잘한 점이 있으면 한 문장으로 먼저 말한다.
- 이 단계보다 더 많이 알려주지 않는다. 완성된 정답 코드는 절대 쓰지 않는다.
- 코드가 비어 있거나 템플릿뿐이면, 어디서부터 시작하면 좋을지 질문으로 안내한다.`,
    staticHint ? `## 이 단계의 기본 힌트 (참고용, 그대로 반복하지 말 것)\n${staticHint}` : "",
    userCodeBlock(language, code),
  ]
    .filter(Boolean)
    .join("\n\n");
}
