import type { Metadata } from "next";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { ProblemMeta } from "@/components/problems/problem-meta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LANGUAGE_LABELS, tagLabel } from "@/lib/labels";
import {
  mockProblems,
  mockRecentSubmissions,
  mockStats,
  mockStrengths,
  mockTodayProblemId,
  mockWeaknesses,
} from "@/lib/mock-data";
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

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

export default function DashboardPage() {
  const today = mockProblems.find((p) => p.id === mockTodayProblemId);
  const stats = mockStats;

  return (
    <>
      <PageHeader title="대시보드" description="오늘도 한 문제, 스스로 생각하는 시간을 가져보세요." />

      <div className="flex flex-col gap-6">
        {today && (
          <Card>
            <CardHeader>
              <CardDescription>오늘의 문제</CardDescription>
              <CardTitle className="text-xl">{today.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ProblemMeta {...today} />
            </CardContent>
            <CardFooter className="justify-between gap-4">
              <p className="text-xs text-muted-foreground">먼저 10분 정도 직접 고민해보세요.</p>
              {/* 문제 상세 화면은 #11에서 구현한다. */}
              <Button disabled>문제 풀기</Button>
            </CardFooter>
          </Card>
        )}

        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">
            학습 통계
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatCard label="연속 학습일" value={`${stats.streak}일`} hint={`최장 ${stats.longestStreak}일`} />
            <StatCard label="해결한 문제" value={`${stats.solvedCount}개`} />
            <StatCard label="정답률" value={`${Math.round(stats.accuracy * 100)}%`} />
            <StatCard label="평균 풀이 시간" value={`${stats.avgSolvingMinutes}분`} />
            <StatCard label="Java / C" value={`${stats.javaSolved} / ${stats.cSolved}`} hint="언어별 해결 문제 수" />
            <StatCard label="추천 난이도" value={stats.currentDifficulty.toFixed(1)} hint="풀이 결과에 따라 조정돼요" />
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>강점과 취약점</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <TagGroup title="강점" tags={mockStrengths} />
              <TagGroup title="복습이 필요해요" tags={mockWeaknesses} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>최근 학습 기록</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col divide-y">
                {mockRecentSubmissions.map((s) => {
                  const problem = mockProblems.find((p) => p.id === s.problemId);
                  return (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{problem?.title ?? "알 수 없는 문제"}</p>
                        <p className="text-xs text-muted-foreground">
                          {dateFormat.format(new Date(s.createdAt))} · {LANGUAGE_LABELS[s.language]} ·{" "}
                          {Math.round(s.solvingTimeSec / 60)}분 · 힌트 {s.hintCount}회
                        </p>
                      </div>
                      <Badge variant={s.result === "self_correct" || s.result === "ac" ? "secondary" : "destructive"}>
                        {RESULT_LABELS[s.result]}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function TagGroup({ title, tags }: { title: string; tags: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      <ul className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <li key={tag}>
            <Badge variant="outline">{tagLabel(tag)}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
