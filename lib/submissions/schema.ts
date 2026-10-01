import { z } from "zod";
import { MAX_DRAFT_LENGTH } from "@/lib/editor/draft-storage";
import { CODE_TEMPLATES } from "@/lib/editor/templates";

/** 제출 요청 본문. 문제는 slug로 받고, 서버가 DB에서 다시 확인한다. (클라이언트가 보낸 문제 정보는 믿지 않음) */
export const submissionRequestSchema = z.object({
  slug: z.string({ error: "잘못된 문제 주소예요." }).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "잘못된 문제 주소예요."),
  language: z.enum(["java", "c"], { error: "지원하지 않는 언어예요." }),
  code: z
    .string({ error: "제출할 코드가 올바르지 않아요." })
    .max(MAX_DRAFT_LENGTH, `코드는 ${MAX_DRAFT_LENGTH.toLocaleString()}자 이하로 제출해주세요.`)
    .refine((code) => code.trim().length > 0, "빈 코드는 제출할 수 없어요."),
  /** Judge 도입 전에는 사용자가 예제로 직접 확인한 결과를 받는다. (ADR-003) */
  selfReport: z.enum(["correct", "wrong"], { error: "결과(맞았어요/틀렸어요)를 선택해주세요." }),
  /** 브라우저가 측정한 풀이 시간(초). 서버가 다시 상한을 적용하므로 형식만 확인한다. */
  solvingTimeSec: z
    .number({ error: "풀이 시간 형식이 올바르지 않아요." })
    .int({ error: "풀이 시간 형식이 올바르지 않아요." })
    .min(0, { error: "풀이 시간 형식이 올바르지 않아요." })
    .optional(),
}).refine((req) => !isUntouchedTemplate(req.language, req.code), {
  message: "아직 코드를 작성하지 않았어요. 템플릿에 풀이를 작성한 뒤 제출해주세요.",
  path: ["code"],
});

/** 공백·줄바꿈만 다르고 기본 템플릿과 같은 코드인지 (코드를 작성하지 않고 기록만 쌓는 것 방지) */
export function isUntouchedTemplate(language: "java" | "c", code: string): boolean {
  const strip = (s: string) => s.replace(/\s+/g, "");
  return strip(code) === strip(CODE_TEMPLATES[language]);
}

export type SubmissionRequest = z.infer<typeof submissionRequestSchema>;

/** 검증 실패 시 사용자에게 보여줄 첫 번째 오류 문장 */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "요청 형식이 올바르지 않아요.";
}
