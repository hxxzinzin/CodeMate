"use client";

import { useSyncExternalStore } from "react";
import Editor from "@monaco-editor/react";
import { EditorLoading } from "@/components/editor/editor-loading";
import { MONACO_LANGUAGE } from "@/lib/editor/templates";
import type { Language } from "@/types/problem";

type Props = {
  language: Language;
  value: string;
  onChange: (value: string) => void;
};

/** 사이트 테마(<html class="dark">)를 구독해 에디터 테마를 맞춘다. */
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const isDarkTheme = () => document.documentElement.classList.contains("dark");

/**
 * Monaco 에디터 (VS Code와 같은 편집기).
 * 용량이 커서 브라우저에서만, 필요할 때 CDN으로 불러온다. (code-workspace에서 dynamic import)
 */
export default function CodeEditor({ language, value, onChange }: Props) {
  const dark = useSyncExternalStore(subscribeTheme, isDarkTheme, () => false);

  return (
    <Editor
      height="100%"
      language={MONACO_LANGUAGE[language]}
      value={value}
      onChange={(next) => onChange(next ?? "")}
      theme={dark ? "vs-dark" : "light"}
      loading={<EditorLoading />}
      options={{
        ariaLabel: `${language === "java" ? "Java" : "C"} 코드 에디터`,
        fontSize: 14,
        tabSize: 4,
        insertSpaces: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 12 },
        // 코딩테스트 연습이므로 AI식 자동완성은 없고, Monaco 기본 단어 추천만 사용한다.
        quickSuggestions: { other: true, comments: false, strings: false },
      }}
    />
  );
}
