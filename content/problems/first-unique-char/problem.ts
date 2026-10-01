import type { ProblemContent } from "../../types.ts";

// 기대 출력은 JS 객체로 횟수를 센 뒤 앞에서부터 찾아 독립적으로 계산한다.
function caseOf(s: string) {
  const counts: Record<string, number> = {};
  for (const ch of s) counts[ch] = (counts[ch] ?? 0) + 1;
  const answer = [...s].find((ch) => counts[ch] === 1) ?? "-1";
  return { input: `${s}\n`, output: `${answer}\n` };
}

const lower = "abcdefghijklmnopqrstuvwxyz";
// a~y가 반복되다가 맨 끝에 z가 한 번만 나오는 99,999 + 1자 문자열
let endsWithUnique = "";
for (let i = 0; i < 99999; i++) endsWithUnique += lower[i % 25];
endsWithUnique += "z";
// a~z가 모두 여러 번 나오는 100,000자 문자열
let noUnique = "";
for (let i = 0; i < 100000; i++) noUnique += lower[i % 26];
// 첫 글자 x가 맨 끝에서 다시 나오고, 두 번째 글자 q만 한 번 나오는 문자열
const filler = lower.replace("q", "").replace("x", "");
let mixed = "";
for (let i = 0; i < 99997; i++) mixed += filler[(i * 7) % filler.length];
mixed = "xq" + mixed + "x";

const problem: ProblemContent = {
  slug: "first-unique-char",
  title: "처음으로 한 번만 나오는 문자",
  difficulty: 2,
  estimatedMinutes: 20,
  languages: ["java", "c"],
  tags: {
    algorithm: ["frequency-count"],
    data_structure: ["string", "array"],
  },
  description: `암호 해독 동아리에서 문자열 속 \"외톨이 문자\"를 찾는 놀이를 하고 있습니다. 외톨이 문자란 문자열 전체에서 **딱 한 번만 등장하는 문자**를 말합니다.

영어 소문자로 이루어진 문자열 S가 주어질 때, 외톨이 문자 중 **S에서 가장 앞에 있는 문자**를 출력하세요.

외톨이 문자가 하나도 없다면 \`-1\`을 출력합니다.`,
  input: `첫째 줄에 문자열 S가 주어집니다.`,
  output: `S에서 한 번만 등장하는 문자 중 가장 앞에 있는 문자를 출력합니다. 그런 문자가 없으면 \`-1\`을 출력합니다.`,
  constraints: `- 1 ≤ S의 길이 ≤ 100,000
- S는 영어 소문자로만 이루어져 있습니다.`,
  examples: [
    {
      input: "statistics\n",
      output: "a\n",
      explanation: "s와 t는 3번, i는 2번 나옵니다. 한 번만 나오는 문자는 a와 c이고, 그중 앞에 있는 a가 답입니다.",
    },
    {
      input: "abcabc\n",
      output: "-1\n",
      explanation: "a, b, c가 모두 두 번씩 나오므로 한 번만 나오는 문자가 없습니다.",
    },
  ],
  hints: [
    "어떤 문자가 \"한 번만\" 나오는지 알려면 문자열의 어디까지 봐야 할까요? 앞부분만 보고 판단할 수 있을까요?",
    "문자마다 바로 뒤를 전부 뒤져서 같은 문자가 있는지 확인하면 길이가 100,000일 때 너무 느립니다. 문자의 종류는 소문자 26개뿐이라는 점을 활용할 수 있을까요?",
    "두 번 훑습니다. 첫 번째로 훑을 때 크기 26인 배열에 문자별 등장 횟수를 셉니다. 두 번째로 앞에서부터 다시 훑으면서 횟수가 1인 문자를 처음 만나면 그것이 답입니다.",
    "count[26] = 모두 0\nfor 문자 c in S:\n  count[c - 'a']++\nfor 문자 c in S (앞에서부터):\n  if count[c - 'a'] == 1: 출력 c, 종료\n출력 -1",
  ],
  solution: `문자열 전체를 봐야 \"한 번만 나왔는지\" 알 수 있으므로, **먼저 횟수를 모두 센 뒤 다시 앞에서부터 찾는** 두 단계로 풉니다.

1. 크기 26인 정수 배열 \`count\`를 만들고, 각 문자 \`c\`마다 \`count[c - 'a']\`를 1 늘립니다.
2. S를 다시 앞에서부터 훑으며 \`count[c - 'a'] == 1\`인 첫 문자를 출력합니다.
3. 끝까지 없으면 \`-1\`을 출력합니다.

두 번째 단계에서 배열 \`count\`를 a부터 z 순서로 훑으면 \"알파벳 순으로 가장 앞선 문자\"를 찾게 되어 틀립니다. 반드시 **문자열의 순서대로** 훑어야 합니다.

**시간복잡도** O(L), **공간복잡도** O(L) (입력 문자열 저장. 횟수 배열은 26칸으로 고정)

**자주 하는 실수**
- 각 문자마다 문자열 전체를 다시 훑어 O(L²)이 되어 시간 초과
- 횟수 배열을 알파벳 순으로 훑어서 문자열 순서가 아닌 알파벳 순서로 답을 고름
- Java에서 \`HashMap<Character, Integer>\`를 써도 맞지만, 소문자만 나오므로 \`int[26]\`이 더 간단하고 빠릅니다.`,
  tests: [
    { input: "z\n", output: "z\n", note: "길이 1, 그 문자 자체가 답" },
    { input: "aa\n", output: "-1\n", note: "길이 2, 답이 없음" },
    { input: "aabbc\n", output: "c\n", note: "답이 맨 끝에 있음" },
    { input: "zyxa\n", output: "z\n", note: "모두 한 번씩 (알파벳 순이 아닌 문자열 순서로 첫 문자)" },
    { ...caseOf(endsWithUnique), note: "최대 길이, 유일한 답이 맨 끝" },
    { ...caseOf(noUnique), note: "최대 길이, 답이 없음" },
    { ...caseOf(mixed), note: "최대 길이, 첫 글자가 맨 끝에서 다시 나와 두 번째 글자가 답" },
  ],
};

export default problem;
