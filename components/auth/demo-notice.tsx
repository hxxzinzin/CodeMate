import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

/** 비로그인 사용자에게만 Demo Mode 안내를 보여준다. */
export async function DemoNotice() {
  if (await getCurrentUser()) return null;

  return (
    <div role="note" className="mb-6 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
      <span className="font-medium">Demo Mode</span>
      <span className="text-muted-foreground">
        {" "}
        · 문제를 보고 코드를 작성해볼 수 있지만 풀이 기록은 저장되지 않아요.{" "}
      </span>
      <Link href="/login?next=/problems" className="font-medium underline underline-offset-4">
        로그인하기
      </Link>
    </div>
  );
}
