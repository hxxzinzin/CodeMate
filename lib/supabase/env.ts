/**
 * Supabase 공개 환경변수. 브라우저에 노출되어도 되는 값이다. (데이터는 RLS가 보호)
 * NEXT_PUBLIC_ 변수는 빌드 시점에 코드로 치환되므로 process.env.X 형태로 직접 참조해야 한다.
 */
export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase 환경변수가 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 설정하세요.",
    );
  }

  return { url, publishableKey };
}
