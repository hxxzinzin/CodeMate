import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, safeRedirectPath } from "@/lib/auth";

export const metadata: Metadata = { title: "로그인 | CodeMate" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeRedirectPath(typeof params.next === "string" ? params.next : null);

  if (await getCurrentUser()) {
    redirect(next);
  }

  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">CodeMate 시작하기</CardTitle>
          <CardDescription>로그인하면 풀이 기록과 실력이 저장되고, 매일 나에게 맞는 문제를 추천받을 수 있어요.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {params.error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              로그인하지 못했어요. 다시 시도해주세요.
            </p>
          )}
          <GoogleSignInButton next={next} />
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/problems" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            로그인 없이 둘러보기 (Demo)
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
