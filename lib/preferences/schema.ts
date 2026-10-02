import { z } from "zod";

/** 설정 저장 요청. 슬라이더가 10 단위라 서버도 같은 규칙으로 검사한다. (DB check는 0~100만 막음) */
export const preferencesRequestSchema = z.object({
  javaRatio: z
    .number({ error: "비율 형식이 올바르지 않아요." })
    .int({ error: "비율 형식이 올바르지 않아요." })
    .min(0, { error: "비율은 0~100% 사이여야 해요." })
    .max(100, { error: "비율은 0~100% 사이여야 해요." })
    .multipleOf(10, { error: "비율은 10% 단위로 정할 수 있어요." }),
});

export type PreferencesRequest = z.infer<typeof preferencesRequestSchema>;
