"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ApiResult } from "@/lib/api/response";
import { tagLabel } from "@/lib/labels";
import type { Language } from "@/types/problem";
import type { SkillChange, SubmitResponse as SubmitData } from "@/types/submission";

/** "Stack 첫 측정 52" / "Queue 40 → 45 ▲5" */
function SkillChangeText({ change }: { change: SkillChange }) {
  const name = tagLabel(change.skill);
  const after = Math.round(change.after);
  if (change.before === null) return <>{name} 첫 측정 {after}</>;
  const before = Math.round(change.before);
  const diff = after - before;
  const sign = diff > 0 ? `▲${diff}` : diff < 0 ? `▼${-diff}` : "유지";
  return (
    <>
      {name} {before} → {after}{" "}
      <span className={diff > 0 ? "text-emerald-600 dark:text-emerald-400" : diff < 0 ? "text-destructive" : undefined}>
        {sign}
      </span>
    </>
  );
}

type Props = {
  slug: string;
  language: Language;
  /** 제출 시점의 최신 코드 */
  getCode: () => string;
  /** 제출 시점까지의 풀이 시간(초) */
  getSolvingSeconds: () => number;
  /** 제출이 저장된 뒤 호출 (정답이면 타이머를 초기화하는 데 사용) */
  onSubmitted: (data: SubmitData) => void;
  isLoggedIn: boolean;
};

type State =
  | { step: "idle" }
  | { step: "choosing" }
  | { step: "submitting" }
  | { step: "done"; data: SubmitData }
  | { step: "error"; message: string };

/**
 * 제출 패널. 아직 자동 채점(Judge)이 없어서, 사용자가 예제로 직접 확인한 결과를 함께 기록한다. (ADR-003)
 */
export function SubmitPanel({ slug, language, getCode, getSolvingSeconds, onSubmitted, isLoggedIn }: Props) {
  const [state, setState] = useState<State>({ step: "idle" });

  async function submit(selfReport: "correct" | "wrong") {
    setState({ step: "submitting" });
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, language, code: getCode(), selfReport, solvingTimeSec: getSolvingSeconds() }),
      });
      const body = (await res.json()) as ApiResult<SubmitData>;
      if (body.ok) {
        setState({ step: "done", data: body.data });
        onSubmitted(body.data);
      } else {
        setState({ step: "error", message: body.message });
      }
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
                {state.data.newlySolved
                  ? "처음으로 해결했어요! "
                  : `${state.data.attemptCount}번째 제출을 저장했어요 · `}
                {state.data.result === "self_correct" ? "맞았어요(직접 확인)" : "틀렸어요(직접 확인)"}
                {state.data.streak !== null && ` · ${state.data.streak}일 연속 학습 중`}
              </p>
            )}
            {state.step === "done" && state.data.difficultyChange && (
              <p className="mt-1 text-muted-foreground">
                추천 난이도 {state.data.difficultyChange.before.toFixed(2)} → {state.data.difficultyChange.after.toFixed(2)}
              </p>
            )}
            {state.step === "done" && state.data.skillChanges.length > 0 && (
              <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground" aria-label="실력 점수 변화">
                {state.data.skillChanges.map((c) => (
                  <li key={`${c.category}:${c.skill}`}>
                    <SkillChangeText change={c} />
                  </li>
                ))}
              </ul>
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
