import type { ContentTestCase, ProblemContent } from "../../types.ts";

/** 테스트 데이터 생성용 결정적 난수 (매번 같은 입력이 만들어진다) */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return (max: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % max;
  };
}

/** N = M = 100,000, 중복이 많은 정렬 배열. 기대 출력은 이분 탐색이 아닌 Map(값 → 처음 위치)으로 계산한다. */
function largeTest(): ContentTestCase {
  const n = 100_000;
  const m = 100_000;
  const rand = createRandom(4242);
  const values: number[] = [];
  let current = -1_000_000_000;
  for (let i = 0; i < n; i++) {
    // 절반 정도는 직전 값과 같게 만들어 중복을 섞는다
    if (i > 0 && rand(2) === 0) current += rand(3) * 10;
    values.push(current);
  }
  const firstIndex = new Map<number, number>();
  values.forEach((v, i) => {
    if (!firstIndex.has(v)) firstIndex.set(v, i + 1);
  });
  const queries = Array.from({ length: m }, (_, i) => {
    if (i % 3 === 0) return values[rand(n)]; // 반드시 있는 값
    return current - rand(current + 1_000_000_001) + rand(2) * 5; // 대부분 없는 값
  });
  return {
    input: `${n}\n${values.join(" ")}\n${m}\n${queries.join(" ")}\n`,
    output: queries.map((x) => `${firstIndex.get(x) ?? -1}`).join("\n") + "\n",
    note: "N = M = 100,000 최대 입력, 중복이 많은 배열 (질의마다 순차 탐색하면 시간 초과)",
  };
}

