import type { Metadata } from "next";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { TodayProblemCard } from "@/components/dashboard/today-problem-card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { type DashboardData, getDashboardData } from "@/lib/dashboard/service";
import { formatAccuracy, formatAvgMinutes } from "@/lib/dashboard/stats";
import { LANGUAGE_LABELS, tagLabel } from "@/lib/labels";
import { type DailyProblemView, getTodayProblem } from "@/lib/recommendation/daily";
import type { UserSkill } from "@/types/skill";
import type { SubmissionResult } from "@/types/submission";

export const metadata: Metadata = { title: "대시보드 | CodeMate" };

const RESULT_LABELS: Record<SubmissionResult, string> = {
  pending: "확인 전",
  self_correct: "해결",
  self_wrong: "미해결",
  ac: "정답",
  wa: "오답",
  tle: "시간 초과",
  re: "런타임 에러",
  ce: "컴파일 에러",
};

const dateFormat = new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric", timeZone: "Asia/Seoul" });

export default async function DashboardPage() {
  // 대시보드는 proxy가 로그인 사용자만 들여보낸다.
  const user = await getCurrentUser();

  // 오늘의 문제와 통계는 서로 독립적으로 불러와, 한쪽이 실패해도 다른 쪽은 보여준다.
  const [daily, data] = user
    ? await Promise.all([
        getTodayProblem(user.id).catch((error: unknown): DailyProblemView | null => {
          console.error("[dashboard] today problem failed", error);
          return null;
        }),
        getDashboardData(user.id).catch((error: unknown): DashboardData | null => {
          console.error("[dashboard] stats failed", error);
          return null;
        }),
      ])
    : [null, null];

  return (
    <>
      <PageHeader title="대시보드" description="오늘도 한 문제, 스스로 생각하는 시간을 가져보세요." />

      <div className="flex flex-col gap-6">
        <TodayProblemCard daily={daily} />

        {!data ? (
          <p role="alert" className="rounded-lg border px-4 py-6 text-center text-sm text-muted-foreground">
            학습 기록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </p>
        ) : (
          <>
            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">
                학습 통계
              </h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                <StatCard label="연속 학습일" value={`${data.streak}일`} hint={`최장 ${data.longestStreak}일`} />
                <StatCard label="해결한 문제" value={`${data.stats.solved_count}개`} />
                <StatCard
                  label="정답률"
                  value={formatAccuracy(data.stats.correct_submissions, data.stats.total_submissions)}
                  hint={`제출 ${data.stats.total_submissions}회 중 ${data.stats.correct_submissions}회 정답`}
                />
                <StatCard label="평균 풀이 시간" value={formatAvgMinutes(data.stats.avg_correct_time_sec)} hint="정답 제출 기준" />
                <StatCard label="Java / C" value={`${data.stats.java_solved} / ${data.stats.c_solved}`} hint="언어별로 해결한 문제 수" />
                <StatCard label="추천 난이도" value={data.currentDifficulty.toFixed(1)} hint="풀이 결과에 따라 조정돼요" />
              </div>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>강점과 취약점</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {data.skills.strengths.length + data.skills.weaknesses.length + data.skills.reviewRecommended.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      문제를 몇 개 더 풀면 강점과 취약점을 분석해드릴게요. (분야별로 2~3번 이상 풀어야 판단해요)
                    </p>
                  ) : (
                    <>
                      <SkillGroup title="강점" skills={data.skills.strengths} />
                      <SkillGroup title="연습이 필요해요" skills={data.skills.weaknesses} />
                      <SkillGroup title="복습 추천 (3주 넘게 안 풀었어요)" skills={data.skills.reviewRecommended} />
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>최근 학습 기록</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.recent.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      아직 제출 기록이 없어요. 오늘의 문제부터 시작해보세요!
                    </p>
                  ) : (
                    <ul className="flex flex-col divide-y">
                      {data.recent.map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                          <div className="min-w-0">
                            <Link href={`/problems/${s.problemSlug}`} className="block truncate font-medium hover:underline">
                              {s.problemTitle}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {dateFormat.format(new Date(s.createdAt))} · {LANGUAGE_LABELS[s.language]}
                              {s.solvingTimeSec !== null && ` · ${Math.max(1, Math.round(s.solvingTimeSec / 60))}분`} · 힌트{" "}
                              {s.hintCount}회
                            </p>
                          </div>
                          <Badge variant={s.result === "self_correct" || s.result === "ac" ? "secondary" : "destructive"}>
                            {RESULT_LABELS[s.result]}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function SkillGroup({ title, skills }: { title: string; skills: UserSkill[] }) {
  if (skills.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      <ul className="flex flex-wrap gap-1.5">
        {skills.map((s) => (
          <li key={`${s.category}:${s.skill}`}>
            <Badge variant="outline">
              {tagLabel(s.skill)} <span className="text-muted-foreground tabular-nums">{Math.round(s.score)}</span>
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
