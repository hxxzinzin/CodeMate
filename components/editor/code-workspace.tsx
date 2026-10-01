"use client";

import dynamic from "next/dynamic";
import { EditorLoading } from "@/components/editor/editor-loading";

/**
 * 코드 작성 영역은 브라우저에서만 렌더링한다.
 * localStorage에 저장된 코드를 첫 렌더링부터 쓰기 위해서다. (서버는 사용자의 저장 코드를 알 수 없음)
 */
export const CodeWorkspace = dynamic(() => import("@/components/editor/editor-workspace"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] rounded-lg border">
      <EditorLoading />
    </div>
  ),
});
