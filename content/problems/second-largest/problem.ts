import type { ProblemContent } from "../../types.ts";

// 큰 입력 생성용 의사 난수 (매번 같은 값이 나오도록 시드 고정)
function makeRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s;
  };
}

// 기대 출력은 "서로 다른 값을 정렬한 뒤 뒤에서 두 번째"로 독립적으로 계산한다.
function caseOf(nums: number[]) {
  const distinct = [...new Set(nums)].sort((a, b) => a - b);
  const answer = distinct.length >= 2 ? distinct[distinct.length - 2] : -1;
  return { input: `${nums.length}\n${nums.join(" ")}\n`, output: `${answer}\n` };
}

const rand = makeRandom(5150);
const randomNums: number[] = [];
for (let i = 0; i < 100000; i++) randomNums.push((rand() % 1000000000) + 1);
const bigRandom = caseOf(randomNums);
const bigSame = caseOf(new Array<number>(100000).fill(1000000000));

const problem: ProblemContent = {
  slug: "second-largest",
  title: "두 번째로 큰 수",
  difficulty: 1,
  estimatedMinutes: 15,
  languages: ["java", "c"],
  tags: {
    algorithm: ["brute-force"],
    data_structure: ["array"],
  },
  description: `노래 경연 대회에서 참가자 N명이 점수를 받았습니다. 같은 점수를 받은 참가자는 같은 순위로 인정합니다. 예를 들어 최고 점수를 받은 사람이 두 명이면 두 사람 모두 1위이고, 2위는 그다음으로 높은 점수를 받은 사람입니다.

참가자들의 점수가 주어질 때, **2위의 점수**를 구하세요. 즉, 서로 다른 점수 중에서 두 번째로 큰 값을 구해야 합니다.

모든 참가자의 점수가 같아서 2위가 없다면 \`-1\`을 출력합니다.`,
  input: `첫째 줄에 참가자 수 N이 주어집니다.
둘째 줄에 N명의 점수가 공백으로 구분되어 주어집니다.`,
  output: `서로 다른 점수 중 두 번째로 큰 값을 출력합니다. 그런 값이 없으면 \`-1\`을 출력합니다.`,
  constraints: `- 2 ≤ N ≤ 100,000
- 1 ≤ 각 점수 ≤ 1,000,000,000`,
  examples: [
    {
      input: "5\n70 95 80 95 60\n",
      output: "80\n",
      explanation: "95점이 두 명이므로 둘 다 1위입니다. 그다음으로 높은 점수는 80점입니다.",
    },
    {
      input: "3\n50 50 50\n",
      output: "-1\n",
      explanation: "모두 50점으로 공동 1위이므로 2위가 없습니다.",
    },
  ],
  hints: [
    "가장 큰 값을 찾는 방법은 알고 있을 거예요. 그 과정에서 \"두 번째로 큰 값\"도 함께 기억할 수 있을까요?",
    "가장 큰 값과 같은 값이 또 나왔을 때 두 번째 값이 바뀌면 안 됩니다. 그리고 지금보다 더 큰 최댓값이 새로 나타나면, 원래 최댓값은 어떻게 되어야 할까요?",
    "first(최댓값)와 second(두 번째 값)를 -1로 시작합니다. 새 값 x가 first보다 크면 기존 first를 second로 내리고 first를 x로 바꿉니다. x가 first보다 작고 second보다 크면 second만 바꿉니다. x가 first와 같으면 아무것도 하지 않습니다.",
    "first = -1, second = -1\nfor 점수 x:\n  if x > first:\n    second = first\n    first = x\n  else if x < first and x > second:\n    second = x\n출력 second",
  ],
  solution: `배열을 한 번 훑으면서 **최댓값(first)과 두 번째 값(second)**을 함께 관리합니다. 점수는 1 이상이므로 둘 다 \`-1\`로 시작하면, 끝까지 \`second\`가 바뀌지 않았을 때 그대로 \`-1\`을 출력하면 됩니다.

각 점수 \`x\`에 대해
- \`x > first\`: 기존 최댓값이 2위로 내려갑니다. \`second = first\`, \`first = x\`
- \`first > x > second\`: \`second = x\`
- \`x == first\`: 공동 1위이므로 아무것도 바꾸지 않습니다.

정렬한 뒤 뒤에서부터 최댓값과 다른 값을 찾는 방법도 있지만 O(N log N)이 걸립니다.

**시간복잡도** O(N), **공간복잡도** O(N) (점수를 배열에 저장할 경우. 읽으면서 처리하면 O(1))

**자주 하는 실수**
- 정렬 후 단순히 뒤에서 두 번째 원소를 출력해서, 최댓값이 중복될 때 최댓값을 그대로 출력함
- 새 최댓값이 나왔을 때 기존 최댓값을 \`second\`로 옮기지 않음 (\`5 1 3 8\`에서 3을 출력하는 실수)
- \`x == first\`인 경우를 따로 막지 않아 \`second\`가 최댓값과 같아짐
- \`-1\`로 초기화할 수 있는 것은 점수가 1 이상이기 때문입니다. 음수 점수도 가능한 문제라면 \`Integer.MIN_VALUE\`(C에서는 \`INT_MIN\`)나 별도의 \"값이 있는지\" 표시 변수를 써야 합니다.`,
  tests: [
    { input: "2\n1 2\n", output: "1\n", note: "N = 2, 서로 다른 값" },
    { input: "2\n7 7\n", output: "-1\n", note: "N = 2, 같은 값이라 2위 없음" },
    { input: "4\n3 9 9 9\n", output: "3\n", note: "최댓값이 여러 번 중복" },
    { input: "4\n5 1 3 8\n", output: "5\n", note: "마지막에 새 최댓값이 나와 기존 최댓값이 2위로 내려감" },
    { input: "5\n1000000000 999999999 1000000000 1 1\n", output: "999999999\n", note: "값의 범위 양 끝" },
    { ...bigRandom, note: "N = 100,000 큰 입력" },
    { ...bigSame, note: "N = 100,000, 모두 같은 값이라 2위 없음" },
  ],
};

export default problem;
