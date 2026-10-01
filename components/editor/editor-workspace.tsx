"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorLoading } from "@/components/editor/editor-loading";
import {
  browserStore,
  clearDraft,
  loadDraft,
  loadLastLanguage,
  MAX_DRAFT_LENGTH,
  saveDraft,
  saveLastLanguage,
} from "@/lib/editor/draft-storage";
import { CODE_TEMPLATES, defaultLanguage } from "@/lib/editor/templates";
import { LANGUAGE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Language } from "@/types/problem";

// Monaco는 브라우저 전용이고 크기가 커서, 서버 렌더링에서 빼고 이 화면에서만 불러온다.
const CodeEditor = dynamic(() => import("@/components/editor/code-editor"), {
  ssr: false,
  loading: () => <EditorLoading />,
});

const SAVE_DELAY_MS = 500;

type SaveStatus = "idle" | "saved" | "unavailable" | "too-long";

type Props = {
  slug: string;
  languages: Language[];
};

/**
 * 언어 선택 + 코드 에디터 + 자동 저장.
 * 이 컴포넌트는 브라우저에서만 렌더링된다(code-workspace.tsx의 ssr: false).
 * 그래서 첫 state를 만들 때 바로 localStorage를 읽을 수 있고,
 * "템플릿이 먼저 저장되어 기존 코드를 덮어쓰는" 순서 문제가 생기지 않는다.
 */
export default function EditorWorkspace({ slug, languages }: Props) {
  const [store] = useState(browserStore);
  const [language, setLanguage] = useState<Language>(
    () => loadLastLanguage(store, slug, languages) ?? defaultLanguage(languages),
  );
  const [codeByLanguage, setCodeByLanguage] = useState<Record<Language, string>>(() => ({
    java: loadDraft(store, slug, "java") ?? CODE_TEMPLATES.java,
    c: loadDraft(store, slug, "c") ?? CODE_TEMPLATES.c,
  }));
  const [status, setStatus] = useState<SaveStatus>(store ? "idle" : "unavailable");
  const [confirmingReset, setConfirmingReset] = useState(false);

  // 아직 저장되지 않은 마지막 변경. 탭을 닫거나 숨길 때 바로 저장하기 위해 보관한다.
  const pending = useRef<{ language: Language; code: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flush() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const change = pending.current;
    if (!change) return;
    pending.current = null;
    if (change.code.length > MAX_DRAFT_LENGTH) {
      setStatus("too-long");
    } else {
      setStatus(saveDraft(store, slug, change.language, change.code) ? "saved" : "unavailable");
    }
  }

  // 페이지를 떠나거나 탭이 숨겨질 때 남은 변경을 즉시 저장한다. (0.5초 안에 닫아도 유실되지 않게)
  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });
  useEffect(() => {
    const onHide = () => flushRef.current();
    const onVisibility = () => document.visibilityState === "hidden" && onHide();
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      onHide();
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  function handleChange(code: string) {
    setCodeByLanguage((prev) => ({ ...prev, [language]: code }));
    pending.current = { language, code };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, SAVE_DELAY_MS);
  }

  function handleLanguage(next: Language) {
    flush();
    setLanguage(next);
    setConfirmingReset(false);
    saveLastLanguage(store, slug, next);
  }

  function handleReset() {
    if (timer.current) clearTimeout(timer.current);
    pending.current = null;
    clearDraft(store, slug, language);
    setCodeByLanguage((prev) => ({ ...prev, [language]: CODE_TEMPLATES[language] }));
    setConfirmingReset(false);
    setStatus(store ? "idle" : "unavailable");
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <div role="radiogroup" aria-label="언어 선택" className="flex gap-1">
          {languages.map((lang) => (
            <button
              key={lang}
              type="button"
              role="radio"
              aria-checked={language === lang}
              onClick={() => handleLanguage(lang)}
              className={cn(
                "rounded-md px-3 py-1 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                language === lang ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
              )}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>

        {confirmingReset ? (
          <div className="flex items-center gap-1 text-xs" role="group" aria-label="초기화 확인">
            <span className="text-muted-foreground">{LANGUAGE_LABELS[language]} 코드를 지울까요?</span>
            <Button size="xs" variant="destructive" onClick={handleReset}>
              초기화
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setConfirmingReset(false)}>
              취소
            </Button>
          </div>
        ) : (
          <Button size="xs" variant="ghost" onClick={() => setConfirmingReset(true)}>
            <RotateCcwIcon />
            템플릿으로 초기화
          </Button>
        )}
      </div>

      {/* 모바일은 고정 높이, 데스크톱은 화면 높이에 맞춘다. */}
      <div className="h-[360px] lg:h-[calc(100vh-16rem)] lg:min-h-[420px]">
        <CodeEditor language={language} value={codeByLanguage[language]} onChange={handleChange} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-1.5 text-xs text-muted-foreground">
        <SaveStatusText status={status} />
        <p className="hidden sm:block">
          <kbd className="rounded border px-1 font-mono">Ctrl</kbd>+<kbd className="rounded border px-1 font-mono">M</kbd>{" "}
          Tab으로 에디터 밖으로 이동
        </p>
      </div>
    </div>
  );
}

function SaveStatusText({ status }: { status: SaveStatus }) {
  if (status === "unavailable") {
    return (
      <p role="alert" className="text-destructive">
        이 브라우저에서는 코드를 저장할 수 없어요. (시크릿 모드 또는 저장 공간 부족)
      </p>
    );
  }
  if (status === "too-long") {
    return (
      <p role="alert" className="text-destructive">
        코드가 너무 길어 자동 저장하지 못했어요. ({MAX_DRAFT_LENGTH.toLocaleString()}자 이하)
      </p>
    );
  }
  return <p>{status === "saved" ? "자동 저장됨 · 이 브라우저에만 저장돼요" : "작성한 코드는 이 브라우저에 자동 저장돼요"}</p>;
}
