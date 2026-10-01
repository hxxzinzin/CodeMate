import ReactMarkdown, { type Components } from "react-markdown";
import { cn } from "@/lib/utils";

/**
 * 문제 설명·해설용 마크다운 렌더러.
 * react-markdown은 HTML 태그를 실행하지 않고 글자로 다루므로(skipHtml), 콘텐츠에 HTML이 섞여도 안전하다.
 */
const components: Components = {
  p: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-3">{children}</p>,
  ul: ({ children }) => <ul className="mt-3 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mt-3 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-7">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  code: ({ children }) => <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>,
  pre: ({ children }) => (
    <pre className="mt-3 overflow-x-auto rounded-md bg-muted p-3 font-mono text-sm [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
      {children}
    </a>
  ),
};

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("text-sm text-foreground/90", className)}>
      <ReactMarkdown components={components} skipHtml>
        {children}
      </ReactMarkdown>
    </div>
  );
}
