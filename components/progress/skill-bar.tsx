import { Progress } from "@/components/ui/progress";
import { tagLabel } from "@/lib/labels";
import type { UserSkill } from "@/types/skill";

export function SkillBar({ skill }: { skill: UserSkill }) {
  const label = tagLabel(skill.skill);
  const measured = skill.attempts > 0;

  return (
    <div className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3 text-sm">
      <span className="truncate">{label}</span>
      <Progress
        value={measured ? skill.score : 0}
        aria-label={`${label} 실력`}
        className={measured ? undefined : "opacity-40"}
      />
      <span className="text-right text-muted-foreground tabular-nums">
        {measured ? Math.round(skill.score) : "측정 전"}
      </span>
    </div>
  );
}
