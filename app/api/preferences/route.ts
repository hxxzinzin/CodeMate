import { parseAuthedJson } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/response";
import { saveJavaRatio } from "@/lib/db/preferences";
import { preferencesRequestSchema } from "@/lib/preferences/schema";

/** 설정 저장. 지금은 Java/C 출제 비율만 바꿀 수 있다. */
export async function PATCH(request: Request) {
  const req = await parseAuthedJson(request, preferencesRequestSchema, "로그인하면 설정을 저장할 수 있어요.");
  if (!req.ok) return req.response;
  try {
    const javaRatio = await saveJavaRatio(req.user.id, req.data.javaRatio);
    return ok({ javaRatio });
  } catch (error) {
    console.error("[api/preferences] save failed", error);
    return fail("INTERNAL", "설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
  }
}
