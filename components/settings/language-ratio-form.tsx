"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { ApiResult } from "@/lib/api/response";

type Props = {
  initialJavaRatio: number;
};

type Status = { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string };

/** Java/C 출제 비율 설정. 저장한 값은 다음 추천(새로 뽑기, 다음 날)부터 반영된다. */
export function LanguageRatioForm({ initialJavaRatio }: Props) {
  const [saved, setSaved] = useState(initialJavaRatio);
  const [javaRatio, setJavaRatio] = useState(initialJavaRatio);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const changed = javaRatio !== saved;

  async function save() {
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ javaRatio }),
      });
      const body = (await res.json()) as ApiResult<{ javaRatio: number }>;
      if (!body.ok) {
        setStatus({ kind: "error", message: body.message });
        return;
      }
      setSaved(body.data.javaRatio);
      setJavaRatio(body.data.javaRatio);
      setStatus({ kind: "saved" });
    } catch {
      setStatus({ kind: "error", message: "설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요." });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm tabular-nums">
        <span>Java {javaRatio}%</span>
        <span>C {100 - javaRatio}%</span>
      </div>
      <Slider
        value={[javaRatio]}
        onValueChange={([value]) => {
          setJavaRatio(value);
          setStatus({ kind: "idle" });
        }}
        min={0}
        max={100}
        step={10}
        thumbLabel="Java 출제 비율"
      />
      <p className="text-xs text-muted-foreground">
        오늘의 문제를 고를 때 이 비율에 맞춰 언어를 정해요. 0%나 100%로 정하면 한 언어만 나와요.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={save} disabled={!changed || status.kind === "saving"}>
          {status.kind === "saving" ? "저장 중…" : "저장"}
        </Button>
        <p role="status" aria-live="polite" className="text-xs">
          {status.kind === "saved" && (
            <span className="text-muted-foreground">
              저장했어요. 오늘의 문제는 이미 정해졌으니, 새로 뽑기나 내일 추천부터 반영돼요.
            </span>
          )}
          {status.kind === "error" && <span className="text-destructive">{status.message}</span>}
          {status.kind === "idle" && changed && <span className="text-muted-foreground">저장하지 않은 변경이 있어요.</span>}
        </p>
      </div>
    </div>
  );
}
