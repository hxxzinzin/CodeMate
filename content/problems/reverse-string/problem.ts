import type { ProblemContent } from "../../types.ts";

// 최대 길이 테스트용 입력: 알파벳과 숫자가 반복되는 100,000자 문자열
const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
let longText = "";
for (let i = 0; i < 100000; i++) longText += charset[(i * 7 + 3) % charset.length];
const longReversed = [...longText].reverse().join("");

const problem: ProblemContent = {
  slug: "reverse-string",
  title: "문자열 뒤집기",
  difficulty: 1,
  estimatedMinutes: 15,
  languages: ["c"],
  tags: {
    algorithm: ["two-pointer"],
    data_structure: ["string"],
    c: ["pointer", "string"],
  },
  description: `비밀 쪽지를 주고받는 두 친구는 메시지를 거꾸로 써서 보내기로 했습니다. 받은 쪽지를 읽으려면 글자 순서를 다시 뒤집어야 합니다.

문자열 S가 주어질 때, S를 앞뒤로 뒤집은 문자열을 출력하세요.

이 문제는 새 배열을 만들지 않고, **포인터 두 개를 이용해 원래 문자열 안에서 직접 뒤집는 방법**을 연습하는 것이 목표입니다.`,
  input: `첫째 줄에 문자열 S가 주어집니다.`,
  output: `S를 뒤집은 문자열을 출력합니다.`,
  constraints: `- 1 ≤ S의 길이 ≤ 100,000
- S는 영어 대소문자와 숫자로만 이루어져 있습니다. (공백 없음)`,
  examples: [
    {
      input: "hello\n",
      output: "olleh\n",
      explanation: "h, e, l, l, o의 순서를 거꾸로 하면 o, l, l, e, h가 됩니다.",
    },
    {
      input: "CodeMate2024\n",
      output: "4202etaMedoC\n",
      explanation: "대소문자와 숫자도 그대로 유지한 채 순서만 뒤집습니다.",
    },
  ],
  hints: [
    "문자열을 뒤집으면 첫 글자와 마지막 글자는 서로 어디로 갈까요? 두 번째 글자와 끝에서 두 번째 글자는요?",
    "양 끝에서 한 쌍씩 자리를 바꾸면 됩니다. 그렇다면 언제 멈춰야 할까요? 끝까지 바꾸면 어떤 일이 생길지 생각해보세요.",
    "왼쪽 포인터는 문자열의 시작, 오른쪽 포인터는 마지막 문자(널 문자 바로 앞)를 가리키게 합니다. 두 포인터가 만나거나 엇갈리기 전까지 가리키는 문자를 교환하고, 왼쪽은 오른쪽으로, 오른쪽은 왼쪽으로 한 칸씩 옮깁니다.",
    "left = s의 첫 문자 주소\nright = s의 마지막 문자 주소 (s + 길이 - 1)\nwhile left < right:\n  *left와 *right 교환\n  left++, right--\n출력 s",
  ],
  solution: `뒤집힌 문자열에서 i번째 글자는 원래 문자열의 끝에서 i번째 글자입니다. 따라서 **양 끝의 글자를 서로 바꾸면서 가운데로 모이면** 새 배열 없이 뒤집을 수 있습니다.

1. \`char *left = s\`, \`char *right = s + strlen(s) - 1\`로 두 포인터를 준비합니다.
2. \`left < right\`인 동안 \`*left\`와 \`*right\`를 교환하고, \`left++\`, \`right--\` 합니다.
3. 두 포인터가 만나거나 엇갈리면 뒤집기가 끝난 것입니다. 길이가 홀수이면 가운데 글자는 그대로 둡니다.

**시간복잡도** O(L), **공간복잡도** O(1) (입력 문자열 외 추가 공간 없음)

**자주 하는 실수**
- \`right\`를 \`s + strlen(s)\`로 잡아서 널 문자 \`'\\0'\`까지 맨 앞으로 옮기는 바람에 아무것도 출력되지 않음
- 반복 조건을 \`left != right\`로 써서 길이가 짝수일 때 두 포인터가 엇갈린 뒤에도 계속 진행함
- 끝까지 교환해서 한 번 뒤집은 문자열을 다시 원래대로 되돌림
- 반복문 안에서 \`strlen\`을 매번 호출하면 O(L²)이 되므로 길이는 한 번만 구하세요.`,
  tests: [
    { input: "a\n", output: "a\n", note: "길이 1 (포인터가 처음부터 같은 곳)" },
    { input: "ab\n", output: "ba\n", note: "길이 2 (한 번 교환 후 엇갈림)" },
    { input: "abcde\n", output: "edcba\n", note: "홀수 길이, 가운데 글자 유지" },
    { input: "racecar\n", output: "racecar\n", note: "회문은 뒤집어도 같음" },
    { input: "Z9y8X7\n", output: "7X8y9Z\n", note: "대소문자와 숫자 혼합, 짝수 길이" },
    { input: longText + "\n", output: longReversed + "\n", note: "최대 길이 100,000" },
  ],
};

export default problem;
