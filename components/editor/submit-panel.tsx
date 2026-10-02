"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ApiResult } from "@/lib/api/response";
import { tagLabel } from "@/lib/labels";
import type { Language } from "@/types/problem";
import type { JudgeSummary, SkillChange, SubmissionResult, SubmitResponse as SubmitData } from "@/types/submission";

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

const RESULT_TEXT: Record<SubmissionResult, string> = {
  pending: "확인 전",
  self_correct: "맞았어요(직접 확인)",
  self_wrong: "틀렸어요(직접 확인)",
  ac: "정답이에요!",
  wa: "틀렸어요",
  tle: "시간 초과",
  re: "런타임 에러",
  ce: "컴파일 에러",
};

function Pre({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <pre className="max-h-32 overflow-auto rounded bg-muted px-2 py-1 font-mono text-[11px] whitespace-pre-wrap">
        {text || "(출력 없음)"}
      </pre>
    </div>
  );
}

/** 자동 채점 결과: 몇 개 통과했는지, 어디서 틀렸는지 */
function JudgeDetail({ result, judge }: { result: SubmissionResult; judge: JudgeSummary }) {
  const { failed } = judge;
  return (
    <div className="mt-1 flex flex-col gap-1.5 text-muted-foreground">
      <p>
        테스트 {judge.passed} / {judge.total} 통과
        {failed && ` · ${failed.number}번째 테스트${failed.sample ? "(예제)" : ""}에서 멈춤`}
        {result === "ac" && judge.maxTimeSec !== null && ` · 가장 오래 걸린 테스트 ${judge.maxTimeSec.toFixed(2)}초`}
      </p>
      {failed?.input !== undefined && (
        <div className="grid gap-1.5 sm:grid-cols-3">
          <Pre label="입력" text={failed.input} />
          <Pre label="기대한 출력" text={failed.expected ?? ""} />
          <Pre label="내 출력" text={failed.actual ?? ""} />
        </div>
      )}
      {failed && !failed.sample && result === "wa" && (
        <p>숨겨진 테스트라 입력은 보여드리지 않아요. 경계값(가장 작은·큰 입력)이나 특수한 경우를 생각해보세요.</p>
      )}
      {result === "tle" && <p>더 빠른 방법(시간 복잡도)이 필요하거나, 끝나지 않는 반복이 있을 수 있어요.</p>}
      {judge.message && <Pre label={result === "ce" ? "컴파일러 메시지" : "에러 메시지"} text={judge.message} />}
      {result === "ce" && <p>컴파일 에러는 실력 점수와 추천 난이도에 반영하지 않아요.</p>}
    </div>
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
  /** 자동 채점 사용 여부. 꺼져 있으면 사용자가 직접 확인한 결과로 제출한다. (ADR-003) */
  autoJudge: boolean;
};

type State =
  | { step: "idle" }
  | { step: "choosing" }
  | { step: "submitting"; judging: boolean }
  | { step: "done"; data: SubmitData }
  | { step: "error"; message: string; judgeUnavailable: boolean };

export function SubmitPanel({ slug, language, getCode, getSolvingSeconds, onSubmitted, isLoggedIn, autoJudge }: Props) {
  const [state, setState] = useState<State>({ step: "idle" });

  /** selfReport가 없으면 자동 채점 */
  async function submit(selfReport?: "correct" | "wrong") {
    setState({ step: "submitting", judging: !selfReport });
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
        setState({ step: "error", message: body.message, judgeUnavailable: body.code === "SERVICE_UNAVAILABLE" });
      }
    } catch {
      setState({
        step: "error",
        message: "네트워크 문제로 제출하지 못했어요. 잠시 후 다시 시도해주세요.",
        judgeUnavailable: false,
      });
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

  const submitting = state.step === "submitting";

  if (state.step === "choosing" || (submitting && !state.judging)) {
    return (
      <div className="border-t px-3 py-2 text-sm">
        <div className="flex flex-col gap-2" role="group" aria-label="제출 결과 선택">
          <p className="text-xs text-muted-foreground">
            {autoJudge
              ? "자동 채점 대신, 예제로 직접 확인해본 결과를 선택해주세요."
              : "아직 자동 채점은 지원하지 않아요. 예제로 직접 확인해본 결과를 선택해주세요."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={submitting} onClick={() => submit("correct")}>
              맞았어요
            </Button>
            <Button size="sm" variant="outline" disabled={submitting} onClick={() => submit("wrong")}>
              틀렸어요
            </Button>
            <Button size="sm" variant="ghost" disabled={submitting} onClick={() => setState({ step: "idle" })}>
              취소
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 border-t px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div aria-live="polite" className="min-w-0 flex-1 text-xs">
          {submitting && <p className="text-muted-foreground">채점 중이에요… 테스트를 하나씩 실행하고 있어요. (몇 초~수십 초)</p>}
          {state.step === "done" && (
            <p>
              <span
                className={
                  state.data.result === "ac"
                    ? "font-medium text-emerald-600 dark:text-emerald-400"
                    : state.data.judge
                      ? "font-medium text-destructive"
                      : "text-muted-foreground"
                }
              >
                {RESULT_TEXT[state.data.result]}
              </span>
              <span className="text-muted-foreground">
                {state.data.newlySolved ? " · 처음으로 해결했어요!" : ` · ${state.data.attemptCount}번째 제출`}
                {state.data.streak !== null && ` · ${state.data.streak}일 연속 학습 중`}
              </span>
            </p>
          )}
          {state.step === "error" && (
            <p role="alert" className="text-destructive">
              {state.message}
            </p>
          )}
        </div>
        {autoJudge ? (
          <Button size="sm" disabled={submitting} onClick={() => submit()}>
            {submitting ? "채점 중…" : state.step === "error" && state.judgeUnavailable ? "다시 채점" : "제출하고 채점하기"}
          </Button>
        ) : (
          <Button size="sm" onClick={() => setState({ step: "choosing" })}>
            제출
          </Button>
        )}
      </div>

      {state.step === "error" && state.judgeUnavailable && (
        <Button size="sm" variant="ghost" className="self-start" onClick={() => setState({ step: "choosing" })}>
          직접 확인한 결과로 제출하기
        </Button>
      )}

      {state.step === "done" && (
        <div className="text-xs">
          {state.data.judge && <JudgeDetail result={state.data.result} judge={state.data.judge} />}
          {state.data.difficultyChange && (
            <p className="mt-1 text-muted-foreground">
              추천 난이도 {state.data.difficultyChange.before.toFixed(2)} → {state.data.difficultyChange.after.toFixed(2)}
            </p>
          )}
          {state.data.skillChanges.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground" aria-label="실력 점수 변화">
              {state.data.skillChanges.map((c) => (
                <li key={`${c.category}:${c.skill}`}>
                  <SkillChangeText change={c} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
