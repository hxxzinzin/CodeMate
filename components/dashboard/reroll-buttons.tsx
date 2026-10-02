"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ApiResult } from "@/lib/api/response";

/** 오늘의 문제 새로 뽑기 (추천 / 랜덤). 하루 횟수가 정해져 있어 남은 횟수를 보여준다. */
export function RerollButtons({ rerollsLeft }: { rerollsLeft: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const busy = pending || refreshing;

  async function reroll(mode: "recommended" | "random") {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const body = (await res.json()) as ApiResult<unknown>;
      if (!body.ok) setError(body.message);
      // 서버 컴포넌트(대시보드)를 다시 렌더링해 새 문제를 보여준다.
      else startRefresh(() => router.refresh());
    } catch {
      setError("새 문제를 뽑지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setPending(false);
    }
  }

  if (rerollsLeft <= 0) {
    return <p className="text-xs text-muted-foreground">오늘은 새로 뽑기를 모두 사용했어요.</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1">
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => reroll("recommended")}>
          다른 추천 문제
        </Button>
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => reroll("random")}>
          랜덤 문제
        </Button>
        <span className="text-xs text-muted-foreground">남은 횟수 {rerollsLeft}회</span>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
