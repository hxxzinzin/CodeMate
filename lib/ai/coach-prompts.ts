import { LANGUAGE_REVIEW_FOCUS, problemContext, userCodeBlock } from "@/lib/ai/prompts";
import type { Language, Problem } from "@/types/problem";

type ProblemInfo = Pick<Problem, "title" | "description" | "input" | "output" | "constraints">;

/** 코드 리뷰 섹션 제목. 화면과 테스트에서도 같은 순서를 쓴다. (기획서 14의 리뷰 순서) */
export const REVIEW_SECTIONS = [
  "의도",
  "잘한 점",
  "문제점",
  "고쳐볼 방향",
  "복잡도",
  "엣지 케이스",
  "더 나은 방법",
] as const;

export function buildReviewPrompt(params: { problem: ProblemInfo; language: Language; code: string }): string {
  const { problem, language, code } = params;
  return [
    problemContext(problem),
    `## 요청
학습자가 작성한 코드를 리뷰한다. 아래 제목과 순서를 그대로 쓰고, 각 항목은 1~3문장(목록 가능)으로 짧게 쓴다.

### 의도
코드가 하려는 방법을 한두 문장으로 요약한다.
### 잘한 점
### 문제점
문법 오류·논리 오류가 있으면 어느 부분인지와 이유를 설명한다. 찾지 못했으면 "뚜렷한 오류를 찾지 못했어요"라고 쓴다.
### 고쳐볼 방향
완성 코드 없이, 스스로 고칠 수 있도록 질문이나 방향으로 안내한다.
### 복잡도
시간복잡도 O(...)와 공간복잡도 O(...)를 근거와 함께 한 줄씩 쓴다.
### 엣지 케이스
이 코드로 확인해볼 만한 입력 2~3개를 쓴다.
### 더 나은 방법
더 효율적인 알고리즘이 있을 때만 방향을 쓴다. 없으면 "지금 방법으로 충분해요"라고 쓴다.

주의: 코드를 실행하지 않았으므로 정답 여부를 단정하지 않는다. 제한 조건(입력 크기)을 기준으로 시간 초과 가능성을 판단한다.
${LANGUAGE_REVIEW_FOCUS[language]}`,
    userCodeBlock(language, code),
  ].join("\n\n");
}

export const MAX_QUESTION_CHARS = 300;

export function buildExplainPrompt(params: {
  problem: ProblemInfo;
  question: string;
  language?: Language;
  code?: string;
}): string {
  const { problem, question, language, code } = params;
  return [
    problemContext(problem),
    `## 요청
학습자가 이 문제를 풀다가 개념을 질문했다. 개념을 이해하기 쉽게 4~8문장으로 설명한다.
- 이 문제의 정답 풀이나 완성 코드는 알려주지 않는다. 개념 설명에 필요하면 이 문제와 무관한 아주 짧은 예시(3줄 이하)만 쓴다.
- 질문이 이 문제·프로그래밍 학습과 관련이 없으면, 정중하게 학습 관련 질문을 부탁한다.`,
    `<user_question>\n${question.slice(0, MAX_QUESTION_CHARS)}\n</user_question>`,
    language && code?.trim() ? userCodeBlock(language, code) : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}
