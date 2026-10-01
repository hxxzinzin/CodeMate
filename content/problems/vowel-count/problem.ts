import type { ProblemContent } from "../../types.ts";

// 최대 길이 테스트용 입력: 같은 문장을 반복해 100,000자 이하로 자른 것
const sentence = "The quick brown fox jumps over the lazy dog. ";
const longText = sentence.repeat(Math.ceil(100000 / sentence.length)).slice(0, 100000).trim();
let longCount = 0;
for (const ch of longText) {
  if ("aeiouAEIOU".includes(ch)) longCount++;
}

const problem: ProblemContent = {
  slug: "vowel-count",
  title: "모음 개수 세기",
  difficulty: 1,
  estimatedMinutes: 10,
  languages: ["java"],
  tags: {
    algorithm: ["frequency-count"],
    data_structure: ["string"],
    java: ["basic-syntax"],
  },
  description: `영어 발음 연습 앱을 만들고 있습니다. 문장마다 모음이 얼마나 들어 있는지 보여주는 기능이 필요합니다.

영어 문장 하나가 주어질 때, 문장에 들어 있는 모음의 개수를 세어 출력하세요.

- 모음은 \`a\`, \`e\`, \`i\`, \`o\`, \`u\` 다섯 글자이며, 대문자 \`A\`, \`E\`, \`I\`, \`O\`, \`U\`도 모음으로 셉니다.
- \`y\`는 모음으로 세지 않습니다.
- 공백과 문장 부호는 세지 않습니다.`,
  input: `첫째 줄에 영어 문장이 주어집니다. 문장에는 공백이 들어 있을 수 있습니다.`,
  output: `문장에 들어 있는 모음의 개수를 출력합니다.`,
  constraints: `- 1 ≤ 문장의 길이 ≤ 100,000
- 문장은 영어 대소문자, 공백, 문장 부호(\`.\`, \`,\`, \`!\`, \`?\`)로만 이루어져 있습니다.
- 문장은 공백으로 시작하거나 끝나지 않습니다.`,
  examples: [
    {
      input: "Hello World\n",
      output: "3\n",
      explanation: "Hello의 e, o와 World의 o로 모음은 3개입니다.",
    },
    {
      input: "I love Java!\n",
      output: "5\n",
      explanation: "대문자 I, love의 o와 e, Java의 a 두 개로 모음은 5개입니다. 대문자도 모음으로 셉니다.",
    },
  ],
  hints: [
    "문장에 공백이 들어 있습니다. 문장 전체를 한 번에 읽으려면 어떤 방법을 써야 할까요?",
    "어떤 문자가 모음인지 판단하는 기준을 정리해보세요. 대문자와 소문자를 각각 비교해야 할까요, 아니면 한쪽으로 맞춘 뒤 비교할 수 있을까요?",
    "문장을 한 줄 통째로 읽은 뒤 문자를 하나씩 보면서, 모음이면 개수를 1 늘립니다. 소문자로 바꾼 뒤 a, e, i, o, u 중 하나인지 확인하면 비교가 간단해집니다.",
    "line = 한 줄 읽기\ncount = 0\nfor 문자 c in line:\n  lower = c를 소문자로\n  if lower가 a, e, i, o, u 중 하나: count++\n출력 count",
  ],
  solution: `문장을 **한 줄 통째로 읽고**, 문자를 하나씩 확인하며 모음이면 개수를 셉니다.

1. \`BufferedReader.readLine()\`으로 공백을 포함한 문장 전체를 읽습니다.
2. 각 문자를 \`Character.toLowerCase\`로 소문자로 바꾼 뒤 \`a\`, \`e\`, \`i\`, \`o\`, \`u\` 중 하나인지 확인합니다.
3. 모음이면 개수를 1 늘리고, 끝까지 확인한 뒤 출력합니다.

모음 판단은 \`switch\` 문이나 \`"aeiou".indexOf(c) >= 0\`처럼 써도 됩니다.

**시간복잡도** O(L), **공간복잡도** O(L) (L은 문장의 길이)

**자주 하는 실수**
- \`Scanner.next()\`나 \`StringTokenizer\`로 첫 단어만 읽어서 나머지 단어를 놓침
- 대문자 모음(\`A\`, \`E\` 등)을 세지 않음
- \`y\`를 모음으로 셈
- 반복문 안에서 \`line = line + ...\`처럼 문자열을 새로 만들면 느려지므로, 문자는 \`charAt\`으로 읽기만 하세요.`,
  tests: [
    { input: "x\n", output: "0\n", note: "길이 1, 모음 없음" },
    { input: "a\n", output: "1\n", note: "길이 1, 모음 하나" },
    { input: "Rhythm, myths, gym!\n", output: "0\n", note: "y만 있고 모음이 없는 경우 (y는 모음 아님)" },
    { input: "AEIOU aeiou\n", output: "10\n", note: "대문자와 소문자 모음 모두" },
    { input: "Why do you cry?\n", output: "3\n", note: "y가 섞인 문장 (o, o, u)" },
    { input: longText + "\n", output: `${longCount}\n`, note: "100,000자에 가까운 긴 문장" },
  ],
};

export default problem;
