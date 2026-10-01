import type { ContentTestCase, ProblemContent } from "../../types.ts";

/** 테스트 데이터 생성용 결정적 난수 (매번 같은 입력이 만들어진다) */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return (max: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % max;
  };
}

/**
 * 기대 출력은 스택이 아닌 단순 탐색(오른쪽으로 하나씩 확인)으로 계산한다.
 * 무작위 입력에서는 대부분 금방 더 큰 값을 만나므로 큰 입력에서도 충분히 빠르다.
 */
function naive(heights: number[]): number[] {
  return heights.map((h, i) => {
    for (let j = i + 1; j < heights.length; j++) {
      if (heights[j] > h) return heights[j];
    }
    return -1;
  });
}

/**
 * 높이 범위가 작을 때(1 ~ max) 쓰는 독립 계산: 오른쪽부터 보며 높이별로 가장 가까운 다음 위치를 기억하고,
 * 자기보다 높은 높이들 중 가장 가까운 위치의 높이를 답으로 고른다. O(N × max)
 */
function smallRange(heights: number[], max: number): number[] {
  const nearest = new Array<number>(max + 1).fill(Infinity);
  const answer = new Array<number>(heights.length);
  for (let i = heights.length - 1; i >= 0; i--) {
    let bestPos = Infinity;
    for (let v = heights[i] + 1; v <= max; v++) bestPos = Math.min(bestPos, nearest[v]);
    answer[i] = bestPos === Infinity ? -1 : heights[bestPos];
    nearest[heights[i]] = i;
  }
  return answer;
}

function makeTest(heights: number[], note: string, answer = naive(heights)): ContentTestCase {
  return {
    input: `${heights.length}\n${heights.join(" ")}\n`,
    output: `${answer.join(" ")}\n`,
    note,
  };
}

function randomHeights(n: number, seed: number, max: number): number[] {
  const rand = createRandom(seed);
  return Array.from({ length: n }, () => rand(max) + 1);
}

/** 엄격히 감소하는 N = 500,000 입력: 답은 모두 -1 (단순 탐색이 O(N²)이 되는 최악의 경우) */
function decreasingTest(): ContentTestCase {
  const n = 500_000;
  const heights = Array.from({ length: n }, (_, i) => 1_000_000_000 - i);
  return makeTest(heights, "N = 500,000 감소 수열, 모두 -1 (O(N²) 풀이는 시간 초과)", Array(n).fill(-1));
}

