"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { EditorLoading } from "@/components/editor/editor-loading";
import { CODE_TEMPLATES, defaultLanguage } from "@/lib/editor/templates";
import { LANGUAGE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Language } from "@/types/problem";

// Monaco는 브라우저 전용이고 크기가 커서, 서버 렌더링에서 빼고 이 화면에서만 불러온다.
const CodeEditor = dynamic(() => import("@/components/editor/code-editor"), {
  ssr: false,
  loading: () => <EditorLoading />,
});

type Props = {
  languages: Language[];
};

/** 언어 선택 + 코드 에디터. 언어를 바꿔도 각 언어에서 작성하던 코드는 유지된다. */
export function CodeWorkspace({ languages }: Props) {
  const [language, setLanguage] = useState<Language>(() => defaultLanguage(languages));
  const [codeByLanguage, setCodeByLanguage] = useState<Record<Language, string>>(CODE_TEMPLATES);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div role="radiogroup" aria-label="언어 선택" className="flex gap-1">
          {languages.map((lang) => (
            <button
              key={lang}
              type="button"
              role="radio"
              aria-checked={language === lang}
              onClick={() => setLanguage(lang)}
              className={cn(
                "rounded-md px-3 py-1 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                language === lang ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
              )}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">
          <kbd className="rounded border px-1 font-mono">Ctrl</kbd>+<kbd className="rounded border px-1 font-mono">M</kbd>{" "}
          Tab으로 에디터 밖으로 이동
        </p>
      </div>

      {/* 모바일은 고정 높이, 데스크톱은 화면 높이에 맞춘다. */}
      <div className="h-[360px] lg:h-[calc(100vh-14rem)] lg:min-h-[420px]">
        <CodeEditor
          language={language}
          value={codeByLanguage[language]}
          onChange={(code) => setCodeByLanguage((prev) => ({ ...prev, [language]: code }))}
        />
      </div>
    </div>
  );
}
