import "server-only";
import type { ApiErrorCode } from "@/lib/api/response";
import { buildExplainPrompt, buildReviewPrompt } from "@/lib/ai/coach-prompts";
import { COACH_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { callAi } from "@/lib/ai/usage";
import type { ExplainRequest, ReviewRequest, SolutionRequest } from "@/lib/coach/schema";
import { getSolution } from "@/lib/db/hints";
import { getProblemBySlug } from "@/lib/db/problems";
import { recordLearningEvent } from "@/lib/db/submissions";
import { stripLongCodeBlocks } from "@/lib/hints/rules";
import { isUntouchedTemplate } from "@/lib/submissions/schema";
import type { Problem } from "@/types/problem";

type Failure = { ok: false; code: ApiErrorCode; message: string };
type Text = { ok: true; content: string };

async function findProblem(slug: string, language?: "java" | "c"): Promise<Problem | Failure> {
  const problem = await getProblemBySlug(slug);
  if (!problem) return { ok: false, code: "NOT_FOUND", message: "문제를 찾을 수 없어요." };
  if (language && !problem.languages.includes(language)) {
    return { ok: false, code: "UNSUPPORTED_LANGUAGE", message: "이 문제는 선택한 언어를 지원하지 않아요." };
  }
  return problem;
}

const isFailure = (v: Problem | Failure): v is Failure => "ok" in v;

/** AI 코드 리뷰. 아직 코드를 쓰지 않았으면 AI를 부르지 않는다. (무료 한도 절약) */
export async function reviewCode(userId: string, req: ReviewRequest): Promise<Text | Failure> {
  if (!req.code.trim() || isUntouchedTemplate(req.language, req.code)) {
    return { ok: false, code: "INVALID_INPUT", message: "리뷰할 코드가 없어요. 풀이를 조금이라도 작성한 뒤 요청해주세요." };
  }
  const problem = await findProblem(req.slug, req.language);
  if (isFailure(problem)) return problem;

  const result = await callAi({
    kind: "review",
    caller: { userId },
    problemId: problem.id,
    system: COACH_SYSTEM_PROMPT,
    prompt: buildReviewPrompt({ problem, language: req.language, code: req.code }),
    maxOutputTokens: 900,
    temperature: 0.3,
    meta: { slug: problem.slug, language: req.language },
  });
  const { text, removed } = stripLongCodeBlocks(result.text);
  await recordLearningEvent(userId, problem.id, "review_request", {
    kind: "review",
    language: req.language,
    model: result.model,
    cached: result.cached,
    removedCodeBlocks: removed,
  });
  return { ok: true, content: text };
}

/** 개념 질문. 이 문제의 정답은 알려주지 않는다. */
export async function explainConcept(userId: string, req: ExplainRequest): Promise<Text | Failure> {
  const problem = await findProblem(req.slug, req.language);
  if (isFailure(problem)) return problem;

  const result = await callAi({
    kind: "explain",
    caller: { userId },
    problemId: problem.id,
    system: COACH_SYSTEM_PROMPT,
    prompt: buildExplainPrompt({ problem, question: req.question, language: req.language, code: req.code }),
    maxOutputTokens: 600,
    meta: { slug: problem.slug },
  });
  const { text, removed } = stripLongCodeBlocks(result.text);
  await recordLearningEvent(userId, problem.id, "review_request", {
    kind: "explain",
    model: result.model,
    cached: result.cached,
    removedCodeBlocks: removed,
  });
  return { ok: true, content: text };
}

export type SolutionResult = { ok: true; explanation: string; code: string | null } | Failure;

/**
 * 정답 풀이. AI가 만든 답이 아니라, 테스트를 통과한 정답 코드와 작성된 해설을 보여준다.
 * (AI 정답은 틀릴 수 있고, 무료 한도도 쓰지 않음) 본 기록은 다음 제출의 solution_revealed에 반영된다.
 */
export async function revealSolution(userId: string, req: SolutionRequest): Promise<SolutionResult> {
  const problem = await findProblem(req.slug, req.language);
  if (isFailure(problem)) return problem;

  const solution = await getSolution(problem.id);
  if (!solution) return { ok: false, code: "NOT_FOUND", message: "이 문제의 해설이 아직 없어요." };

  await recordLearningEvent(userId, problem.id, "solution_reveal", { language: req.language });
  return { ok: true, explanation: solution.explanation, code: solution.referenceCode[req.language] ?? null };
}
