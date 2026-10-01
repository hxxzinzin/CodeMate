"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TAGS } from "@/content/tags";
import { DIFFICULTY_LABELS, LANGUAGE_LABELS } from "@/lib/labels";
import type { ProblemFilters as Filters } from "@/lib/problems/filters";

type Props = {
  filters: Filters;
  /** 해결 여부 필터는 로그인 사용자에게만 보여준다. */
  showStatus: boolean;
};

const selectClass =
  "h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/**
 * GET 폼이라 JavaScript 없이도 동작한다.
 * JavaScript가 있으면 비어 있지 않은 값만 URL에 담아 이동한다. (공유하기 좋은 짧은 주소: ?algorithm=dp)
 * 선택값을 바꾸면 바로 적용된다.
 */
export function ProblemFilters({ filters, showStatus }: Props) {
  const router = useRouter();
  const submitOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => e.currentTarget.form?.requestSubmit();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(e.currentTarget)) {
      if (typeof value === "string" && value.trim()) params.set(key, value.trim());
    }
    const query = params.toString();
    router.push(query ? `/problems?${query}` : "/problems");
  }

  return (
    <form action="/problems" onSubmit={onSubmit} className="mb-6 flex flex-col gap-3" aria-label="문제 필터">
      <div className="flex gap-2">
        <label htmlFor="problem-search" className="sr-only">
          제목 검색
        </label>
        <input
          id="problem-search"
          name="q"
          type="search"
          defaultValue={filters.q}
          maxLength={50}
          placeholder="문제 제목 검색"
          className={`${selectClass} min-w-0 flex-1 px-3`}
        />
        <Button type="submit" variant="outline" size="lg" aria-label="검색">
          <SearchIcon />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect name="difficulty" label="난이도" value={filters.difficulty?.toString()} onChange={submitOnChange}>
          {Object.entries(DIFFICULTY_LABELS).map(([level, label]) => (
            <option key={level} value={level}>
              Lv.{level} {label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect name="language" label="언어" value={filters.language} onChange={submitOnChange}>
          {Object.entries(LANGUAGE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect name="algorithm" label="알고리즘" value={filters.algorithm} onChange={submitOnChange}>
          {Object.entries(TAGS.algorithm).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect name="ds" label="자료구조" value={filters.dataStructure} onChange={submitOnChange}>
          {Object.entries(TAGS.data_structure).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </FilterSelect>
        {showStatus && (
          <FilterSelect name="status" label="해결 여부" value={filters.status} onChange={submitOnChange}>
            <option value="unsolved">미시도</option>
            <option value="attempted">시도함</option>
            <option value="solved">해결</option>
          </FilterSelect>
        )}
        <Link
          href="/problems"
          className="rounded-md px-2 py-1 text-sm text-muted-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          초기화
        </Link>
      </div>
    </form>
  );
}

type FilterSelectProps = {
  name: string;
  label: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
};

function FilterSelect({ name, label, value, onChange, children }: FilterSelectProps) {
  return (
    <select name={name} aria-label={label} defaultValue={value ?? ""} onChange={onChange} className={selectClass}>
      <option value="">{label}: 전체</option>
      {children}
    </select>
  );
}
