import type { Metadata } from "next";
import Link from "next/link";
import { DemoNotice } from "@/components/auth/demo-notice";
import { PageHeader } from "@/components/layout/page-header";
import { ProblemFilters } from "@/components/problems/problem-filters";
import { ProblemListItem } from "@/components/problems/problem-list-item";
import { getCurrentUser } from "@/lib/auth";
import { listProblems } from "@/lib/db/problems";
import { hasActiveFilters, parseProblemFilters } from "@/lib/problems/filters";
import type { ProblemListItem as Item } from "@/types/problem";

export const metadata: Metadata = { title: "문제 | CodeMate" };

export default async function ProblemsPage({ searchParams }: PageProps<"/problems">) {
  const user = await getCurrentUser();
  const parsed = parseProblemFilters(await searchParams);
  // 비로그인 사용자는 풀이 기록이 없으므로 해결 여부 필터를 적용하지 않는다.
  const filters = user ? parsed : { ...parsed, status: undefined };

  let problems: Item[] | null = null;
  try {
    problems = await listProblems(filters, user?.id ?? null);
  } catch (error) {
    console.error("[problems] list failed", error);
  }

  return (
    <>
      <PageHeader title="문제" description="난이도와 태그를 보고 직접 문제를 골라 풀 수 있어요." />
      {!user && <DemoNotice next="/problems" />}
      <ProblemFilters filters={filters} showStatus={Boolean(user)} />

      {problems === null ? (
        <p role="alert" className="rounded-lg border px-4 py-6 text-center text-sm text-muted-foreground">
          문제 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      ) : problems.length === 0 ? (
        <div className="rounded-lg border px-4 py-10 text-center text-sm text-muted-foreground">
          <p>조건에 맞는 문제가 없어요.</p>
          {hasActiveFilters(filters) && (
            <Link href="/problems" className="mt-2 inline-block font-medium text-foreground underline underline-offset-4">
              필터 초기화
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
            {problems.length}개 문제
          </p>
          <ul className="flex flex-col gap-3">
            {problems.map((problem) => (
              <li key={problem.id}>
                <ProblemListItem problem={problem} showStatus={Boolean(user)} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
