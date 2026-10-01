import "server-only";
import { cookies } from "next/headers";

/**
 * 비로그인(Demo) 사용자를 구분하는 쿠키. 하루 AI 체험 횟수를 세는 데만 쓴다.
 * 쿠키를 지우면 다시 받을 수 있지만, 서비스 전체 한도(AI_LIMITS.total)가 남용을 막는다.
 */
const COOKIE = "cm_demo";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Route Handler 안에서만 호출한다. (쿠키를 새로 쓸 수 있는 곳) */
export async function getOrCreateDemoId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(COOKIE)?.value;
  if (existing && UUID.test(existing)) return existing;

  const id = crypto.randomUUID();
  store.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return id;
}

/** 쿠키가 있으면 읽기만 한다. (사용량 조회용) */
export async function readDemoId(): Promise<string | null> {
  const value = (await cookies()).get(COOKIE)?.value;
  return value && UUID.test(value) ? value : null;
}
