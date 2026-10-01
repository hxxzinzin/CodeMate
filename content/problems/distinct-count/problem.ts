import type { ContentTestCase, ProblemContent } from "../../types.ts";

/** 테스트 데이터 생성용 결정적 난수 (매번 같은 입력이 만들어진다) */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return (max: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % max;
  };
}

/** 회원 번호를 만들어 큰 테스트를 구성한다. 기대 출력은 정렬 후 인접 비교로 따로 계산한다. */
function makeTest(n: number, pool: number, seed: number, note: string): ContentTestCase {
  const rand = createRandom(seed);
  // pool개의 서로 다른 큰 번호 후보 중에서 고르므로 중복 정도를 조절할 수 있다
  const ids = Array.from({ length: n }, () => {
    const k = rand(pool);
    return 1 + ((Math.imul(k, 0x9e3779b1) >>> 0) % 1_000_000_000);
  });
  const sorted = [...ids].sort((a, b) => a - b);
  let distinct = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0 || sorted[i] !== sorted[i - 1]) distinct++;
  }
  return { input: `${n}\n${ids.join(" ")}\n`, output: `${distinct}\n`, note };
}

const problem: ProblemContent = {
  slug: "distinct-count",
  title: "서로 다른 수의 개수",
  difficulty: 2,
  estimatedMinutes: 20,
  languages: ["java"],
  tags: {
    data_structure: ["hashset"],
    java: ["collection"],
  },
  description: `놀이공원 입구 게이트는 회원 카드가 찍힐 때마다 회원 번호를 기록합니다. 하루 동안 기록된 회원 번호 N개가 주어집니다.

한 회원이 놀이공원을 나갔다가 다시 들어오면 같은 번호가 여러 번 기록될 수 있습니다. 오늘 놀이공원에 방문한 회원은 모두 몇 명인지, 즉 기록에 나타난 **서로 다른 회원 번호의 개수**를 구하세요.`,
  input: `첫째 줄에 기록의 수 N이 주어집니다.

둘째 줄에 기록된 회원 번호 N개가 기록된 순서대로 공백으로 구분되어 주어집니다.`,
  output: `서로 다른 회원 번호의 개수를 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 500,000
- 1 ≤ 회원 번호 ≤ 1,000,000,000`,
  examples: [
    {
      input: "7\n1004 2025 1004 77 2025 1004 9\n",
      output: "4\n",
      explanation: "1004는 세 번, 2025는 두 번 기록되었지만 한 명으로 셉니다. 방문한 회원은 1004, 2025, 77, 9의 네 명입니다.",
    },
    {
      input: "3\n5 5 5\n",
      output: "1\n",
      explanation: "같은 회원이 세 번 드나들었으므로 방문한 회원은 한 명입니다.",
    },
  ],
  hints: [
    "\"이 번호를 전에 본 적이 있는가?\"를 빠르게 확인할 수 있다면 문제가 쉬워집니다. 중복을 허용하지 않고, 어떤 값이 들어 있는지 빠르게 확인할 수 있는 자료구조는 무엇일까요?",
    "기록마다 앞의 모든 기록과 비교하면 O(N²)으로 너무 느립니다. 회원 번호가 최대 10억이라 크기 10억짜리 배열로 표시하는 방법도 메모리가 부족합니다.",
    "HashSet에 회원 번호를 모두 넣으면 같은 번호는 한 번만 저장됩니다. 마지막에 Set의 크기가 곧 답입니다. (정렬한 뒤 인접한 값이 다른 곳을 세는 방법도 있습니다.)",
    "set = 빈 HashSet\nfor 각 회원 번호 x:\n  set.add(x)   // 이미 있으면 무시됨\n출력 set.size()",
  ],
  solution: `**HashSet**은 같은 값을 한 번만 저장하고, 추가·조회를 평균 O(1)에 처리합니다. 모든 회원 번호를 HashSet에 넣은 뒤 크기를 출력하면 됩니다.

**시간복잡도** 평균 O(N)
**공간복잡도** O(N)

다른 방법으로, 배열을 정렬한 뒤 \`a[i] != a[i-1]\`인 위치의 개수를 세도 됩니다. 이 경우 O(N log N)이며 추가 메모리가 적게 듭니다.

**자주 하는 실수**
- 이중 반복문으로 중복을 확인해 시간 초과
- 회원 번호 크기만큼 boolean 배열을 만들어 메모리 초과 (10억 칸)
- \`List.contains\`로 중복을 확인 (List의 contains는 O(N)이라 결국 O(N²))

**Java 팁**
- \`new HashSet<>(N * 2)\`처럼 초기 용량을 넉넉히 주면 재해싱(rehash) 횟수가 줄어듭니다.
- \`set.add(x)\`는 새로 추가되면 \`true\`, 이미 있으면 \`false\`를 반환하므로 개수를 직접 세는 데도 쓸 수 있습니다.
- 입력이 최대 50만 개이므로 \`Scanner\` 대신 \`BufferedReader\`와 \`StringTokenizer\`를 쓰세요.`,
  tests: [
    { input: "1\n1\n", output: "1\n", note: "N = 1 최소 입력, 최소 회원 번호" },
    {
      input: "4\n1000000000 1 1000000000 1\n",
      output: "2\n",
      note: "회원 번호 최솟값·최댓값 중복",
    },
    { input: "5\n9 8 7 6 5\n", output: "5\n", note: "중복이 하나도 없음" },
    makeTest(500_000, 500_000_000, 11, "N = 500,000 최대 입력, 대부분 서로 다른 번호"),
    makeTest(500_000, 1_000, 12, "N = 500,000 최대 입력, 1,000가지 번호가 반복됨"),
  ],
};

export default problem;