const problem: ProblemContent = {
  slug: "next-greater",
  title: "오른쪽에서 처음 만나는 큰 수",
  difficulty: 3,
  estimatedMinutes: 35,
  languages: ["java", "c"],
  tags: {
    data_structure: ["stack", "array"],
  },
  description: `해안 도로를 따라 건물 N채가 왼쪽부터 한 줄로 서 있습니다. 각 건물 옥상에서 오른쪽을 바라볼 때, **처음으로 만나는 자기보다 높은 건물**의 높이를 알고 싶습니다.

- "자기보다 높은"은 높이가 엄격히 큰 것을 뜻합니다. 높이가 같은 건물은 해당하지 않습니다.
- 오른쪽에 자기보다 높은 건물이 하나도 없다면 답은 \`-1\`입니다.

모든 건물에 대해 답을 구하세요.`,
  input: `첫째 줄에 건물의 수 N이 주어집니다.

둘째 줄에 왼쪽 건물부터 차례대로 N개의 높이가 공백으로 구분되어 주어집니다.`,
  output: `첫째 줄에 왼쪽 건물부터 차례대로 각 건물의 답 N개를 공백 하나로 구분해 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 500,000
- 1 ≤ 건물의 높이 ≤ 1,000,000,000`,
  examples: [
    {
      input: "5\n3 5 2 7 4\n",
      output: "5 7 7 -1 -1\n",
      explanation: "3의 오른쪽에서 처음 만나는 더 높은 건물은 5, 5와 2는 7입니다. 7과 4는 오른쪽에 더 높은 건물이 없습니다.",
    },
    {
      input: "4\n4 4 2 4\n",
      output: "-1 -1 4 -1\n",
      explanation: "높이가 같은 건물은 \"더 높은\" 건물이 아니므로 4인 건물들의 답은 모두 -1입니다. 2의 오른쪽에서는 4를 처음 만납니다.",
    },
  ],
  hints: [
    "건물마다 오른쪽을 하나씩 살펴보면 최악의 경우(높이가 계속 낮아지는 경우) 몇 번 비교하게 될까요? 아직 \"답을 찾지 못한\" 건물들이 어떤 순서로 쌓여 있는지 생각해 보세요.",
    "왼쪽부터 건물을 보면서 답을 못 찾은 건물들을 모아 둔다고 해 봅시다. 이 건물들의 높이는 항상 어떤 순서로 정렬되어 있을까요? 새 건물이 나타났을 때 답이 정해지는 건물은 어느 쪽부터일까요?",
    "스택에 \"아직 답을 못 찾은 건물의 인덱스\"를 저장합니다. 새 건물 i가 나오면, 스택 맨 위 건물이 i보다 낮은 동안 계속 꺼내면서 그 건물의 답을 높이[i]로 정합니다. 그 다음 i를 스택에 넣습니다. 끝까지 스택에 남은 건물의 답은 -1입니다. 각 건물은 한 번 들어가고 한 번 나오므로 전체 O(N)입니다.",
    "answer 배열을 모두 -1로 초기화\nstack = 빈 스택 (인덱스 저장)\nfor i in 0..N-1:\n  while stack이 비어 있지 않고 h[stack.top] < h[i]:\n    answer[stack.pop()] = h[i]\n  stack.push(i)\nanswer를 공백으로 구분해 출력",
  ],
  solution: `건물마다 오른쪽을 직접 살피면 높이가 계속 낮아지는 입력에서 O(N²) = 약 1,250억 번 비교가 필요합니다.

**스택**으로 "아직 오른쪽에 더 높은 건물을 만나지 못한 건물"의 인덱스를 관리합니다.

1. 왼쪽부터 건물 i를 봅니다.
2. 스택 맨 위 건물이 i보다 **낮으면**, 그 건물이 오른쪽에서 처음 만나는 더 높은 건물이 바로 i입니다. 답을 기록하고 꺼냅니다. 이를 더 이상 꺼낼 수 없을 때까지 반복합니다.
3. i를 스택에 넣습니다.
4. 끝까지 남은 건물의 답은 -1입니다.

스택 안의 높이는 아래에서 위로 갈수록 같거나 낮아지는(단조 감소) 상태가 유지되므로, 맨 위만 확인해도 됩니다. 이런 스택을 **단조 스택(monotonic stack)**이라고 합니다.

**시간복잡도** O(N) — 각 건물은 스택에 한 번 들어가고 최대 한 번 나옵니다.
**공간복잡도** O(N)

**자주 하는 실수**
- \`<=\`로 비교해 높이가 같은 건물을 답으로 기록 (예제 2)
- 스택에 높이를 저장해서 답을 어느 건물에 기록할지 알 수 없게 됨 → 인덱스를 저장해야 합니다.
- 스택에 남은 건물의 답을 -1로 처리하지 않음

**언어별 팁**
- Java: \`Stack\` 대신 \`ArrayDeque\` 또는 \`int[]\` 배열과 top 변수로 스택을 직접 구현하면 빠릅니다. 출력은 \`StringBuilder\`로 모아서 한 번에 하세요.
- C: 크기 N인 정적 배열과 top 변수로 스택을 만들면 충분합니다.`,
  tests: [
    makeTest([7], "N = 1, 답은 -1"),
    makeTest([1, 2, 3, 4, 5], "증가 수열 (바로 오른쪽이 답)"),
    makeTest([9, 9, 9, 9], "모든 높이가 같음 (모두 -1)"),
    makeTest([2, 1, 1, 1, 3, 1000000000, 1], "여러 건물의 답이 한꺼번에 정해짐, 높이 최댓값"),
    makeTest([5, 1, 4, 2, 3, 6], "스택에서 여러 번 꺼내는 경우"),
    makeTest(randomHeights(500_000, 31337, 1_000_000_000), "N = 500,000 무작위"),
    (() => {
      const heights = randomHeights(500_000, 4, 10);
      return makeTest(heights, "N = 500,000, 높이 1~10 (같은 높이가 매우 많음)", smallRange(heights, 10));
    })(),
    decreasingTest(),
  ],
};

export default problem;
