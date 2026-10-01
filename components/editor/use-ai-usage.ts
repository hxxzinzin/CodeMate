"use client";

import { useCallback, useState } from "react";
import type { ApiResult } from "@/lib/api/response";

export type AiUsage = { used: number; limit: number };

/** 오늘 AI 사용량. 패널을 열거나 AI를 쓴 뒤에 refresh로 다시 불러온다. */
export function useAiUsage() {
  const [usage, setUsage] = useState<AiUsage | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/usage", { cache: "no-store" });
      const body = (await res.json()) as ApiResult<AiUsage>;
      if (body.ok) setUsage(body.data);
    } catch {
      // 사용량 표시는 부가 정보라 실패해도 조용히 넘어간다.
    }
  }, []);

  return { usage, refresh };
}

export function usageLabel(usage: AiUsage | null): string | null {
  return usage ? `오늘 AI ${usage.used}/${usage.limit}회` : null;
}
