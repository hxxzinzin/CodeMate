"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/** 예제 입력을 클립보드에 복사한다. 결과는 화면 낭독기에도 알린다. */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1500);
  }

  return (
    <>
      <Button type="button" variant="ghost" size="icon-xs" onClick={copy} aria-label={`${label} 복사`}>
        {state === "copied" ? <CheckIcon /> : <CopyIcon />}
      </Button>
      <span role="status" className="sr-only">
        {state === "copied" ? "복사했어요" : state === "failed" ? "복사하지 못했어요" : ""}
      </span>
    </>
  );
}
