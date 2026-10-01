import "server-only";
import type { z } from "zod";
import { fail, isSameOrigin } from "@/lib/api/response";
import { type CurrentUser, getCurrentUser } from "@/lib/auth";
import { firstIssueMessage } from "@/lib/submissions/schema";

type Parsed<T> = { ok: true; data: T } | { ok: false; response: Response };
type ParsedWithUser<T> = { ok: true; user: CurrentUser; data: T } | { ok: false; response: Response };

/**
 * JSON POST 요청 공통 확인: 1. 같은 사이트에서 온 요청인지(Origin) 2. JSON 형식인지 3. 스키마에 맞는지
 * 로그인은 확인하지 않는다. (Demo도 쓸 수 있는 API용)
 */
export async function parseJson<S extends z.ZodType>(request: Request, schema: S): Promise<Parsed<z.infer<S>>> {
  if (!isSameOrigin(request)) return { ok: false, response: fail("FORBIDDEN", "허용되지 않은 요청이에요.") };
  return parseBody(request, schema);
}

/** 본문(JSON) 파싱 + 스키마 검증 */
async function parseBody<S extends z.ZodType>(request: Request, schema: S): Promise<Parsed<z.infer<S>>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false, response: fail("INVALID_INPUT", "요청 형식이 올바르지 않아요.") };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, response: fail("INVALID_INPUT", firstIssueMessage(parsed.error)) };
  return { ok: true, data: parsed.data };
}

/** parseJson + 로그인 확인. 로그인 사용자만 쓸 수 있는 API용 */
export async function parseAuthedJson<S extends z.ZodType>(
  request: Request,
  schema: S,
  unauthorizedMessage: string,
): Promise<ParsedWithUser<z.infer<S>>> {
  if (!isSameOrigin(request)) return { ok: false, response: fail("FORBIDDEN", "허용되지 않은 요청이에요.") };

  const user = await getCurrentUser();
  if (!user) return { ok: false, response: fail("UNAUTHORIZED", unauthorizedMessage) };

  const parsed = await parseBody(request, schema);
  if (!parsed.ok) return parsed;
  return { ok: true, user, data: parsed.data };
}
