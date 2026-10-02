import type { Language } from "./problem";
import type { SkillCategory } from "./skill";

/**
 * self_*: Judge 도입 전 사용자가 직접 확인한 결과 (ADR-003)
 * ac/wa/tle/re/ce: 실제 Judge 결과
 */
export type SubmissionResult =
  | "pending"
  | "self_correct"
  | "self_wrong"
  | "ac"
  | "wa"
  | "tle"
  | "re"
  | "ce";

export type Submission = {
  id: string;
  problemId: string;
  language: Language;
  result: SubmissionResult;
  solvingTimeSec: number;
  hintCount: number;
  attemptCount: number;
  solutionRevealed: boolean;
  createdAt: string;
};

/** 제출로 바뀐 Skill 점수 (before가 null이면 처음 측정) */
export type SkillChange = {
  category: SkillCategory;
  skill: string;
  before: number | null;
  after: number;
};

/**
 * 자동 채점 요약 (submissions.judge_detail, 제출 응답).
 * 숨김 테스트는 입력·기대 출력을 절대 담지 않는다. 예제(sample)만 틀린 내용을 보여준다.
 */
export type JudgeSummary = {
  passed: number;
  total: number;
  /** 실행한 테스트 중 가장 오래 걸린 시간(초) */
  maxTimeSec: number | null;
  /** 실행 서비스의 입력 크기 한도 때문에 실행하지 못한 테스트 수 (주로 효율성 확인용 큰 입력) */
  skipped?: number;
  /** 처음 틀린 테스트 (1부터 시작하는 번호) */
  failed?: {
    number: number;
    sample: boolean;
    input?: string;
    expected?: string;
    actual?: string;
  };
  /** 컴파일 에러·런타임 에러 메시지 (사용자 코드의 출력이라 그대로 보여줘도 된다) */
  message?: string;
};

/** POST /api/submissions 성공 응답 (서버·클라이언트 공용) */
export type SubmitResponse = {
  /** 자동 채점 결과. 자기 보고 채점이면 null */
  judge: JudgeSummary | null;
  /** 이번 제출로 갱신된 Skill. 갱신에 실패하면 빈 배열 */
  skillChanges: SkillChange[];
  /** 추천 난이도 변화. 조정하지 않았거나(재시도·복습) 실패하면 null */
  difficultyChange: { before: number; after: number } | null;
  submissionId: string;
  result: SubmissionResult;
  attemptCount: number;
  /** 이번 제출로 처음 해결했는지 */
  newlySolved: boolean;
  /** 갱신된 연속 학습일. 학습 상태 저장에 실패하면 null */
  streak: number | null;
};
