"use client";

import { useState } from "react";
import Link from "next/link";
import { BotIcon, ChevronDownIcon } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import type { ApiResult } from "@/lib/api/response";
import { LANGUAGE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Language } from "@/types/problem";

type Props = {
  slug: string;
  language: Language;
  getCode: () => string;
  isLoggedIn: boolean;
  open: boolean;
  onToggle: () => void;
};

type Pending = "review" | "explain" | "solution" | null;
type Solution = { explanation: string; code: string | null };

const MAX_QUESTION = 300;

/**
 * AI 코치: 코드 리뷰, 개념 질문, 정답 보기.
 * 정답은 AI가 아닌 검증된 정답 코드·해설을 보여주고, 보기 전에 한 번 더 확인한다.
 */
export function CoachPanel({ slug, language, getCode, isLoggedIn, open, onToggle }: Props) {
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [confirmingSolution, setConfirmingSolution] = useState(false);
  const [solution, setSolution] = useState<Solution | null>(null);

  async function post<T>(url: string, body: unknown, kind: Exclude<Pending, null>): Promise<T | null> {
    setPending(kind);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await res.json()) as ApiResult<T>;
      if (!result.ok) {
        setError(result.message);
        return null;
      }
      return result.data;
    } catch {
      setError("AI 코치가 잠시 쉬고 있어요. 잠시 후 다시 시도해주세요.");
      return null;
    } finally {
      setPending(null);
    }
  }

  async function requestReview() {
    const data = await post<{ content: string }>("/api/ai/review", { slug, language, code: getCode() }, "review");
    if (data) setReview(data.content);
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const data = await post<{ content: string }>(
      "/api/ai/explain",
      { slug, question, language, code: getCode() },
      "explain",
    );
    if (data) setAnswer(data.content);
  }

  async function showSolution() {
    setConfirmingSolution(false);
    const data = await post<Solution>("/api/ai/solution", { slug, language, confirm: true }, "solution");
    if (data) setSolution(data);
  }

  return (
    <div className="border-t">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="coach-panel"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
      >
        <span className="flex items-center gap-1.5">
          <BotIcon className="size-4" aria-hidden />
          AI 코치 · 코드 리뷰, 개념 질문
        </span>
        <ChevronDownIcon className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <div id="coach-panel" className="flex max-h-[40vh] flex-col gap-4 overflow-y-auto px-3 pb-3 text-sm">
          {!isLoggedIn ? (
            <p className="text-xs text-muted-foreground">
              <Link
                href={`/login?next=${encodeURIComponent(`/problems/${slug}`)}`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                로그인
              </Link>
              하면 AI 코드 리뷰와 개념 질문을 사용할 수 있어요.
            </p>
          ) : (
            <>
              <section aria-labelledby="coach-review" className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 id="coach-review" className="text-xs font-medium text-muted-foreground">
                    코드 리뷰
                  </h3>
                  <Button size="sm" variant="outline" disabled={pending !== null} onClick={requestReview}>
                    {pending === "review" ? "AI 코치가 코드를 읽는 중…" : `지금 ${LANGUAGE_LABELS[language]} 코드 리뷰받기`}
                  </Button>
                </div>
                {review && (
                  <div className="rounded-md border px-3 py-2 [&_h3]:mt-3 [&_h3]:text-xs [&_h3]:font-semibold [&_h3:first-child]:mt-0">
                    <Markdown>{review}</Markdown>
                  </div>
                )}
              </section>

              <section aria-labelledby="coach-explain" className="flex flex-col gap-2">
                <h3 id="coach-explain" className="text-xs font-medium text-muted-foreground">
                  개념 질문
                </h3>
                <form onSubmit={ask} className="flex gap-2">
                  <label htmlFor="coach-question" className="sr-only">
                    AI 코치에게 개념 질문하기
                  </label>
                  <input
                    id="coach-question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    maxLength={MAX_QUESTION}
                    placeholder="예: 스택은 왜 괄호 검사에 쓰여요?"
                    className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  />
                  <Button type="submit" size="sm" variant="outline" disabled={pending !== null || question.trim().length < 2}>
                    {pending === "explain" ? "답변 중…" : "질문"}
                  </Button>
                </form>
                {answer && (
                  <div className="rounded-md border px-3 py-2">
                    <Markdown>{answer}</Markdown>
                  </div>
                )}
              </section>

              <section aria-labelledby="coach-solution" className="flex flex-col gap-2">
                <h3 id="coach-solution" className="text-xs font-medium text-muted-foreground">
                  정답 풀이
                </h3>
                {solution ? (
                  <div className="flex flex-col gap-2 rounded-md border px-3 py-2">
                    <Markdown>{solution.explanation}</Markdown>
                    {solution.code ? (
                      <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">{solution.code}</pre>
                    ) : (
                      <p className="text-xs text-muted-foreground">{LANGUAGE_LABELS[language]} 정답 코드는 아직 없어요.</p>
                    )}
                  </div>
                ) : confirmingSolution ? (
                  <div role="group" aria-label="정답 보기 확인" className="flex flex-col gap-2 rounded-md bg-muted/60 px-3 py-2">
                    <p className="text-xs">
                      정답을 보면 이번 풀이는 &lsquo;정답 확인 후 해결&rsquo;로 기록되고, 다음 문제 난이도에 반영돼요. 정말 볼까요?
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="destructive" disabled={pending !== null} onClick={showSolution}>
                        정답 보기
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmingSolution(false)}>
                        조금 더 고민할게요
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" className="self-start" onClick={() => setConfirmingSolution(true)}>
                    {pending === "solution" ? "불러오는 중…" : "정답 풀이 보기"}
                  </Button>
                )}
              </section>

              <p className="text-[11px] text-muted-foreground">
                AI는 코드를 실행하지 않고 읽기만 해요. 틀린 설명이 있을 수 있으니 직접 확인해보세요.
              </p>
            </>
          )}

          <div aria-live="polite">
            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
