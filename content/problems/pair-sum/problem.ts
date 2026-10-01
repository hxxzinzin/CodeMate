import type { ContentTestCase, ProblemContent } from "../../types.ts";

/** 테스트 데이터 생성용 결정적 난수 (매번 같은 입력이 만들어진다) */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return (max: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % max;
  };
}

/** N = 100,000 큰 입력. 기대 출력은 정렬·투 포인터가 아닌 Set 조회로 따로 계산한다. */
function largeTest(): ContentTestCase {
  const n = 100_000;
  const k = 1_000_001;
  const rand = createRandom(20251001);
  // i번째 가격은 10i + 1 ~ 10i + 10 사이 → 모두 서로 다르고 1 ~ 1,000,000 범위
  const prices = Array.from({ length: n }, (_, i) => 10 * i + 1 + rand(10));
  for (let i = n - 1; i > 0; i--) {
    const j = rand(i + 1);
    [prices[i], prices[j]] = [prices[j], prices[i]];
  }
  const set = new Set(prices);
  let count = 0;
  for (const p of prices) {
    if (k - p > p && set.has(k - p)) count++;
  }
  return {
    input: `${n} ${k}\n${prices.join(" ")}\n`,
    output: `${count}\n`,
    note: "N = 100,000 최대 입력 (O(N²) 풀이는 시간 초과)",
  };
}

const problem: ProblemContent = {
  slug: "pair-sum",
  title: "합이 K인 두 수",
  difficulty: 2,
  estimatedMinutes: 25,
  languages: ["java", "c"],
  tags: {
    algorithm: ["two-pointer", "sorting"],
    data_structure: ["array"],
    c: ["pointer"],
  },
  description: `선물 가게에 가격이 모두 다른 상품 N개가 진열되어 있습니다. 민수는 금액이 K원인 상품권 한 장으로 상품 **두 개**를 사려고 합니다. 이 상품권은 거스름돈을 돌려주지 않기 때문에, 두 상품 가격의 합이 정확히 K원이 되도록 고르고 싶습니다.

- 같은 상품을 두 번 고를 수는 없습니다.
- 고르는 순서는 상관없습니다. 즉 (A, B)와 (B, A)는 같은 방법입니다.

가격의 합이 정확히 K원이 되는 두 상품의 조합은 모두 몇 가지인지 구하세요.`,
  input: `첫째 줄에 상품의 개수 N과 상품권 금액 K가 공백으로 구분되어 주어집니다.

둘째 줄에 N개 상품의 가격이 공백으로 구분되어 주어집니다. 가격은 정렬되어 있지 않습니다.`,
  output: `가격의 합이 정확히 K인 두 상품 조합의 개수를 출력합니다. 그런 조합이 없으면 \`0\`을 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 100,000
- 2 ≤ K ≤ 2,000,000
- 1 ≤ 각 상품의 가격 ≤ 1,000,000
- 모든 상품의 가격은 서로 다릅니다.`,
  examples: [
    {
      input: "6 10\n3 7 1 9 5 4\n",
      output: "2\n",
      explanation: "(3, 7)과 (1, 9) 두 가지입니다. 5원짜리 상품은 하나뿐이므로 (5, 5)는 만들 수 없습니다.",
    },
    {
      input: "4 100\n10 20 30 40\n",
      output: "0\n",
      explanation: "가장 비싼 두 상품을 골라도 70원이라서 100원을 만들 수 없습니다.",
    },
  ],
  hints: [
    "가격이 정렬되어 있다면 무엇이 편해질까요? 가장 싼 상품과 가장 비싼 상품의 합을 K와 비교하면 어떤 상품을 후보에서 지울 수 있을지 생각해 보세요.",
    "모든 쌍을 확인하면 N(N-1)/2번, N = 100,000일 때 약 50억 번을 비교해야 합니다. 정렬된 상태에서 두 수의 합이 K보다 작다면 작은 쪽을 키워야 하고, 크다면 큰 쪽을 줄여야 합니다.",
    "가격을 오름차순으로 정렬한 뒤, 맨 앞을 가리키는 left와 맨 뒤를 가리키는 right 두 포인터를 둡니다. 합을 K와 비교해 포인터 하나를 안쪽으로 옮기는 과정을 두 포인터가 만날 때까지 반복합니다(투 포인터).",
    "prices 정렬\nleft = 0, right = N - 1, count = 0\nwhile left < right:\n  sum = prices[left] + prices[right]\n  if sum == K: count++, left++, right--\n  else if sum < K: left++\n  else: right--\n출력 count",
  ],
  solution: `가격을 **오름차순으로 정렬**한 뒤 양 끝에서 시작하는 **투 포인터**를 사용합니다.

- \`prices[left] + prices[right] < K\`: 지금의 right는 남은 상품 중 가장 비싼데도 합이 모자랍니다. 따라서 prices[left]는 누구와 짝지어도 K가 될 수 없으므로 left를 오른쪽으로 옮깁니다.
- 합 > K: 같은 논리로 prices[right]는 버리고 right를 왼쪽으로 옮깁니다.
- 합 == K: 개수를 세고, 가격이 모두 다르므로 두 포인터를 모두 안쪽으로 옮깁니다.

각 단계에서 상품 하나가 후보에서 빠지므로 포인터 이동은 최대 N번입니다.

**시간복잡도** O(N log N) (정렬), 투 포인터 자체는 O(N)
**공간복잡도** O(N)

**자주 하는 실수**
- 이중 반복문으로 모든 쌍을 확인해 시간 초과
- 조건을 \`left <= right\`로 써서 같은 상품을 두 번 고르는 경우까지 세는 실수 (예: K = 10일 때 5 + 5)
- 합이 K일 때 포인터를 움직이지 않아 무한 루프에 빠짐
- 정렬하지 않고 투 포인터를 적용

**언어별 팁**
- Java: \`int[]\`에 \`Arrays.sort\`를 쓰면 됩니다.
- C: \`qsort\`의 비교 함수는 \`const void *\`를 받으므로 \`*(const int *)a\`처럼 형 변환한 뒤 값을 비교합니다. \`return x - y;\`는 값의 범위가 크면 오버플로가 날 수 있으니 \`(x > y) - (x < y)\` 형태가 안전합니다.`,
  tests: [
    { input: "1 2\n1\n", output: "0\n", note: "N = 1, 쌍을 만들 수 없음" },
    { input: "2 3\n2 1\n", output: "1\n", note: "N = 2 최소 쌍" },
    { input: "5 10\n5 1 2 3 4\n", output: "0\n", note: "같은 상품을 두 번 고르면 안 됨 (5 + 5)" },
    { input: "8 9\n8 1 7 2 6 3 5 4\n", output: "4\n", note: "모든 상품이 짝을 이루는 경우" },
    { input: "4 1999999\n1000000 3 999999 500000\n", output: "1\n", note: "가격 최댓값 근처" },
    { input: "3 2000000\n1000000 999999 1\n", output: "0\n", note: "K 최댓값, 답이 없음" },
    largeTest(),
  ],
};

export default problem;
