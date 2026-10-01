import type { ProblemContent } from "../../types.ts";

/** 시드가 같으면 항상 같은 수열을 만든다 (테스트 입력 고정용). */
function randomSizes(count: number, max: number, seed: number): number[] {
  let x = seed;
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    x = (x * 48271) % 2147483647;
    out.push((x % max) + 1);
  }
  return out;
}

/**
 * 정답 코드와 독립적인 기대값 계산: 정렬된 배열과 "합쳐서 생긴 묶음" 큐 두 개를 쓰는 방법.
 * 새로 생기는 묶음의 크기는 점점 커지므로 두 번째 큐도 항상 정렬 상태가 유지된다.
 */
function twoQueueCost(sizes: number[]): number {
  const a = [...sizes].sort((p, q) => p - q);
  const b: number[] = [];
  let i = 0;
  let j = 0;
  let total = 0;
  const takeMin = (): number => {
    if (j >= b.length || (i < a.length && a[i] <= b[j])) return a[i++];
    return b[j++];
  };
  for (let step = 0; step < sizes.length - 1; step++) {
    const merged = takeMin() + takeMin();
    total += merged;
    b.push(merged);
  }
  return total;
}

function toInput(sizes: number[]): string {
  return `${sizes.length}\n${sizes.join(" ")}\n`;
}

const randomPiles = randomSizes(100000, 1000000, 7);

