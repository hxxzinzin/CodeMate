import type { ContentTestCase, ProblemContent } from "../../types.ts";

/** 테스트 데이터 생성용 결정적 난수 (매번 같은 입력이 만들어진다) */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return (max: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % max;
  };
}

/** 기대 출력은 슬라이딩 윈도우가 아닌 누적 합 배열로 따로 계산한다. */
function expected(values: number[], k: number): string {
  const prefix = [0];
  for (const v of values) prefix.push(prefix[prefix.length - 1] + v);
  let bestSum = -Infinity;
  let bestDay = 0;
  for (let start = 1; start + k - 1 <= values.length; start++) {
    const sum = prefix[start + k - 1] - prefix[start - 1];
    if (sum > bestSum) {
      bestSum = sum;
      bestDay = start;
    }
  }
  return `${bestSum} ${bestDay}\n`;
}

function makeTest(values: number[], k: number, note: string): ContentTestCase {
  return { input: `${values.length} ${k}\n${values.join(" ")}\n`, output: expected(values, k), note };
}

function randomValues(n: number, seed: number, range: number): number[] {
  const rand = createRandom(seed);
  return Array.from({ length: n }, () => rand(2 * range + 1) - range);
}

const problem: ProblemContent = {
  slug: "max-k-window",
  title: "연속 K일의 최대 합",
  difficulty: 3,
  estimatedMinutes: 30,
  languages: ["java", "c"],
  tags: {
    algorithm: ["sliding-window"],
    data_structure: ["array"],
  },
  description: `푸드트럭을 운영하는 하은이는 N일 동안의 하루 순이익을 기록했습니다. 이익이 난 날은 양수, 손해를 본 날은 음수입니다.

하은이는 홍보 자료에 "가장 장사가 잘된 연속 K일"을 소개하려고 합니다. 연속한 K일의 순이익 합이 가장 큰 구간을 찾아, 그 **합**과 구간이 **시작하는 날**을 구하세요. 날짜는 1일부터 N일까지 번호가 붙어 있습니다.

합이 가장 큰 구간이 여러 개라면 **가장 먼저 시작하는 구간**을 고릅니다.`,
  input: `첫째 줄에 기록한 날의 수 N과 구간의 길이 K가 공백으로 구분되어 주어집니다.

둘째 줄에 1일부터 N일까지의 순이익이 공백으로 구분되어 주어집니다.`,
  output: `연속 K일의 순이익 합의 최댓값과 그 구간의 시작일을 공백 하나로 구분해 한 줄에 출력합니다.`,
  constraints: `- 1 ≤ K ≤ N ≤ 100,000
- -10,000 ≤ 하루 순이익 ≤ 10,000`,
  examples: [
    {
      input: "7 3\n2 -1 4 3 -2 5 1\n",
      output: "6 2\n",
      explanation: "3일 구간의 합은 시작일 순서대로 5, 6, 5, 6, 4입니다. 최댓값 6이 2일과 4일에 시작하는 구간에서 나오므로 더 먼저 시작하는 2일을 출력합니다.",
    },
    {
      input: "4 2\n-5 -3 -8 -1\n",
      output: "-8 1\n",
      explanation: "2일 구간의 합은 -8, -11, -9입니다. 모든 합이 음수이므로 최댓값은 -8이고, 1일에 시작합니다.",
    },
  ],
  hints: [
    "1일부터 시작하는 K일 구간과 2일부터 시작하는 K일 구간을 비교해 보세요. 두 구간은 얼마나 겹치고, 실제로 달라지는 날은 며칠일까요?",
    "구간마다 K개를 새로 더하면 O(N × K)로, N = 100,000, K = 50,000이면 약 25억 번의 덧셈이 필요합니다. 또 모든 날이 손해일 수 있으므로 최댓값의 초깃값을 0으로 두면 안 되고, 동점일 때 시작일이 바뀌지 않도록 비교 조건에도 주의해야 합니다.",
    "슬라이딩 윈도우를 사용합니다. 먼저 첫 K일의 합을 구한 뒤, 구간을 한 칸 오른쪽으로 밀 때마다 새로 들어오는 날의 값을 더하고 빠지는 날의 값을 뺍니다. 새 합이 지금까지의 최댓값보다 \"엄격히 클 때만\" 최댓값과 시작일을 갱신합니다.",
    "sum = a[1] + ... + a[K]\nbest = sum, bestDay = 1\nfor i in K+1..N:\n  sum = sum + a[i] - a[i-K]   // i-K일이 빠지고 i일이 들어옴\n  if sum > best:                // 같을 때는 갱신하지 않음\n    best = sum\n    bestDay = i - K + 1\n출력 best, bestDay",
  ],
  solution: `길이 K인 구간을 한 칸 밀면 맨 앞의 하루가 빠지고 새로운 하루가 들어올 뿐, 나머지 K-1일은 그대로입니다. 그래서 합을 처음부터 다시 구하지 않고 \`sum += a[i] - a[i-K]\`로 O(1)에 갱신할 수 있습니다(**슬라이딩 윈도우**).

1. 첫 K일의 합을 구해 최댓값과 시작일(1)의 초깃값으로 둡니다.
2. i = K+1부터 N까지 구간을 한 칸씩 밀며 합을 갱신합니다. 이때 구간의 시작일은 i - K + 1입니다.
3. 새 합이 최댓값보다 **엄격히 클 때만** 갱신하면, 동점일 때 먼저 시작한 구간이 자연스럽게 남습니다.

**시간복잡도** O(N)
**공간복잡도** O(N) (입력 저장)

**자주 하는 실수**
- 최댓값의 초깃값을 0으로 두어, 모든 합이 음수일 때 0을 출력
- \`>=\`로 비교해 동점일 때 나중 구간의 시작일을 출력
- 시작일을 0부터 세거나 구간의 끝 날짜를 출력하는 인덱스 실수
- K = N이면 구간이 하나뿐이라 반복문이 한 번도 돌지 않는데, 이때도 첫 구간이 답으로 출력되어야 합니다.

합의 절댓값은 최대 100,000 × 10,000 = 10^9으로 int 범위 안이지만, 제한이 조금만 커져도 넘칠 수 있으니 습관적으로 범위를 계산해 보세요.`,
  tests: [
    makeTest([-10000], 1, "N = K = 1 최소 입력, 음수 하나"),
    makeTest([1, 2, 3, 4, 5], 5, "K = N, 구간이 하나뿐"),
    makeTest([0, 0, 0, 0, 0], 2, "모든 구간이 동점이면 1일"),
    makeTest([1, 1, 1, 1, 5, 5], 2, "최대 구간이 맨 끝"),
    makeTest([3, -1, -1, 3, 0, 0], 1, "K = 1, 최댓값이 여러 곳"),
    makeTest(Array(100_000).fill(10_000), 100_000, "N = K = 100,000, 합 10^9"),
    makeTest(randomValues(100_000, 2024, 10_000), 1_000, "N = 100,000 무작위, K = 1,000"),
    makeTest(randomValues(100_000, 77, 3), 50_000, "N = 100,000, K = 50,000 (구간마다 다시 더하면 시간 초과), 동점이 많음"),
  ],
};

export default problem;
