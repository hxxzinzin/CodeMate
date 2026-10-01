import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-1 flex-col justify-center gap-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">CodeMate</h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          매일 나에게 맞는 Java·C 코딩테스트 문제를 풀고, AI 코치의 단계별 힌트로 스스로 해결하는 힘을 기르세요.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {user ? (
          <Button asChild size="lg">
            <Link href="/dashboard">오늘의 문제 보러 가기</Link>
          </Button>
        ) : (
          <>
            <Button asChild size="lg">
              <Link href="/login">Google로 시작하기</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/problems">로그인 없이 둘러보기</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
