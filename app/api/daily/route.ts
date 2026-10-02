import { z } from "zod";
import { parseAuthedJson } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth";
import { getTodayProblem, rerollTodayProblem } from "@/lib/recommendation/daily";

/** 오늘의 문제 조회 (없으면 추천해서 저장) */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHORIZED", "로그인하면 매일 나에게 맞는 문제를 추천받을 수 있어요.");
  try {
    const daily = await getTodayProblem(user.id);
    if (!daily) return fail("NOT_FOUND", "추천할 문제가 없어요.");
    return ok(daily);
  } catch (error) {
    console.error("[api/daily] get failed", error);
    return fail("INTERNAL", "오늘의 문제를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
  }
}

const rerollSchema = z.object({
  mode: z.enum(["recommended", "random"], { error: "뽑기 방식이 올바르지 않아요." }),
});

/** 새로 뽑기 (하루 2회). mode: recommended(추천) | random(랜덤) */
export async function POST(request: Request) {
  const req = await parseAuthedJson(request, rerollSchema, "로그인하면 오늘의 문제를 새로 뽑을 수 있어요.");
  if (!req.ok) return req.response;
  try {
    const result = await rerollTodayProblem(req.user.id, req.data.mode);
    if (!result.ok) return fail("TOO_MANY_REQUESTS", result.message);
    return ok(result.daily);
  } catch (error) {
    console.error("[api/daily] reroll failed", error);
    return fail("INTERNAL", "새 문제를 뽑지 못했어요. 잠시 후 다시 시도해주세요.");
  }
}
