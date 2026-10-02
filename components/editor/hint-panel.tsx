"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, LightbulbIcon, SparklesIcon } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import type { ApiResult } from "@/lib/api/response";
import { HINT_LEVEL_LABELS, type HintLevel } from "@/lib/hints/rules";
import { cn } from "@/lib/utils";
import type { Language } from "@/types/problem";

type Props = {
  slug: string;
  language: Language;
  getCode: () => string;
  isLoggedIn: boolean;
  /** 화면을 본 시간(분). 10분 전에는 먼저 고민해보도록 안내한다. */
  solvingMinutes: number;
  /** 이전에 연 정적 힌트의 최고 단계 (로그인 사용자) */
  initialViewedLevel: number;
  /** 열림 상태는 작업 영역이 관리한다. (힌트·AI 코치 패널 중 하나만 열리도록) */
  open: boolean;
  onToggle: () => void;
  /** 오늘 AI 사용량 표시 (예: "오늘 AI 2/3회") */
  usageText: string | null;
  /** AI를 호출한 뒤 사용량을 다시 불러온다. */
  onAiUsed: () => void;
  /** 힌트를 모두 본 뒤 정답 풀이로 이동 */
  onRequestSolution: () => void;
};

type HintData = { level: HintLevel; content: string };
const THINK_FIRST_MINUTES = 10;

/**
 * 단계별 힌트. AI 버튼을 강조하지 않고, 먼저 스스로 생각하도록 유도한다. (기획서 40)
 * 1) 미리 작성된 힌트를 1단계부터 순서대로 연다. (AI 호출 없음)
 * 2) 그래도 막히면 지금 코드에 맞춘 AI 힌트를 받는다.
 */
export function HintPanel({
  slug,
  language,
  getCode,
  isLoggedIn,
  solvingMinutes,
  initialViewedLevel,
  open,
  onToggle,
  usageText,
  onAiUsed,
  onRequestSolution,
}: Props) {
  const [hints, setHints] = useState<HintData[]>([]);
  const [aiHint, setAiHint] = useState<HintData | null>(null);
  const [pending, setPending] = useState<"static" | "ai" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const highestOpened = Math.max(initialViewedLevel, ...hints.map((h) => h.level), 0);
  const nextLevel = highestOpened < 4 ? ((highestOpened + 1) as HintLevel) : null;
  /** 이전 방문에서 봤지만 아직 화면에 다시 열지 않은 단계 */
  const hiddenViewed = initialViewedLevel - hints.filter((h) => h.level <= initialViewedLevel).length;

  async function loadStatic(levels: HintLevel[]) {
    setPending("static");
    setError(null);
    try {
      const loaded: HintData[] = [];
      for (const level of levels) {
        const res = await fetch(`/api/hints?slug=${encodeURIComponent(slug)}&level=${level}`);
        const body = (await res.json()) as ApiResult<HintData>;
        if (!body.ok) {
          setError(body.message);
          break;
        }
        loaded.push(body.data);
      }
      setHints((prev) => {
        const byLevel = new Map([...prev, ...loaded].map((h) => [h.level, h]));
        return [...byLevel.values()].sort((a, b) => a.level - b.level);
      });
    } catch {
      setError("힌트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setPending(null);
    }
  }

  async function loadAiHint() {
    setPending("ai");
    setError(null);
    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, language, code: getCode(), level: Math.max(1, highestOpened) }),
      });
      const body = (await res.json()) as ApiResult<HintData>;
      if (body.ok) setAiHint(body.data);
      else setError(body.message);
    } catch {
      setError("AI 코치가 잠시 쉬고 있어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setPending(null);
      onAiUsed();
    }
  }

  return (
    <div className={cn("border-t", open && "flex min-h-0 flex-col lg:flex-1")}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="hint-panel"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
      >
        <span className="flex items-center gap-1.5">
          <LightbulbIcon className="size-4" aria-hidden />
          막혔다면 힌트를 받아볼 수 있어요
        </span>
        <ChevronDownIcon className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <div id="hint-panel" className="flex max-h-[40vh] flex-col gap-3 overflow-y-auto px-3 pb-3 lg:max-h-none lg:min-h-0 lg:flex-1">
          {solvingMinutes < THINK_FIRST_MINUTES && hints.length === 0 && initialViewedLevel === 0 && (
            <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              먼저 {THINK_FIRST_MINUTES}분 정도 직접 고민해보세요. 스스로 떠올린 풀이가 가장 오래 기억에 남아요.
            </p>
          )}

          {hints.length > 0 && (
            <ol className="flex flex-col gap-2">
              {hints.map((h) => (
                <li key={h.level} className="rounded-md border px-3 py-2">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    힌트 {h.level}단계 · {HINT_LEVEL_LABELS[h.level]}
                  </p>
                  <Markdown>{h.content}</Markdown>
                </li>
              ))}
            </ol>
          )}

          <div className="flex flex-wrap gap-2">
            {hiddenViewed > 0 && (
              <Button
                size="sm"
                variant="ghost"
                disabled={pending !== null}
                onClick={() =>
                  loadStatic(
                    Array.from({ length: initialViewedLevel }, (_, i) => (i + 1) as HintLevel).filter(
                      (lv) => !hints.some((h) => h.level === lv),
                    ),
                  )
                }
              >
                이전에 본 힌트 다시 보기
              </Button>
            )}
            {nextLevel && (
              <Button size="sm" variant="outline" disabled={pending !== null} onClick={() => loadStatic([nextLevel])}>
                {pending === "static" ? "불러오는 중…" : `힌트 ${nextLevel}단계 보기 · ${HINT_LEVEL_LABELS[nextLevel]}`}
              </Button>
            )}
            {/* AI 힌트는 Demo도 체험할 수 있다. (하루 횟수 제한) */}
            <Button size="sm" variant="ghost" disabled={pending !== null} onClick={loadAiHint}>
              <SparklesIcon />
              {pending === "ai" ? "AI 코치가 코드를 읽는 중…" : "내 코드에 맞춘 AI 힌트"}
            </Button>
            {usageText && <span className="self-center text-[11px] text-muted-foreground">{usageText}</span>}
          </div>
          {highestOpened >= 4 && (
            <div className="flex flex-col gap-2 rounded-md border border-dashed px-3 py-2 text-xs">
              <p className="text-muted-foreground">
                힌트를 모두 봤는데도 막혔다면 정답 풀이를 확인해도 괜찮아요. 풀이를 이해한 뒤, 3일 뒤에 스스로 다시 풀어볼
                수 있게 오늘의 문제로 다시 추천해 드릴게요.
              </p>
              <Button size="sm" variant="outline" className="self-start" onClick={onRequestSolution}>
                정답 풀이 보러 가기
              </Button>
            </div>
          )}
          {!isLoggedIn && (
            <p className="text-[11px] text-muted-foreground">
              체험 중이에요.{" "}
              <Link
                href={`/login?next=${encodeURIComponent(`/problems/${slug}`)}`}
                className="underline underline-offset-4"
              >
                로그인
              </Link>
              하면 AI 코치를 하루 20번까지 쓸 수 있어요.
            </p>
          )}

          <div aria-live="polite">
            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
            {aiHint && (
              <div className="rounded-md border border-dashed px-3 py-2">
                <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <SparklesIcon className="size-3" aria-hidden />
                  AI 코치 · 지금 코드 기준 힌트
                </p>
                <Markdown>{aiHint.content}</Markdown>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  AI는 코드를 실행하지 않고 읽기만 해요. 틀린 설명이 있을 수 있으니 직접 확인해보세요.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
