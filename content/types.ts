import type { TagKey } from "./tags.ts";

export type ContentLanguage = "java" | "c";

export type ContentTestCase = {
  input: string;
  output: string;
  /** 어떤 경우를 검사하는지 (예: "N = 1 경계값") */
  note?: string;
};

/**
 * content/problems/<slug>/problem.ts 의 형태.
 * 정답 코드는 같은 폴더의 Main.java, main.c 파일이다. (languages에 있는 언어만)
 * 입력은 표준 입력, 출력은 표준 출력. 출력 비교는 줄 끝 공백과 마지막 빈 줄을 무시한다.
 */
export type ProblemContent = {
  slug: string;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedMinutes: number;
  languages: ContentLanguage[];
  tags: {
    algorithm?: TagKey<"algorithm">[];
    data_structure?: TagKey<"data_structure">[];
    java?: TagKey<"java">[];
    c?: TagKey<"c">[];
  };
  description: string;
  input: string;
  output: string;
  constraints: string;
  /** 화면에 보여주는 예제. 채점 테스트에도 자동으로 포함된다. */
  examples: (ContentTestCase & { explanation: string })[];
  /** 1: 핵심 개념, 2: 생각할 부분, 3: 알고리즘 방향, 4: 의사코드 수준 */
  hints: [string, string, string, string];
  /** 정답 해설 (사용자가 명시적으로 요청할 때만 공개) */
  solution: string;
  /** 화면에 보이지 않는 추가 테스트 (경계값, 큰 입력 등). 향후 Judge 채점에 사용 */
  tests: ContentTestCase[];
};
