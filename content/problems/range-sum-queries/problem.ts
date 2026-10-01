import type { ContentTestCase, ProblemContent } from "../../types.ts";

/** 테스트 데이터 생성용 결정적 난수 (매번 같은 입력이 만들어진다) */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return (max: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % max;
  };
}

function randomQuery(rand: (max: number) => number, n: number): [number, number] {
  const a = rand(n) + 1;
  const b = rand(n) + 1;
  return a <= b ? [a, b] : [b, a];
}

/** N = Q = 100,000, 모든 값이 1,000,000. 기대 출력은 (r - l + 1) × 1,000,000 공식으로 계산한다. */
function largeUniformTest(): ContentTestCase {
  const n = 100_000;
  const q = 100_000;
  const value = 1_000_000;
  const rand = createRandom(7);
  const queries: [number, number][] = [[1, n]];
  while (queries.length < q) queries.push(randomQuery(rand, n));
  return {
    input: `${n} ${q}\n${Array(n).fill(value).join(" ")}\n${queries.map(([l, r]) => `${l} ${r}`).join("\n")}\n`,
    output: queries.map(([l, r]) => `${(r - l + 1) * value}`).join("\n") + "\n",
    note: "N = Q = 100,000 최대 입력, 합이 10^11까지 커짐 (int 오버플로, 매번 더하면 시간 초과)",
  };
}

/** 음수가 섞인 중간 크기 입력. 기대 출력은 질의마다 직접 더해서 계산한다. */
function randomTest(): ContentTestCase {
  const n = 2_000;
  const q = 2_000;
  const rand = createRandom(31);
  const values = Array.from({ length: n }, () => rand(2_000_001) - 1_000_000);
  const queries = Array.from({ length: q }, () => randomQuery(rand, n));
  const answers = queries.map(([l, r]) => {
    let sum = 0;
    for (let i = l - 1; i < r; i++) sum += values[i];
    return sum;
  });
  return {
    input: `${n} ${q}\n${values.join(" ")}\n${queries.map(([l, r]) => `${l} ${r}`).join("\n")}\n`,
    output: answers.join("\n") + "\n",
    note: "양수·음수가 섞인 무작위 입력",
  };
}

const problem: ProblemContent = {
  slug: "range-sum-queries",
  title: "구간 합 구하기",
  difficulty: 2,
  estimatedMinutes: 25,
  languages: ["java", "c"],
  tags: {
    algorithm: ["prefix-sum"],
    data_structure: ["array"],
  },
  description: `작은 카페를 운영하는 지은이는 N일 동안 매일의 손익을 장부에 적어 두었습니다. 이익을 본 날은 양수, 손해를 본 날은 음수로 기록했습니다.

세무 상담을 앞두고 지은이는 "l번째 날부터 r번째 날까지의 손익 합계는 얼마인가?"라는 질문 Q개에 답해야 합니다. 날짜는 1번부터 N번까지 번호가 붙어 있고, l일과 r일도 구간에 포함됩니다.

각 질문에 대한 손익 합계를 구하세요.`,
  input: `첫째 줄에 기록한 날의 수 N과 질문의 수 Q가 공백으로 구분되어 주어집니다.

둘째 줄에 1일부터 N일까지의 손익이 공백으로 구분되어 주어집니다.

셋째 줄부터 Q개의 줄에 걸쳐 질문을 나타내는 두 정수 l, r이 공백으로 구분되어 주어집니다.`,
  output: `질문이 주어진 순서대로, 한 줄에 하나씩 l일부터 r일까지의 손익 합계를 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 100,000
- 1 ≤ Q ≤ 100,000
- -1,000,000 ≤ 각 날의 손익 ≤ 1,000,000
- 1 ≤ l ≤ r ≤ N`,
  examples: [
    {
      input: "5 3\n3 -2 5 1 -4\n1 3\n2 4\n5 5\n",
      output: "6\n4\n-4\n",
      explanation: "1~3일은 3 + (-2) + 5 = 6, 2~4일은 (-2) + 5 + 1 = 4, 5일 하루는 -4입니다.",
    },
    {
      input: "4 2\n1000000 1000000 1000000 -1000000\n1 3\n1 4\n",
      output: "3000000\n2000000\n",
      explanation: "1~3일은 1,000,000을 세 번 더한 3,000,000이고, 4일까지 포함하면 1,000,000이 줄어 2,000,000입니다.",
    },
  ],
  hints: [
    "질문마다 l부터 r까지 직접 더하면 최악의 경우 몇 번 더하게 될까요? 여러 질문이 같은 구간을 반복해서 더하고 있지는 않은지 생각해 보세요.",
    "1일부터 i일까지의 합을 미리 알고 있다면, l일부터 r일까지의 합은 그 값들로 어떻게 표현할 수 있을까요? 그리고 합의 최댓값이 int 범위(약 21억) 안에 들어가는지도 확인해 보세요.",
    "누적 합 배열 prefix를 만듭니다. prefix[0] = 0, prefix[i] = prefix[i-1] + a[i]로 정의하면 구간 합은 prefix[r] - prefix[l-1]이 되어 질문 하나를 O(1)에 답할 수 있습니다. 합이 최대 10^11이므로 64비트 정수를 써야 합니다.",
    "prefix[0] = 0\nfor i in 1..N:\n  prefix[i] = prefix[i-1] + a[i]   // 64비트 정수\nfor 각 질문 (l, r):\n  출력 prefix[r] - prefix[l-1]",
  ],
  solution: `질문마다 직접 더하면 질문 하나에 최대 N번, 전체 최대 N × Q = 100억 번의 덧셈이 필요해 시간 초과가 납니다.

**누적 합(prefix sum)**을 한 번만 계산해 두면 모든 질문에 O(1)로 답할 수 있습니다.

- \`prefix[0] = 0\`, \`prefix[i] = a[1] + a[2] + … + a[i]\`
- l일부터 r일까지의 합 = \`prefix[r] - prefix[l-1]\`

\`prefix[0]\`을 0으로 두면 l = 1인 경우도 따로 처리하지 않아도 됩니다.

**시간복잡도** O(N + Q)
**공간복잡도** O(N)

**자주 하는 실수**
- 합의 범위: 최대 100,000 × 1,000,000 = 10^11로 int 범위(약 2.1 × 10^9)를 넘습니다. 누적 합 배열과 출력 값 모두 Java는 \`long\`, C는 \`long long\`(\`%lld\`)을 써야 합니다.
- \`prefix[r] - prefix[l]\`로 계산해 l일 값을 빼먹는 경계 실수
- 0번 인덱스부터 저장하면서 l, r은 1번부터라는 점을 놓치는 실수

**언어별 팁**
- Java: 출력이 최대 100,000줄이므로 \`System.out.println\`을 반복하기보다 \`StringBuilder\`에 모아 한 번에 출력하세요.`,
  tests: [
    { input: "1 1\n-7\n1 1\n", output: "-7\n", note: "N = Q = 1 최소 입력" },
    {
      input: "3 3\n-1000000 -1000000 -1000000\n1 3\n2 2\n1 1\n",
      output: "-3000000\n-1000000\n-1000000\n",
      note: "모두 최솟값(음수)",
    },
    {
      input: "6 4\n5 -5 5 -5 5 -5\n1 6\n2 5\n6 6\n1 1\n",
      output: "0\n0\n-5\n5\n",
      note: "l = 1, r = N 경계와 합이 0인 구간",
    },
    randomTest(),
    largeUniformTest(),
  ],
};

export default problem;
