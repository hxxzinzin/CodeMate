import { NextResponse } from "next/server";

/**
 * 모든 API의 응답 형식.
 *   성공: { ok: true, data }
 *   실패: { ok: false, code, message }  — message는 사용자에게 그대로 보여줘도 되는 문장
 * 개발자용 오류 내용(스택, DB 메시지)은 서버 로그에만 남기고 응답에는 넣지 않는다.
 */
export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = { ok: false; code: ApiErrorCode; message: string };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "UNSUPPORTED_LANGUAGE"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL"
  /** 외부 서비스(AI)가 응답하지 않거나 설정되지 않음 */
  | "SERVICE_UNAVAILABLE"
  /** 외부 서비스(AI)가 처리하지 못함 */
  | "UPSTREAM_ERROR";

const STATUS: Record<ApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INVALID_INPUT: 400,
  NOT_FOUND: 404,
  UNSUPPORTED_LANGUAGE: 400,
  TOO_MANY_REQUESTS: 429,
  INTERNAL: 500,
  SERVICE_UNAVAILABLE: 503,
  UPSTREAM_ERROR: 502,
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, { status });
}

export function fail(code: ApiErrorCode, message: string) {
  return NextResponse.json<ApiFailure>({ ok: false, code, message }, { status: STATUS[code] });
}

/**
 * 다른 사이트에서 보낸 요청(CSRF)을 막는다.
 * 브라우저는 POST 요청에 Origin 헤더를 붙이므로, 우리 사이트 주소와 같은지 확인한다.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
