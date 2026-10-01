import { Markdown } from "@/components/markdown";
import { CopyButton } from "@/components/problems/copy-button";
import { ProblemMeta } from "@/components/problems/problem-meta";
import type { Problem } from "@/types/problem";

/** 문제 본문: 설명 → 입력 → 출력 → 제한 → 예제. 해설과 힌트는 여기서 보여주지 않는다. */
export function ProblemStatement({ problem }: { problem: Problem }) {
  return (
    <article aria-labelledby="problem-title" className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 id="problem-title" className="text-2xl font-semibold tracking-tight">
          {problem.title}
        </h1>
        <ProblemMeta {...problem} />
      </header>

      <Section title="문제">
        <Markdown>{problem.description}</Markdown>
      </Section>
      <Section title="입력">
        <Markdown>{problem.input}</Markdown>
      </Section>
      <Section title="출력">
        <Markdown>{problem.output}</Markdown>
      </Section>
      <Section title="제한">
        <Markdown>{problem.constraints}</Markdown>
      </Section>

      {problem.examples.map((example, i) => (
        <Section key={i} title={`예제 ${i + 1}`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <IoBlock label={`예제 입력 ${i + 1}`} text={example.input} copyable />
            <IoBlock label={`예제 출력 ${i + 1}`} text={example.output} />
          </div>
          {example.explanation && <Markdown className="mt-3 text-muted-foreground">{example.explanation}</Markdown>}
        </Section>
      ))}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="border-b pb-1 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function IoBlock({ label, text, copyable = false }: { label: string; text: string; copyable?: boolean }) {
  return (
    <div className="min-w-0 rounded-md border">
      <div className="flex h-8 items-center justify-between border-b px-3 text-xs text-muted-foreground">
        <span>{label}</span>
        {copyable && <CopyButton text={text} label={label} />}
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-sm">{text.replace(/\n$/, "")}</pre>
    </div>
  );
}
