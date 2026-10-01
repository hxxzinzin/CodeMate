import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SkillBar } from "@/components/progress/skill-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SKILL_CATEGORY_LABELS, tagLabel } from "@/lib/labels";
import { mockSkills, mockStats, mockWeaknesses } from "@/lib/mock-data";
import type { SkillCategory } from "@/types/skill";

export const metadata: Metadata = { title: "학습 현황 | CodeMate" };

const CATEGORIES: SkillCategory[] = ["algorithm", "data_structure", "java", "c"];

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        title="학습 현황"
        description="분야별 실력은 풀이 결과(정답, 시간, 힌트 사용)를 바탕으로 계산돼요."
      />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardDescription>현재 추천 난이도</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {mockStats.currentDifficulty.toFixed(1)} <span className="text-sm text-muted-foreground">/ 5</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">복습 추천</p>
            <ul className="flex flex-wrap gap-1.5">
              {mockWeaknesses.map((tag) => (
                <li key={tag}>
                  <Badge variant="outline">{tagLabel(tag)}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {CATEGORIES.map((category) => {
            const skills = mockSkills
              .filter((s) => s.category === category)
              .sort((a, b) => b.score - a.score);
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{SKILL_CATEGORY_LABELS[category]}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {skills.length > 0 ? (
                    skills.map((skill) => <SkillBar key={skill.skill} skill={skill} />)
                  ) : (
                    <p className="text-sm text-muted-foreground">아직 푼 문제가 없어요.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
