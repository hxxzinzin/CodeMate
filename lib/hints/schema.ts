import { z } from "zod";
import { MAX_DRAFT_LENGTH } from "@/lib/editor/draft-storage";

const slug = z.string({ error: "잘못된 문제 주소예요." }).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "잘못된 문제 주소예요.");
const level = z.coerce
  .number({ error: "힌트 단계가 올바르지 않아요." })
  .int({ error: "힌트 단계가 올바르지 않아요." })
  .min(1, { error: "힌트 단계가 올바르지 않아요." })
  .max(4, { error: "힌트 단계가 올바르지 않아요." });

/** GET /api/hints?slug=&level= */
export const staticHintQuerySchema = z.object({ slug, level });

/** POST /api/ai/hint */
export const aiHintRequestSchema = z.object({
  slug,
  level,
  language: z.enum(["java", "c"], { error: "지원하지 않는 언어예요." }),
  code: z
    .string({ error: "코드가 올바르지 않아요." })
    .max(MAX_DRAFT_LENGTH, `코드는 ${MAX_DRAFT_LENGTH.toLocaleString()}자 이하여야 해요.`),
});

export type AiHintRequest = z.infer<typeof aiHintRequestSchema>;
