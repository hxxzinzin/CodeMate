import type { ProblemContent } from "../../types.ts";

// 큰 입력 생성용 의사 난수 (매번 같은 값이 나오도록 시드 고정)
function makeRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s;
  };
}

function bigCase(n: number, seed: number) {
  const rand = makeRandom(seed);
  const nums: number[] = [];
  for (let i = 0; i < n; i++) nums.push((rand() % 2000001) - 1000000);
  let max = -Infinity;
  let min = Infinity;
  for (const x of nums) {
    if (x > max) max = x;
    if (x < min) min = x;
  }
  return { input: `${n}\n${nums.join(" ")}\n`, output: `${max} ${min}\n` };
}

const big = bigCase(100000, 20240917);

const problem: ProblemContent = {
  slug: "max-min",
  title: "최댓값과 최솟값",
  difficulty: 1,
  estimatedMinutes: 10,
  languages: ["java", "c"],
  tags: {
    data_structure: ["array"],
    java: ["basic-syntax"],
    c: ["array"],
  },
  description: `기상 관측소에서 하루 동안 측정한 기온 기록 N개가 있습니다. 관측소는 하루 요약표에 가장 높은 기록과 가장 낮은 기록을 적어야 합니다.

N개의 정수가 주어질 때, 그중 최댓값과 최솟값을 구하세요.`,
  input: `첫째 줄에 정수의 개수 N이 주어집니다.
둘째 줄에 N개의 정수가 공백으로 구분되어 주어집니다.`,
  output: `최댓값과 최솟값을 공백 하나로 구분하여 한 줄에 출력합니다. (최댓값을 먼저 출력합니다.)`,
  constraints: `- 1 ≤ N ≤ 100,000
- -1,000,000 ≤ 각 정수 ≤ 1,000,000`,
  examples: [
    {
      input: "5\n3 -1 7 0 4\n",
      output: "7 -1\n",
      explanation: "가장 큰 값은 7, 가장 작은 값은 -1입니다.",
    },
    {
      input: "3\n10 10 10\n",
      output: "10 10\n",
      explanation: "모든 값이 같으면 최댓값과 최솟값도 같습니다.",
    },
  ],
  hints: [
    "모든 값을 한 번씩만 보고도 가장 큰 값을 알 수 있을까요? 지금까지 본 값 중 가장 큰 값을 기억해 두면 어떨까요?",
    "최댓값과 최솟값을 담을 변수의 처음 값을 무엇으로 정할지가 중요합니다. 0으로 시작하면 모든 수가 음수일 때 어떻게 될까요?",
    "첫 번째 수로 최댓값과 최솟값을 모두 초기화한 뒤, 나머지 수를 하나씩 보면서 더 크면 최댓값을, 더 작으면 최솟값을 갱신합니다.",
    "max = min = 첫 번째 수\nfor 나머지 수 x:\n  if x > max: max = x\n  if x < min: min = x\n출력 max, min",
  ],
  solution: `수를 한 번씩 훑으면서 **지금까지 본 값 중 가장 큰 값과 가장 작은 값**을 갱신합니다.

1. 첫 번째 수로 \`max\`와 \`min\`을 초기화합니다.
2. 나머지 수 \`x\`마다 \`x > max\`이면 \`max = x\`, \`x < min\`이면 \`min = x\`로 바꿉니다.
3. \`max min\` 순서로 출력합니다.

정렬해서 양 끝을 보는 방법도 있지만 O(N log N)이 걸리므로, 한 번 훑는 O(N) 방법이 더 효율적입니다.

**시간복잡도** O(N), **공간복잡도** O(N) (배열에 저장할 경우. 읽으면서 바로 비교하면 O(1))

**자주 하는 실수**
- \`max\`, \`min\`을 0으로 초기화해서 모든 값이 음수(또는 양수)일 때 틀림
- 최솟값과 최댓값의 출력 순서를 바꿈
- Java에서 \`Scanner\`로 10만 개를 읽으면 느릴 수 있으니 \`BufferedReader\`와 \`StringTokenizer\`를 사용하세요.`,
  tests: [
    { input: "1\n-5\n", output: "-5 -5\n", note: "N = 1, 최댓값과 최솟값이 같은 원소" },
    { input: "4\n-3 -8 -1 -20\n", output: "-1 -20\n", note: "모두 음수 (0으로 초기화하면 틀림)" },
    { input: "4\n2 9 4 6\n", output: "9 2\n", note: "모두 양수 (0으로 초기화하면 틀림)" },
    { input: "3\n1000000 -1000000 0\n", output: "1000000 -1000000\n", note: "값의 범위 양 끝" },
    { ...big, note: "N = 100,000 큰 입력" },
  ],
};

export default problem;
