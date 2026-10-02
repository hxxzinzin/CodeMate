import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SkillRow } from "@/lib/progress/growth";
import type { SkillStatus } from "@/lib/skills/skillCalculator";

const STATUS_LABELS: Partial<Record<SkillStatus, string>> = {
  strong: "강점",
  weak: "연습 필요",
  review: "복습",
};

export function SkillBar({ skill }: { skill: SkillRow }) {
  const status = STATUS_LABELS[skill.status];

  return (
    <div className="grid grid-cols-[minmax(0,8rem)_1fr_2.5rem] items-center gap-3 text-sm">
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="truncate">{skill.label}</span>
        {status && (
          <Badge variant={skill.status === "weak" ? "destructive" : "secondary"} className="shrink-0 px-1.5 text-[10px]">
            {status}
          </Badge>
        )}
      </span>
      <Progress value={skill.score} aria-label={`${skill.label} 실력 ${Math.round(skill.score)}점`} />
      <span
        className="text-right text-muted-foreground tabular-nums"
        title={`${skill.attempts}번 풀어서 ${skill.correct}번 정답`}
      >
        {Math.round(skill.score)}
      </span>
    </div>
  );
}
