import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { DifficultyChart } from "@/components/progress/difficulty-chart";
import { SkillBar } from "@/components/progress/skill-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { SKILL_CATEGORY_LABELS, tagLabel } from "@/lib/labels";
import { GROWTH_DAYS } from "@/lib/progress/growth";
import { getProgressData, type ProgressData } from "@/lib/progress/service";

export const metadata: Metadata = { title: "학습 현황 | CodeMate" };

const dateFormat = new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric", timeZone: "Asia/Seoul" });

export default async function ProgressPage() {
  // 학습 현황은 proxy가 로그인 사용자만 들여보낸다.
  const user = await getCurrentUser();
  let data: ProgressData | null = null;
  if (user) {
    try {
      data = await getProgressData(user.id);
    } catch (error) {
      console.error("[progress] load failed", error);
    }
  }

  return (
    <>
      <PageHeader
        title="학습 현황"
        description="분야별 실력은 풀이 결과(정답, 시간, 힌트 사용)를 바탕으로 계산돼요."
      />

      {!data ? (
        <p role="alert" className="rounded-lg border px-4 py-6 text-center text-sm text-muted-foreground">
          학습 현황을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardDescription>현재 추천 난이도</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {data.currentDifficulty.toFixed(1)} <span className="text-sm text-muted-foreground">/ 5</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DifficultyChart points={data.difficulty} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>최근 {GROWTH_DAYS}일 변화</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {data.growth.length === 0 ? (
                  <p className="text-sm text-muted-foreground">문제를 풀면 분야별 점수 변화가 여기에 보여요.</p>
                ) : (
                  <ul className="flex flex-col gap-2 text-sm">
                    {data.growth.map((g) => (
                      <li key={`${g.category}:${g.skill}`} className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate">
                          {tagLabel(g.skill)}{" "}
                          <span className="text-xs text-muted-foreground">{SKILL_CATEGORY_LABELS[g.category]}</span>
                        </span>
                        {g.from === null ? (
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            처음 측정 · {Math.round(g.to)}점
                          </span>
                        ) : (
                          <span
                            className={`shrink-0 tabular-nums ${g.delta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
                          >
                            {Math.round(g.from)} → {Math.round(g.to)} ({g.delta > 0 ? "+" : ""}
                            {Math.round(g.delta)})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {data.reviewRecommended.length > 0 && (
                  <div className="flex flex-col gap-2 border-t pt-3">
                    <h3 className="text-xs font-medium text-muted-foreground">복습 추천 (3주 넘게 안 푼 강점 분야)</h3>
                    <ul className="flex flex-wrap gap-1.5">
                      {data.reviewRecommended.map((s) => (
                        <li key={`${s.category}:${s.skill}`}>
                          <Badge variant="outline">
                            {tagLabel(s.skill)}
                            {s.lastPracticedAt && (
                              <span className="text-muted-foreground">
                                {" "}
                                · {dateFormat.format(new Date(s.lastPracticedAt))}
                              </span>
                            )}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {data.categories.map((c) => (
              <Card key={c.category}>
                <CardHeader>
                  <CardTitle className="flex items-baseline justify-between gap-2">
                    {SKILL_CATEGORY_LABELS[c.category]}
                    {c.average !== null && (
                      <span className="text-sm font-normal text-muted-foreground tabular-nums">
                        평균 {Math.round(c.average)}점
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {c.measured.length} / {c.measured.length + c.unmeasured.length}개 분야 측정됨
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {c.measured.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {c.measured.map((s) => (
                        <SkillBar key={s.skill} skill={s} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">아직 이 분야의 문제를 풀지 않았어요.</p>
                  )}
                  {c.unmeasured.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xs text-muted-foreground">측정 전</h3>
                      <ul className="flex flex-wrap gap-1">
                        {c.unmeasured.map((label) => (
                          <li
                            key={label}
                            className="rounded-md border border-dashed px-1.5 py-0.5 text-xs text-muted-foreground"
                          >
                            {label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
