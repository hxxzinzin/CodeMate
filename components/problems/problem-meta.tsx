import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_LABELS, LANGUAGE_LABELS, tagLabel } from "@/lib/labels";
import type { ProblemSummary } from "@/types/problem";

type Props = Pick<ProblemSummary, "difficulty" | "estimatedMinutes" | "languages" | "tags">;

/** 난이도 · 언어 · 예상 시간 · 태그를 한 줄로 보여준다. */
export function ProblemMeta({ difficulty, estimatedMinutes, languages, tags }: Props) {
  // 자료구조 String과 C 개념 String처럼 종류는 달라도 표시 이름이 같으면 한 번만 보여준다.
  const labels = [...new Set(tags.map((tag) => tagLabel(tag.key)))];

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <Badge>
        Lv.{difficulty} {DIFFICULTY_LABELS[difficulty]}
      </Badge>
      {languages.map((lang) => (
        <Badge key={lang} variant="outline">
          {LANGUAGE_LABELS[lang]}
        </Badge>
      ))}
      <span className="text-muted-foreground">약 {estimatedMinutes}분</span>
      <span aria-hidden className="text-muted-foreground">
        ·
      </span>
      <ul className="flex flex-wrap gap-1" aria-label="태그">
        {labels.map((label) => (
          <li key={label}>
            <Badge variant="secondary">{label}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
