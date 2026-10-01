"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DraftStore } from "@/lib/editor/draft-storage";
import { loadActiveMs, saveActiveMs } from "@/lib/editor/solving-timer";

const TICK_MS = 15_000;

/**
 * 문제 화면이 보이는 동안만 흐르는 풀이 타이머.
 * 탭이 숨겨지면(다른 탭, 최소화) 멈추고, 다시 보이면 이어서 잰다. (Page Visibility API)
 */
export function useSolvingTimer(store: DraftStore | null, slug: string) {
  // localStorage는 처음 한 번만 읽는다. (useRef(값)은 렌더링마다 인자를 다시 계산하므로 useState 초기화 함수 사용)
  const [initialMs] = useState(() => loadActiveMs(store, slug, Date.now()));
  const accumulated = useRef(initialMs);
  const runningSince = useRef<number | null>(null);
  const [minutes, setMinutes] = useState(() => Math.floor(initialMs / 60_000));

  const elapsedMs = useCallback(
    () => accumulated.current + (runningSince.current === null ? 0 : Date.now() - runningSince.current),
    [],
  );

  const checkpoint = useCallback(() => {
    const now = Date.now();
    if (runningSince.current !== null) {
      accumulated.current += now - runningSince.current;
      runningSince.current = now;
    }
    saveActiveMs(store, slug, accumulated.current, now);
    setMinutes(Math.floor(accumulated.current / 60_000));
  }, [store, slug]);

  useEffect(() => {
    const start = () => {
      if (runningSince.current === null) runningSince.current = Date.now();
    };
    const pause = () => {
      checkpoint();
      runningSince.current = null;
    };
    const onVisibility = () => (document.visibilityState === "visible" ? start() : pause());

    if (document.visibilityState === "visible") start();
    const interval = setInterval(checkpoint, TICK_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", pause);
    return () => {
      pause();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", pause);
    };
  }, [checkpoint]);

  /** 제출에 실을 풀이 시간(초) */
  const elapsedSeconds = useCallback(() => Math.round(elapsedMs() / 1000), [elapsedMs]);

  /** 정답 제출 후 다음 풀이를 위해 0으로 되돌린다. */
  const reset = useCallback(() => {
    accumulated.current = 0;
    runningSince.current = document.visibilityState === "visible" ? Date.now() : null;
    saveActiveMs(store, slug, 0, Date.now());
    setMinutes(0);
  }, [store, slug]);

  return { minutes, elapsedSeconds, reset };
}
