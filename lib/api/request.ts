import "server-only";
import type { z } from "zod";
import { fail, isSameOrigin } from "@/lib/api/response";
import { type CurrentUser, getCurrentUser } from "@/lib/auth";
import { firstIssueMessage } from "@/lib/submissions/schema";

type Parsed<T> = { ok: true; user: CurrentUser; data: T } | { ok: false; response: Response };

/**
 * 로그인 사용자의 JSON POST 요청을 공통으로 확인한다.
 * 1. 같은 사이트에서 온 요청인지(Origin) 2. 로그인했는지 3. JSON 형식인지 4. 스키마에 맞는지
 */
export async function parseAuthedJson<S extends z.ZodType>(
  request: Request,
  schema: S,
  unauthorizedMessage: string,
): Promise<Parsed<z.infer<S>>> {
  if (!isSameOrigin(request)) return { ok: false, response: fail("FORBIDDEN", "허용되지 않은 요청이에요.") };

  const user = await getCurrentUser();
  if (!user) return { ok: false, response: fail("UNAUTHORIZED", unauthorizedMessage) };

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false, response: fail("INVALID_INPUT", "요청 형식이 올바르지 않아요.") };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, response: fail("INVALID_INPUT", firstIssueMessage(parsed.error)) };
  return { ok: true, user, data: parsed.data };
}
