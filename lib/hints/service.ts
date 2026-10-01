import "server-only";
import type { ApiErrorCode } from "@/lib/api/response";
import { buildHintPrompt } from "@/lib/ai/hint-prompt";
import { COACH_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { type AiCaller, callAi } from "@/lib/ai/usage";
import { getHintEvents, getStaticHint } from "@/lib/db/hints";
import { getProblemBySlug } from "@/lib/db/problems";
import { recordLearningEvent } from "@/lib/db/submissions";
import type { AiHintRequest } from "@/lib/hints/schema";
import { canOpenLevel, type HintLevel, stripLongCodeBlocks } from "@/lib/hints/rules";

type Failure = { ok: false; code: ApiErrorCode; message: string };

/** 사용자가 이 문제에서 연 정적 힌트의 최고 단계 (없으면 0) */
export async function getViewedStaticLevel(userId: string, problemId: string): Promise<number> {
  const events = await getHintEvents(userId, problemId);
  return events.filter((e) => e.source === "static").reduce((max, e) => Math.max(max, e.level), 0);
}

export type StaticHintResult = { ok: true; level: HintLevel; content: string } | Failure;

/**
 * 정적 힌트 조회.
 * - 로그인 사용자: 순서대로만 열 수 있고, 처음 여는 단계만 학습 이력에 남긴다. (다시 보기는 사용 횟수에 넣지 않음)
 * - 비로그인(Demo): 기록 없이 조회만 한다. 순서는 화면에서 안내한다.
 */
export async function getStaticHintFor(userId: string | null, slug: string, level: HintLevel): Promise<StaticHintResult> {
  const problem = await getProblemBySlug(slug);
  if (!problem) return { ok: false, code: "NOT_FOUND", message: "문제를 찾을 수 없어요." };

  let viewed = 0;
  if (userId) {
    viewed = await getViewedStaticLevel(userId, problem.id);
    if (!canOpenLevel(viewed, level)) {
      return { ok: false, code: "FORBIDDEN", message: "이전 단계 힌트를 먼저 확인해주세요." };
    }
  }

  const content = await getStaticHint(problem.id, level);
  if (!content) return { ok: false, code: "NOT_FOUND", message: "이 단계의 힌트가 없어요." };

  if (userId && level > viewed) {
    await recordLearningEvent(userId, problem.id, "hint_request", { level, source: "static" });
  }
  return { ok: true, level, content };
}

export type AiHintResult = { ok: true; level: HintLevel; content: string; model: string } | Failure;

/**
 * 사용자 코드에 맞춘 AI 힌트. 로그인 사용자와 Demo 모두 쓸 수 있다. (Demo는 하루 체험 횟수 제한)
 * AI 오류(AiError, AiQuotaError)는 호출한 쪽에서 응답으로 바꾼다.
 */
export async function getAiHint(caller: AiCaller, req: AiHintRequest): Promise<AiHintResult> {
  const problem = await getProblemBySlug(req.slug);
  if (!problem) return { ok: false, code: "NOT_FOUND", message: "문제를 찾을 수 없어요." };
  if (!problem.languages.includes(req.language)) {
    return { ok: false, code: "UNSUPPORTED_LANGUAGE", message: "이 문제는 선택한 언어를 지원하지 않아요." };
  }

  const level = req.level as HintLevel;
  const staticHint = await getStaticHint(problem.id, level);
  const result = await callAi({
    kind: "hint",
    caller,
    problemId: problem.id,
    system: COACH_SYSTEM_PROMPT,
    prompt: buildHintPrompt({ problem, level, language: req.language, code: req.code, staticHint }),
    maxOutputTokens: 400,
    meta: { slug: problem.slug, level, language: req.language },
  });

  const { text, removed } = stripLongCodeBlocks(result.text);
  if ("userId" in caller) {
    await recordLearningEvent(caller.userId, problem.id, "hint_request", {
      level,
      source: "ai",
      model: result.model,
      cached: result.cached,
      removedCodeBlocks: removed,
    });
  }

  return { ok: true, level, content: text, model: result.model };
}
