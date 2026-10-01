import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";
import { DemoNotice } from "@/components/auth/demo-notice";
import { CodeWorkspace } from "@/components/editor/code-workspace";
import { ProblemStatement } from "@/components/problems/problem-statement";
import { getCurrentUser } from "@/lib/auth";
import { getProblemBySlug } from "@/lib/db/problems";

export async function generateMetadata({ params }: PageProps<"/problems/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const problem = await getProblemBySlug(slug);
  return { title: problem ? `${problem.title} | CodeMate` : "문제를 찾을 수 없어요 | CodeMate" };
}

export default async function ProblemPage({ params }: PageProps<"/problems/[slug]">) {
  const { slug } = await params;
  const [problem, user] = await Promise.all([getProblemBySlug(slug), getCurrentUser()]);
  if (!problem) notFound();

  return (
    <>
      <Link
        href="/problems"
        className="mb-4 inline-flex w-fit items-center gap-1 rounded-md text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ChevronLeftIcon className="size-4" aria-hidden />
        문제 목록
      </Link>
      {!user && <DemoNotice next={`/problems/${problem.slug}`} />}

      {/* 데스크톱: 문제 | 코드, 모바일: 문제 → 코드 */}
      <div className="grid gap-8 lg:grid-cols-2">
        <ProblemStatement problem={problem} />

        <section aria-label="코드 작성" className="lg:sticky lg:top-20 lg:self-start">
          <CodeWorkspace languages={problem.languages} />
        </section>
      </div>
    </>
  );
}
