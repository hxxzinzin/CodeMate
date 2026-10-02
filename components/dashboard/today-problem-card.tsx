import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";
import { RerollButtons } from "@/components/dashboard/reroll-buttons";
import { ProblemMeta } from "@/components/problems/problem-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LANGUAGE_LABELS } from "@/lib/labels";
import type { DailyProblemView } from "@/lib/recommendation/daily";

/** 대시보드의 "오늘의 문제" 카드 */
export function TodayProblemCard({ daily }: { daily: DailyProblemView | null }) {
  if (!daily) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>오늘의 문제</CardDescription>
          <CardTitle>추천할 문제를 찾지 못했어요</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <Link href="/problems" className="underline underline-offset-4">
            문제 목록
          </Link>
          에서 직접 골라 풀어보세요.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          오늘의 문제 · {LANGUAGE_LABELS[daily.language]}
          {daily.mode === "random" && <span>(랜덤)</span>}
          {daily.solved && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2Icon className="size-3.5" aria-hidden />
              해결함
            </span>
          )}
        </CardDescription>
        <CardTitle className="text-xl">{daily.problem.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ProblemMeta {...daily.problem} />
        <p className="text-sm text-muted-foreground">{daily.reason}</p>
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-3">
        <RerollButtons rerollsLeft={daily.rerollsLeft} />
        <Button asChild>
          <Link href={`/problems/${daily.problem.slug}`}>{daily.solved ? "다시 보기" : "문제 풀기"}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
