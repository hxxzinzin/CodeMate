import type { ProblemContent } from "../../types.ts";

// 최대 길이 테스트용 입력. 기대 출력은 "뒤집은 문자열과 같은가"로 독립적으로 계산한다.
function caseOf(s: string) {
  const isPalindrome = s === [...s].reverse().join("");
  return { input: `${s}\n`, output: isPalindrome ? "YES\n" : "NO\n" };
}

let half = "";
for (let i = 0; i < 50000; i++) half += String.fromCharCode(97 + ((i * 13 + 5) % 26));
const longPalindrome = half + [...half].reverse().join("");
// 가운데 바로 앞 글자 하나만 바꿔서 회문이 아니게 만든다.
const mid = longPalindrome.length / 2 - 1;
const swapped = longPalindrome[mid] === "z" ? "a" : "z";
const longAlmost = longPalindrome.slice(0, mid) + swapped + longPalindrome.slice(mid + 1);

const problem: ProblemContent = {
  slug: "palindrome-check",
  title: "회문 판별",
  difficulty: 1,
  estimatedMinutes: 15,
  languages: ["java", "c"],
  tags: {
    algorithm: ["two-pointer"],
    data_structure: ["string"],
  },
  description: `앞에서부터 읽어도, 뒤에서부터 읽어도 똑같은 문자열을 **회문**이라고 합니다. 예를 들어 \`level\`, \`noon\`은 회문이고 \`apple\`은 회문이 아닙니다.

영어 소문자로 이루어진 문자열 S가 주어질 때, S가 회문인지 판별하세요.`,
  input: `첫째 줄에 문자열 S가 주어집니다.`,
  output: `S가 회문이면 \`YES\`, 아니면 \`NO\`를 출력합니다.`,
  constraints: `- 1 ≤ S의 길이 ≤ 100,000
- S는 영어 소문자로만 이루어져 있습니다.`,
  examples: [
    {
      input: "level\n",
      output: "YES\n",
      explanation: "뒤에서부터 읽어도 l, e, v, e, l로 같으므로 회문입니다.",
    },
    {
      input: "abca\n",
      output: "NO\n",
      explanation: "양 끝의 a끼리는 같지만, 두 번째 글자 b와 끝에서 두 번째 글자 c가 다르므로 회문이 아닙니다.",
    },
  ],
  hints: [
    "회문이라면 첫 글자와 마지막 글자는 어떤 관계일까요? 두 번째 글자와 끝에서 두 번째 글자는요?",
    "문자열 전체를 뒤집어 새로 만들지 않고도 판별할 수 있을까요? 그리고 몇 쌍까지 비교하면 충분할지 생각해보세요.",
    "왼쪽 인덱스는 0, 오른쪽 인덱스는 길이 - 1에서 시작합니다. 두 위치의 글자를 비교해서 다르면 바로 회문이 아니고, 같으면 둘 다 가운데로 한 칸씩 옮깁니다. 두 인덱스가 만나거나 엇갈리면 끝입니다.",
    "left = 0, right = 길이 - 1\nwhile left < right:\n  if S[left] != S[right]: 출력 NO, 종료\n  left++, right--\n출력 YES",
  ],
  solution: `회문은 **i번째 글자와 끝에서 i번째 글자가 모두 같은** 문자열입니다. 양 끝에서 가운데로 모이는 두 포인터로 확인합니다.

1. \`left = 0\`, \`right = 길이 - 1\`로 시작합니다.
2. \`left < right\`인 동안 \`S[left]\`와 \`S[right]\`를 비교합니다. 다르면 바로 \`NO\`입니다.
3. 같으면 \`left++\`, \`right--\` 합니다. 끝까지 다른 쌍이 없으면 \`YES\`입니다.

길이가 홀수이면 가운데 글자는 자기 자신과 짝이므로 비교할 필요가 없습니다.

**시간복잡도** O(L), **공간복잡도** O(L) (입력 문자열 저장. 추가 공간은 O(1))

**자주 하는 실수**
- \`right\`를 \`길이\`로 시작해서 범위를 벗어남 (C에서는 널 문자와 비교하게 됨)
- 문자열을 뒤집어 비교하는 방법도 맞지만, Java에서 \`String\`을 한 글자씩 이어 붙여 뒤집으면 O(L²)이 되어 느립니다. 뒤집을 거라면 \`StringBuilder.reverse()\`를 쓰세요.
- Java에서 문자열 비교를 \`==\`로 하면 내용이 아니라 참조를 비교하므로 \`equals\`를 써야 합니다.`,
  tests: [
    { input: "a\n", output: "YES\n", note: "길이 1은 항상 회문" },
    { input: "ab\n", output: "NO\n", note: "길이 2, 다른 글자" },
    { input: "aa\n", output: "YES\n", note: "길이 2, 같은 글자" },
    { input: "abccba\n", output: "YES\n", note: "짝수 길이 회문" },
    { input: "abcdecba\n", output: "NO\n", note: "가운데 한 쌍만 다른 경우" },
    { ...caseOf(longPalindrome), note: "최대 길이 100,000 회문" },
    { ...caseOf(longAlmost), note: "최대 길이, 가운데 근처 한 글자만 다름" },
  ],
};

export default problem;
