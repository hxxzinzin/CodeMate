import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProblemNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
      <h1 className="text-xl font-semibold">문제를 찾을 수 없어요</h1>
      <p className="text-sm text-muted-foreground">주소가 잘못되었거나, 더 이상 제공하지 않는 문제예요.</p>
      <Button asChild variant="outline">
        <Link href="/problems">문제 목록으로</Link>
      </Button>
    </div>
  );
}
