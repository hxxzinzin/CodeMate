import Link from "next/link";
import { CheckCircle2Icon, CircleDashedIcon, CircleIcon, type LucideIcon } from "lucide-react";
import { ProblemMeta } from "@/components/problems/problem-meta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProblemListItem as Item, ProblemStatus } from "@/types/problem";

const STATUS: Record<ProblemStatus, { label: string; Icon: LucideIcon; className: string }> = {
  solved: { label: "해결", Icon: CheckCircle2Icon, className: "text-emerald-600 dark:text-emerald-400" },
  attempted: { label: "시도함", Icon: CircleDashedIcon, className: "text-amber-600 dark:text-amber-400" },
  unsolved: { label: "미시도", Icon: CircleIcon, className: "text-muted-foreground" },
};

export function ProblemListItem({ problem, showStatus }: { problem: Item; showStatus: boolean }) {
  const status = STATUS[problem.status];

  return (
    <Card className="relative transition-colors has-[a:hover]:bg-accent/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {showStatus && (
            <>
              <status.Icon aria-hidden className={`size-4 shrink-0 ${status.className}`} />
              <span className="sr-only">{status.label}:</span>
            </>
          )}
          {/* 카드 전체가 눌리도록 링크 영역을 카드 크기로 넓힌다. */}
          <Link
            href={`/problems/${problem.slug}`}
            className="rounded-sm after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {problem.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ProblemMeta {...problem} />
      </CardContent>
    </Card>
  );
}
