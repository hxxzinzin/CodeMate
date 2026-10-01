import Link from "next/link";

/** 비로그인 사용자에게 보여주는 Demo Mode 안내. 로그인 여부는 페이지에서 판단한다. */
export function DemoNotice({ next }: { next: string }) {
  return (
    <div role="note" className="mb-6 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
      <span className="font-medium">Demo Mode</span>
      <span className="text-muted-foreground">
        {" "}
        · 문제를 보고 코드를 작성해볼 수 있지만 풀이 기록은 저장되지 않아요.{" "}
      </span>
      <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium underline underline-offset-4">
        로그인하기
      </Link>
    </div>
  );
}
