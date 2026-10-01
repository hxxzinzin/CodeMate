export type Language = "java" | "c";

/** 1~5 단계로 시작한다. DB는 1~10까지 허용해 확장할 수 있다. */
export type Difficulty = number;

/** problem_tags.tag_type — Skill 카테고리와 1:1로 대응한다. (ADR 참고) */
export type TagType = "language" | "algorithm" | "data_structure" | "java" | "c";

export type ProblemTag = {
  type: Exclude<TagType, "language">;
  /** kebab-case 키 (예: "two-pointer") */
  key: string;
};

export type ProblemExample = {
  input: string;
  output: string;
  explanation?: string;
};

export type Problem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  input: string;
  output: string;
  constraints: string;
  examples: ProblemExample[];
  difficulty: Difficulty;
  estimatedMinutes: number;
  languages: Language[];
  tags: ProblemTag[];
  createdAt: string;
  updatedAt: string;
};

/** 목록 화면에 필요한 최소 정보. 해설·힌트는 클라이언트에 내려주지 않는다. */
export type ProblemSummary = Pick<
  Problem,
  "id" | "slug" | "title" | "difficulty" | "estimatedMinutes" | "languages" | "tags"
>;

export type ProblemStatus = "unsolved" | "attempted" | "solved";