const problem: ProblemContent = {
  slug: "sorted-search",
  title: "정렬된 배열에서 찾기",
  difficulty: 2,
  estimatedMinutes: 25,
  languages: ["java", "c"],
  tags: {
    algorithm: ["binary-search"],
    data_structure: ["array"],
    c: ["function"],
  },
  description: `도서관 서가에 책 N권이 청구 번호 순서대로 꽂혀 있습니다. 왼쪽 끝 책이 1번 위치이고, 오른쪽으로 갈수록 청구 번호가 같거나 커집니다. 같은 책이 여러 권 있는 경우도 있어서 같은 청구 번호가 연달아 나올 수 있습니다.

사서는 청구 번호 M개를 하나씩 찾아보려고 합니다. 각 청구 번호에 대해, 그 번호의 책이 **처음** 나오는 위치를 구하세요. 서가에 그 번호의 책이 없다면 \`-1\`입니다.`,
  input: `첫째 줄에 책의 수 N이 주어집니다.

둘째 줄에 N권의 청구 번호가 왼쪽부터 차례대로 공백으로 구분되어 주어집니다. 청구 번호는 오름차순(같은 값이 연속될 수 있음)으로 정렬되어 있습니다.

셋째 줄에 찾을 청구 번호의 수 M이 주어집니다.

넷째 줄에 찾을 청구 번호 M개가 공백으로 구분되어 주어집니다.`,
  output: `찾을 청구 번호가 주어진 순서대로, 한 줄에 하나씩 그 번호의 책이 처음 나오는 위치(1부터 시작)를 출력합니다. 없으면 \`-1\`을 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 100,000
- 1 ≤ M ≤ 100,000
- -1,000,000,000 ≤ 청구 번호 ≤ 1,000,000,000
- 서가의 청구 번호는 오름차순(비내림차순)으로 정렬되어 있습니다.`,
  examples: [
    {
      input: "6\n1 3 3 3 7 9\n4\n3 7 4 1\n",
      output: "2\n5\n-1\n1\n",
      explanation: "3번 책은 2, 3, 4번 위치에 있으므로 처음 위치인 2를 출력합니다. 7은 5번 위치, 1은 1번 위치에 있고, 4는 서가에 없습니다.",
    },
    {
      input: "3\n-5 0 5\n3\n10 -10 0\n",
      output: "-1\n-1\n2\n",
      explanation: "10은 가장 큰 값보다 크고 -10은 가장 작은 값보다 작아서 찾을 수 없습니다. 0은 2번 위치에 있습니다.",
    },
  ],
  hints: [
    "배열이 정렬되어 있다는 사실을 어떻게 활용할 수 있을까요? 가운데 책 하나만 보고도 찾는 번호가 왼쪽 절반에 있는지 오른쪽 절반에 있는지 알 수 있지 않을까요?",
    "앞에서부터 차례로 찾으면 질문 하나에 최대 N번, 전체 100억 번까지 비교하게 됩니다. 또 같은 번호가 여러 개 있을 때는 그중 하나를 찾는 것이 아니라 가장 왼쪽 위치를 찾아야 합니다.",
    "이분 탐색으로 \"값이 x 이상인 첫 위치\"(lower bound)를 찾습니다. 가운데 값이 x보다 작으면 오른쪽 절반을, 아니면 가운데를 포함한 왼쪽 절반을 남깁니다. 탐색이 끝난 위치의 값이 x와 같으면 그 위치가 답이고, 범위를 벗어났거나 값이 다르면 -1입니다.",
    "lowerBound(arr, x):\n  lo = 0, hi = N        // 답은 [lo, hi) 범위 안에 있음\n  while lo < hi:\n    mid = (lo + hi) / 2\n    if arr[mid] < x: lo = mid + 1\n    else: hi = mid\n  return lo\n\nidx = lowerBound(arr, x)\n출력 (idx < N && arr[idx] == x) ? idx + 1 : -1",
  ],
  solution: `질문마다 순차 탐색하면 O(N × M)이라 최대 100억 번 비교로 시간 초과입니다. 배열이 정렬되어 있으므로 **이분 탐색**을 씁니다.

같은 값이 여러 번 나올 수 있으므로 "x와 같은 값을 아무거나" 찾으면 안 되고, **x 이상인 값이 처음 나오는 위치(lower bound)**를 구해야 합니다.

1. 탐색 범위를 \`[lo, hi) = [0, N)\`으로 둡니다.
2. \`arr[mid] < x\`이면 mid까지는 모두 x보다 작으므로 \`lo = mid + 1\`.
3. 그렇지 않으면 mid가 답일 수도 있으므로 \`hi = mid\`.
4. 끝나면 lo가 x 이상인 첫 위치입니다. \`lo < N\`이고 \`arr[lo] == x\`이면 \`lo + 1\`(1번부터 세므로), 아니면 \`-1\`.

**시간복잡도** O(M log N)
**공간복잡도** O(N)

**자주 하는 실수**
- \`arr[mid] == x\`를 찾자마자 반환해서 중복 중 가장 왼쪽이 아닌 위치를 출력
- x가 모든 값보다 크면 lo = N이 되는데, 이때 \`arr[lo]\`에 접근해 배열 범위를 벗어남
- 위치를 0부터 출력 (문제는 1부터)
- \`lo <= hi\`, \`hi = mid - 1\` 같은 다른 방식의 경계와 섞어 써서 무한 루프 발생

**언어별 팁**
- Java: \`Arrays.binarySearch\`는 중복이 있을 때 어느 위치를 반환할지 보장하지 않으므로 이 문제에는 맞지 않습니다.
- C: lower bound를 \`int lower_bound(const int *arr, int n, int x)\` 같은 함수로 분리하면 main이 간결해집니다.`,
  tests: [
    { input: "1\n5\n2\n5 6\n", output: "1\n-1\n", note: "N = 1, 있는 값과 없는 값" },
    { input: "5\n2 2 2 2 2\n3\n2 1 3\n", output: "1\n-1\n-1\n", note: "모든 값이 같음 (가장 왼쪽 위치)" },
    {
      input: "4\n-1000000000 0 0 1000000000\n5\n1000000000 -1000000000 999999999 -999999999 0\n",
      output: "4\n1\n-1\n-1\n2\n",
      note: "값의 최솟값·최댓값, 마지막 위치",
    },
    { input: "3\n1 2 3\n2\n4 0\n", output: "-1\n-1\n", note: "모든 값보다 크거나 작은 값 (범위 밖 접근 주의)" },
    largeTest(),
  ],
};

export default problem;
