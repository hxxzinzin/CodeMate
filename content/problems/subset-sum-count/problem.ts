import type { ContentTestCase, ProblemContent } from "../../types.ts";

/** 테스트 데이터 생성용 결정적 난수 (매번 같은 입력이 만들어진다) */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return (max: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % max;
  };
}

/** 기대 출력은 재귀가 아닌 비트마스크 전체 탐색(공집합 mask = 0 제외)으로 계산한다. */
function makeTest(values: number[], s: number, note: string): ContentTestCase {
  const n = values.length;
  let count = 0;
  for (let mask = 1; mask < 1 << n; mask++) {
    let sum = 0;
    for (let i = 0; i < n; i++) if (mask & (1 << i)) sum += values[i];
    if (sum === s) count++;
  }
  return { input: `${n} ${s}\n${values.join(" ")}\n`, output: `${count}\n`, note };
}

function randomValues(n: number, seed: number, range: number): number[] {
  const rand = createRandom(seed);
  return Array.from({ length: n }, () => rand(2 * range + 1) - range);
}

const problem: ProblemContent = {
  slug: "subset-sum-count",
  title: "합이 S인 부분수열의 개수",
  difficulty: 3,
  estimatedMinutes: 35,
  languages: ["java", "c"],
  tags: {
    algorithm: ["backtracking", "recursion"],
    c: ["recursion"],
  },
  description: `정수 N개로 이루어진 수열이 있습니다. 이 수열에서 원소를 **하나 이상** 골라 만든 부분수열 중, 고른 원소의 합이 정확히 S인 것은 몇 개인지 구하세요.

- 부분수열은 원래 수열에서 몇 개의 원소를 골라 순서를 유지한 채 나열한 것입니다. 연속하지 않아도 됩니다.
- 아무것도 고르지 않은 경우(공집합)는 **세지 않습니다**. 따라서 S = 0이어도 공집합은 답에 포함되지 않습니다.
- 값이 같더라도 **위치가 다른 원소를 고르면 다른 부분수열**입니다.`,
  input: `첫째 줄에 수열의 길이 N과 목표 합 S가 공백으로 구분되어 주어집니다.

둘째 줄에 수열의 원소 N개가 공백으로 구분되어 주어집니다.`,
  output: `합이 S인, 공집합이 아닌 부분수열의 개수를 출력합니다. 그런 부분수열이 없으면 \`0\`을 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 20
- -100,000 ≤ 각 원소 ≤ 100,000
- -2,000,000 ≤ S ≤ 2,000,000`,
  examples: [
    {
      input: "5 0\n-7 -3 -2 5 8\n",
      output: "1\n",
      explanation: "(-3, -2, 5)를 고르면 합이 0이 되고, 다른 방법은 없습니다. 공집합도 합이 0이지만 세지 않습니다.",
    },
    {
      input: "3 2\n1 1 1\n",
      output: "3\n",
      explanation: "세 개의 1 중 두 개를 고르는 방법은 (1번, 2번), (1번, 3번), (2번, 3번)의 세 가지입니다. 값이 같아도 고른 위치가 다르면 다른 부분수열입니다.",
    },
  ],
  hints: [
    "각 원소는 \"고른다\"와 \"고르지 않는다\" 두 가지 선택만 있습니다. N개의 원소에 대해 이 선택을 모두 해 보면 경우의 수는 몇 가지일까요? N ≤ 20이라는 제한이 무엇을 말해 주는지 생각해 보세요.",
    "앞에서부터 원소를 하나씩 보며 선택을 내려 가면, 선택을 마친 원소의 개수와 지금까지의 합만 알면 다음 단계를 진행할 수 있습니다. 그리고 S = 0일 때 아무것도 고르지 않은 경우가 섞이지 않도록 어떻게 처리할지 정해야 합니다.",
    "재귀 함수 dfs(index, sum)을 만듭니다. index번째 원소를 더한 경우와 더하지 않은 경우로 나누어 dfs(index + 1, ...)을 두 번 호출하고, index가 N에 도달하면 sum이 S인지 확인합니다. 이렇게 세면 공집합이 포함되므로, S = 0이면 마지막에 1을 빼야 합니다.",
    "count = 0\ndfs(index, sum):\n  if index == N:\n    if sum == S: count++\n    return\n  dfs(index + 1, sum + a[index])   // 고른다\n  dfs(index + 1, sum)              // 고르지 않는다\n\ndfs(0, 0)\nif S == 0: count--   // 공집합 제외\n출력 count",
  ],
  solution: `원소마다 "고른다 / 고르지 않는다"를 결정하면 가능한 부분수열은 2^N가지이고, N ≤ 20이면 최대 약 100만 가지라서 모두 확인할 수 있습니다.

**재귀(백트래킹)**로 모든 선택을 탐색합니다.

- \`dfs(index, sum)\`: 0 ~ index-1번째 원소까지 선택을 마쳤고, 고른 원소의 합이 sum인 상태
- index번째 원소를 고르는 경우 \`dfs(index + 1, sum + a[index])\`, 고르지 않는 경우 \`dfs(index + 1, sum)\`
- index == N이면 sum == S인지 확인해 개수를 셉니다.

이 방식은 아무것도 고르지 않은 경우(공집합, 합 0)도 한 번 세므로 **S = 0이면 답에서 1을 뺍니다.** 또는 "지금까지 고른 개수"를 함께 넘겨 1개 이상일 때만 세어도 됩니다.

원소에 음수가 있어서 "합이 S를 넘으면 중단" 같은 가지치기는 쓸 수 없습니다.

**시간복잡도** O(2^N)
**공간복잡도** O(N) (재귀 깊이)

**자주 하는 실수**
- S = 0일 때 공집합을 빼지 않아 답이 1 크게 나옴
- 음수가 있는데 \`sum > S\`이면 중단하는 가지치기를 넣어 답을 놓침
- 값이 같은 원소를 중복 제거해서 위치가 다른 부분수열을 하나로 셈
- index == N이 되기 전에 sum == S를 만나자마자 세고 return해서, 뒤의 원소를 더 고르는 경우(0을 더하는 경우 등)를 놓침

**언어별 팁**
- 개수는 최대 2^20 - 1 = 1,048,575이고 합은 최대 ±2,000,000이므로 int로 충분합니다.
- C: 전역 변수 count와 배열을 두고 \`void dfs(int index, int sum)\`처럼 작성하면 간단합니다.`,
  tests: [
    makeTest([0], 0, "N = 1, 원소 0 하나 (공집합이 아닌 {0}은 셈)"),
    makeTest([5], 0, "N = 1, S = 0이지만 공집합만 가능 → 0"),
    makeTest([1, 2, 3], 100, "답이 없는 경우"),
    makeTest([-1, -2], -3, "음수 목표 합 (가지치기하면 틀림)"),
    makeTest(Array(20).fill(0), 0, "N = 20, 모두 0 → 2^20 - 1"),
    makeTest(Array(20).fill(100_000), 2_000_000, "N = 20, 원소 최댓값, S 최댓값"),
    makeTest(randomValues(20, 2718, 5), 3, "N = 20 무작위 작은 값 (답이 많음)"),
    makeTest(randomValues(20, 1414, 100_000), 0, "N = 20 무작위 큰 값, S = 0"),
  ],
};

export default problem;