const problem: ProblemContent = {
  slug: "merge-card-piles",
  title: "카드 묶음 합치기",
  difficulty: 3,
  estimatedMinutes: 40,
  languages: ["java"],
  tags: {
    algorithm: ["greedy"],
    data_structure: ["heap", "priority-queue"],
    java: ["collection"],
  },
  description: `카드 게임 대회를 준비하는 운영진이 크기가 제각각인 카드 묶음 N개를 하나로 모으려고 합니다.

한 번에 **아무 두 묶음**이나 골라 하나로 합칠 수 있습니다. 카드 a장짜리 묶음과 b장짜리 묶음을 합치면 a + b장짜리 묶음이 하나 생기고, 카드를 한 장씩 세어 확인해야 하므로 **a + b만큼의 비용**이 듭니다.

N개의 묶음이 하나가 될 때까지 합치기를 반복할 때, 드는 **비용의 총합의 최솟값**을 구하세요.`,
  input: `첫째 줄에 카드 묶음의 수 N이 주어집니다.

둘째 줄에 각 묶음의 카드 수 N개가 공백으로 구분되어 주어집니다.`,
  output: `모든 묶음을 하나로 합치는 데 드는 비용 총합의 최솟값을 출력합니다. 묶음이 처음부터 하나뿐이면 합칠 필요가 없으므로 \`0\`을 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 100,000
- 1 ≤ 각 묶음의 카드 수 ≤ 1,000,000
- 서로 이웃한 묶음이 아니어도 합칠 수 있습니다.
- 답은 32비트 정수 범위를 넘을 수 있습니다.`,
  examples: [
    {
      input: "3\n10 20 40\n",
      output: "100\n",
      explanation: "10장과 20장을 합치면 비용 30, 생긴 30장 묶음과 40장을 합치면 비용 70으로 총 100입니다.",
    },
    {
      input: "5\n5 5 5 5 30\n",
      output: "90\n",
      explanation:
        "5+5(10), 5+5(10), 10+10(20), 20+30(50)으로 합치면 총 90입니다. 작은 것부터 한 묶음에 차례로 쌓아 나가면 10, 15, 20, 50으로 95가 되어 더 비쌉니다.",
    },
  ],
  hints: [
    "어떤 카드는 여러 번 합쳐질수록 비용에 여러 번 더해집니다. 그렇다면 여러 번 합쳐져도 부담이 적은 묶음은 큰 묶음일까요, 작은 묶음일까요?",
    "매번 \"지금 남아 있는 묶음 중\" 가장 작은 두 개를 합치는 것을 생각해보세요. 합쳐서 새로 생긴 묶음도 다시 후보가 된다는 점에 주의하세요. 매번 정렬을 다시 하면 너무 느립니다.",
    "최솟값을 빠르게 꺼내고 새 값을 빠르게 넣을 수 있는 우선순위 큐(최소 힙)를 사용합니다. 모든 묶음을 넣고, 두 개를 꺼내 합친 값을 비용에 더한 뒤 다시 넣는 일을 묶음이 하나 남을 때까지 반복합니다. 합계는 long으로 관리하세요.",
    "pq = 최소 힙, 모든 묶음 크기를 add\ntotal = 0 (long)\nwhile pq.size() > 1:\n  a = pq.poll()\n  b = pq.poll()\n  total += a + b\n  pq.add(a + b)\n출력 total",
  ],
  solution: `매번 **가장 작은 두 묶음을 합치는 그리디**가 최적입니다. (허프만 코딩과 같은 원리입니다.)

어떤 묶음의 카드는 합쳐질 때마다 비용에 한 번씩 더해집니다. 그러니 큰 묶음은 되도록 늦게, 적게 합쳐지는 것이 유리하고, 작은 묶음을 먼저 합치는 것이 이득입니다. 이때 **새로 만들어진 묶음도 다시 후보에 넣어야** 합니다. 예제 2에서 한 묶음에 차례로 쌓기만 하면 95가 되지만, 5+5를 두 번 따로 만든 뒤 합치면 90이 됩니다.

1. 모든 묶음 크기를 최소 힙(우선순위 큐)에 넣습니다.
2. 힙에 원소가 2개 이상인 동안 가장 작은 두 값을 꺼내 합치고, 그 합을 비용에 더한 뒤 다시 힙에 넣습니다.
3. 원소가 하나 남으면 누적 비용을 출력합니다. N = 1이면 반복이 한 번도 일어나지 않아 0이 됩니다.

**시간복잡도** O(N log N) — 힙 연산 약 3N번
**공간복잡도** O(N)

**자주 하는 실수**
- 처음에 한 번만 정렬하고 앞에서부터 차례로 더하기 (새로 생긴 묶음이 다른 묶음보다 커질 수 있음)
- 비용 합계를 int로 두어 오버플로 — 묶음 하나의 크기만 해도 최대 1,000,000 × 100,000 = 1,000억까지 커집니다. 힙에 넣는 값도 long이어야 합니다.
- 매번 배열을 다시 정렬해서 O(N² log N)으로 시간 초과

**Java 팁**
- \`PriorityQueue<Long>\`은 기본이 최소 힙입니다. 최대 힙이 필요할 때는 \`new PriorityQueue<>(Comparator.reverseOrder())\`를 씁니다.
- \`pq.poll() + pq.poll()\`처럼 쓰면 Long이 자동으로 언박싱되어 long으로 계산됩니다. 합을 다시 넣을 때 int로 바꾸지 않도록 주의하세요.
- 입력이 한 줄에 10만 개이므로 \`BufferedReader\`와 \`StringTokenizer\`로 읽으세요.`,
  tests: [
    { input: "1\n500\n", output: "0\n", note: "N = 1, 합칠 필요 없음" },
    { input: "2\n1000000 1000000\n", output: "2000000\n", note: "N = 2, 최대 크기 묶음" },
    { input: "3\n1 1 1\n", output: "5\n", note: "모두 같은 크기" },
    { input: "6\n3 8 2 9 1 7\n", output: `${twoQueueCost([3, 8, 2, 9, 1, 7])}\n`, note: "정렬되지 않은 입력" },
    {
      input: toInput(Array.from({ length: 65536 }, () => 1000000)),
      output: `${16 * 65536 * 1000000}\n`,
      note: "같은 크기 2^16개, int 범위를 넘는 답",
    },
    { input: toInput(randomPiles), output: `${twoQueueCost(randomPiles)}\n`, note: "N = 100,000 최대 입력" },
  ],
};

export default problem;
