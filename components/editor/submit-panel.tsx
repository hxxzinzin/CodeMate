"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ApiResult } from "@/lib/api/response";
import type { Language } from "@/types/problem";
import type { SubmissionResult } from "@/types/submission";

type Props = {
  slug: string;
  language: Language;
  /** 제출 시점의 최신 코드 */
  getCode: () => string;
  isLoggedIn: boolean;
};

type SubmitData = { submissionId: string; result: SubmissionResult; attemptCount: number };

type State =
  | { step: "idle" }
  | { step: "choosing" }
  | { step: "submitting" }
  | { step: "done"; data: SubmitData }
  | { step: "error"; message: string };

/**
 * 제출 패널. 아직 자동 채점(Judge)이 없어서, 사용자가 예제로 직접 확인한 결과를 함께 기록한다. (ADR-003)
 */
export function SubmitPanel({ slug, language, getCode, isLoggedIn }: Props) {
  const [state, setState] = useState<State>({ step: "idle" });

  async function submit(selfReport: "correct" | "wrong") {
    setState({ step: "submitting" });
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, language, code: getCode(), selfReport }),
      });
      const body = (await res.json()) as ApiResult<SubmitData>;
      setState(body.ok ? { step: "done", data: body.data } : { step: "error", message: body.message });
    } catch {
      setState({ step: "error", message: "네트워크 문제로 제출하지 못했어요. 잠시 후 다시 시도해주세요." });
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 text-xs">
        <p className="text-muted-foreground">로그인하면 제출 기록과 실력이 저장돼요.</p>
        <Button asChild size="sm" variant="outline">
          <Link href={`/login?next=${encodeURIComponent(`/problems/${slug}`)}`}>로그인하고 제출하기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border-t px-3 py-2 text-sm">
      {state.step === "choosing" || state.step === "submitting" ? (
        <div className="flex flex-col gap-2" role="group" aria-label="제출 결과 선택">
          <p className="text-xs text-muted-foreground">
            아직 자동 채점은 지원하지 않아요. 예제로 직접 확인해본 결과를 선택해주세요.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={state.step === "submitting"} onClick={() => submit("correct")}>
              맞았어요
            </Button>
            <Button size="sm" variant="outline" disabled={state.step === "submitting"} onClick={() => submit("wrong")}>
              틀렸어요
            </Button>
            <Button size="sm" variant="ghost" disabled={state.step === "submitting"} onClick={() => setState({ step: "idle" })}>
              취소
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div aria-live="polite" className="text-xs">
            {state.step === "done" && (
              <p className="text-muted-foreground">
                {state.data.attemptCount}번째 제출을 저장했어요 ·{" "}
                {state.data.result === "self_correct" ? "맞았어요(직접 확인)" : "틀렸어요(직접 확인)"}
              </p>
            )}
            {state.step === "error" && (
              <p role="alert" className="text-destructive">
                {state.message}
              </p>
            )}
          </div>
          <Button size="sm" onClick={() => setState({ step: "choosing" })}>
            제출
          </Button>
        </div>
      )}
    </div>
  );
}
