import { z } from "zod";
import { MAX_QUESTION_CHARS } from "@/lib/ai/coach-prompts";
import { MAX_DRAFT_LENGTH } from "@/lib/editor/draft-storage";

const slug = z.string({ error: "잘못된 문제 주소예요." }).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "잘못된 문제 주소예요.");
const language = z.enum(["java", "c"], { error: "지원하지 않는 언어예요." });
const code = z
  .string({ error: "코드가 올바르지 않아요." })
  .max(MAX_DRAFT_LENGTH, `코드는 ${MAX_DRAFT_LENGTH.toLocaleString()}자 이하여야 해요.`);

/** POST /api/ai/review */
export const reviewRequestSchema = z.object({ slug, language, code });

/** POST /api/ai/explain — 코드는 선택 (질문 맥락용) */
export const explainRequestSchema = z.object({
  slug,
  question: z
    .string({ error: "질문을 입력해주세요." })
    .trim()
    .min(2, { error: "질문을 2자 이상 입력해주세요." })
    .max(MAX_QUESTION_CHARS, { error: `질문은 ${MAX_QUESTION_CHARS}자 이하로 입력해주세요.` }),
  language: language.optional(),
  code: code.optional(),
});

/** POST /api/ai/solution — 실수로 정답을 보는 일이 없도록 confirm: true를 반드시 받는다. */
export const solutionRequestSchema = z.object({
  slug,
  language,
  confirm: z.literal(true, { error: "정답 보기를 한 번 더 확인해주세요." }),
});

export type ReviewRequest = z.infer<typeof reviewRequestSchema>;
export type ExplainRequest = z.infer<typeof explainRequestSchema>;
export type SolutionRequest = z.infer<typeof solutionRequestSchema>;
