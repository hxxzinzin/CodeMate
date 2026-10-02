import type { Language } from "@/types/problem";
import type { JudgeSummary, SubmissionResult } from "@/types/submission";

/**
 * 이 제출을 실력 점수(Skill)·추천 난이도에 반영하지 않는 이유. 반영하면 null.
 * 서버(제출 처리)와 화면(안내 문구)이 같은 규칙을 쓰도록 한 곳에 둔다.
 *
 * - compile_error: 컴파일 에러는 문법 실수라 알고리즘 실력의 근거가 아니다.
 * - possible_compile_error: 채점 서비스는 Java 컴파일 에러를 메시지 없는 실행 에러로 돌려준다. (ADR-014)
 *   첫 번째 테스트(예제)부터 이렇게 실패했다면 컴파일 에러일 가능성이 커서 반영하지 않는다.
 *   예제를 통과한 뒤의 실행 에러는 컴파일 에러일 수 없으므로(같은 코드가 이미 실행됨) 반영한다.
 */
export function skillSkipReason(
  result: SubmissionResult,
  language: Language,
  judge: JudgeSummary | null,
): "compile_error" | "possible_compile_error" | null {
  if (result === "ce") return "compile_error";
  if (result === "re" && language === "java" && judge?.failed?.number === 1 && !judge.message) {
    return "possible_compile_error";
  }
  return null;
}
