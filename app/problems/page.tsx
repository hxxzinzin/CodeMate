import type { Metadata } from "next";
import { CheckCircle2Icon, CircleDashedIcon, CircleIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProblemMeta } from "@/components/problems/problem-meta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProblems } from "@/lib/mock-data";
import type { ProblemStatus } from "@/types/problem";

export const metadata: Metadata = { title: "문제 | CodeMate" };

const STATUS: Record<ProblemStatus, { label: string; Icon: typeof CircleIcon; className: string }> = {
  solved: { label: "해결", Icon: CheckCircle2Icon, className: "text-emerald-600 dark:text-emerald-400" },
  attempted: { label: "시도함", Icon: CircleDashedIcon, className: "text-amber-600 dark:text-amber-400" },
  unsolved: { label: "미시도", Icon: CircleIcon, className: "text-muted-foreground" },
};

export default function ProblemsPage() {
  return (
    <>
      {/* 필터·검색은 #10, 상세 화면 링크는 #11에서 추가한다. */}
      <PageHeader title="문제" description="난이도와 태그를 보고 직접 문제를 골라 풀 수 있어요." />

      <ul className="flex flex-col gap-3">
        {mockProblems.map((problem) => {
          const status = STATUS[problem.status];
          return (
            <li key={problem.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <status.Icon aria-hidden className={`size-4 shrink-0 ${status.className}`} />
                    <span className="sr-only">{status.label}:</span>
                    {problem.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProblemMeta {...problem} />
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </>
  );
}
