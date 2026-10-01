import type { Language } from "@/types/problem";

/** 언어를 처음 선택했을 때 에디터에 채워 넣는 기본 코드 */
export const CODE_TEMPLATES: Record<Language, string> = {
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {

    }
}
`,
  c: `#include <stdio.h>

int main(void) {

    return 0;
}
`,
};

/** Monaco 에디터의 언어 id */
export const MONACO_LANGUAGE: Record<Language, string> = {
  java: "java",
  c: "c",
};

/** 문제가 지원하는 언어 중 기본으로 선택할 언어. Java를 우선한다. */
export function defaultLanguage(languages: Language[]): Language {
  return languages.includes("java") ? "java" : languages[0] ?? "java";
}
