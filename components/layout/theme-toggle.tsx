"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { THEME_STORAGE_KEY } from "./theme";

export function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // 저장소를 쓸 수 없는 환경(시크릿 모드 등)에서는 현재 세션에만 적용
    }
  }

  // 아이콘은 state 대신 CSS(dark:)로 전환해 서버/클라이언트 렌더 결과를 같게 유지한다.
  return (
    <Button variant="ghost" size="icon-lg" onClick={toggle} aria-label="라이트/다크 모드 전환">
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="dark:hidden" />
    </Button>
  );
}
