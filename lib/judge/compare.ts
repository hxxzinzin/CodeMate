/**
 * 출력 비교 규칙 (단일 출처). 문제 검증 스크립트(scripts/content/verify.ts)와 채점기가 같이 쓴다.
 * 줄바꿈(CRLF/LF), 줄 끝 공백, 마지막 빈 줄은 무시한다. 그 밖의 공백 차이는 오답이다.
 *
 * 경로 별칭(@/) 없이 작성한다. Node로 바로 실행하는 스크립트에서도 import하기 때문이다.
 */
export function normalizeOutput(text: string): string {
  return text.replace(/\r\n/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").replace(/\n+$/, "");
}

export function outputsMatch(actual: string, expected: string): boolean {
  return normalizeOutput(actual) === normalizeOutput(expected);
}
