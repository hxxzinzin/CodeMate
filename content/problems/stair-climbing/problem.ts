import type { ContentTestCase, ProblemContent } from "../../types.ts";

const MOD = 1_000_000_007n;

/**
 * 기대 출력 계산용: N칸을 오르는 방법의 수는 피보나치 수 F(N+1)이다.
 * 정답 코드의 반복 DP와 독립적으로, 빠른 피보나치(fast doubling)를 BigInt로 계산한다.
 */
function fibPair(n: bigint): [bigint, bigint] {
  // [F(n), F(n+1)] mod MOD
  if (n === 0n) return [0n, 1n];
  const [a, b] = fibPair(n / 2n);
  const c = (a * ((2n * b - a + MOD) % MOD)) % MOD; // F(2k)
  const d = (a * a + b * b) % MOD; // F(2k+1)
  return n % 2n === 0n ? [c, d] : [d, (c + d) % MOD];
}

function waysTest(n: number, note: string): ContentTestCase {
  const [ways] = fibPair(BigInt(n + 1));
  return { input: `${n}\n`, output: `${ways}\n`, note };
}

const problem: ProblemContent = {
  slug: "stair-climbing",
  title: "계단 오르기 경우의 수",
  difficulty: 2,
  estimatedMinutes: 20,
  languages: ["java", "c"],
  tags: {
    algorithm: ["dp"],
  },
  description: `전망대로 올라가는 계단이 N칸 있습니다. 서준이는 한 번에 계단을 **1칸** 또는 **2칸**씩 오를 수 있습니다.

바닥에서 출발해 정확히 N번째 칸에 도착하는 방법은 모두 몇 가지일까요? 오르는 순서가 다르면 다른 방법으로 셉니다. 예를 들어 3칸을 "1칸 → 2칸"으로 오르는 것과 "2칸 → 1칸"으로 오르는 것은 서로 다른 방법입니다.

방법의 수가 매우 커질 수 있으므로 **1,000,000,007로 나눈 나머지**를 구하세요.`,
  input: `첫째 줄에 계단의 수 N이 주어집니다.`,
  output: `N번째 칸에 도착하는 방법의 수를 1,000,000,007로 나눈 나머지를 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 1,000,000`,
  examples: [
    {
      input: "3\n",
      output: "3\n",
      explanation: "1+1+1, 1+2, 2+1의 세 가지 방법이 있습니다.",
    },
    {
      input: "5\n",
      output: "8\n",
      explanation: "2칸을 한 번도 쓰지 않는 방법 1가지, 한 번 쓰는 방법 4가지(1이 세 개, 2가 하나인 순서), 두 번 쓰는 방법 3가지(1이 하나, 2가 두 개인 순서)로 모두 8가지입니다.",
    },
  ],
  hints: [
    "N번째 칸에 도착하기 직전에 서준이는 어디에 서 있었을까요? 가능한 위치는 몇 군데뿐입니다.",
    "N번째 칸에 도착하는 방법은 \"N-1번째 칸에서 1칸 오르기\"와 \"N-2번째 칸에서 2칸 오르기\"로 겹치지 않게 나눌 수 있습니다. 작은 칸의 답을 알면 큰 칸의 답을 만들 수 있다는 뜻입니다. 시작점(1칸, 2칸)의 답은 직접 세어 보세요.",
    "ways[i] = i번째 칸에 도착하는 방법의 수라고 하면 ways[i] = ways[i-1] + ways[i-2]입니다. ways[1] = 1, ways[2] = 2에서 시작해 N까지 차례로 채우는 동적 계획법(DP)을 사용하고, 더할 때마다 1,000,000,007로 나눈 나머지만 남깁니다.",
    "if N == 1: 출력 1\nprev2 = 1   // ways[1]\nprev1 = 2   // ways[2]\nfor i in 3..N:\n  cur = (prev1 + prev2) % 1000000007\n  prev2 = prev1\n  prev1 = cur\n출력 ways[N]",
  ],
  solution: `마지막 한 걸음을 기준으로 경우를 나눕니다. N번째 칸에 도착하기 직전에는 반드시 N-1번째 칸(1칸 오름) 또는 N-2번째 칸(2칸 오름)에 있었고, 이 두 경우는 겹치지 않습니다.

\`ways[i] = ways[i-1] + ways[i-2]\`, \`ways[1] = 1\`, \`ways[2] = 2\`

작은 문제의 답을 저장해 두고 큰 문제를 푸는 **동적 계획법(DP)**입니다. 값은 피보나치 수열과 같습니다. 직전 두 값만 필요하므로 배열 없이 변수 두 개로도 풀 수 있습니다.

**시간복잡도** O(N)
**공간복잡도** O(1) (변수 두 개) 또는 O(N) (배열 사용)

**자주 하는 실수**
- 나머지 연산을 마지막에 한 번만 해서 오버플로 발생 (N = 100만이면 방법의 수는 20만 자리가 넘습니다). 더할 때마다 나머지를 구해야 합니다.
- 나머지를 구하기 전의 합은 최대 약 2 × 10^9으로 int 최댓값(약 2.147 × 10^9)에 아슬아슬하게 가깝습니다. Java는 \`long\`, C는 \`long long\`을 쓰면 안전합니다.
- 재귀로 \`f(n-1) + f(n-2)\`를 메모 없이 호출하면 같은 계산이 기하급수적으로 반복되어 시간 초과가 나고, N이 크면 재귀 깊이 때문에 스택 오버플로도 생깁니다.
- N = 1일 때 ways[2]에 접근하는 경계 실수`,
  tests: [
    { input: "1\n", output: "1\n", note: "N = 1 최소 입력" },
    { input: "2\n", output: "2\n", note: "N = 2 (1+1, 2)" },
    { input: "10\n", output: "89\n", note: "작은 N" },
    waysTest(44, "N = 44, 나머지 연산이 처음 필요해지는 구간"),
    waysTest(90, "N = 90, 실제 값이 long 범위 근처"),
    waysTest(1_000_000, "N = 1,000,000 최대 입력"),
  ],
};

export default problem;
