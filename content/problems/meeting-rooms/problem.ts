import type { ProblemContent } from "../../types.ts";

/** 시드가 같으면 항상 같은 순서로 섞는다 (테스트 입력 고정용). */
function shuffle<T>(items: T[], seed: number): T[] {
  const a = [...items];
  let x = seed;
  for (let i = a.length - 1; i > 0; i--) {
    x = (x * 1103515245 + 12345) % 2147483648;
    const j = x % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toInput(meetings: [number, number][]): string {
  return `${meetings.length}\n${meetings.map(([s, e]) => `${s} ${e}`).join("\n")}\n`;
}

/**
 * 길이가 모두 2인 회의 100,000개: [2i, 2i+2]와 [2i+1, 2i+3] (0 ≤ i < 50,000).
 * 모든 회의가 [0, 100,001] 안에 있고 길이가 2이므로 많아야 50,000개를 고를 수 있고,
 * [2i, 2i+2]만 고르면 정확히 50,000개가 된다.
 */
const LARGE_HALF = 50000;
const largeMeetings: [number, number][] = [];
for (let i = 0; i < LARGE_HALF; i++) {
  largeMeetings.push([2 * i, 2 * i + 2]);
  largeMeetings.push([2 * i + 1, 2 * i + 3]);
}

const problem: ProblemContent = {
  slug: "meeting-rooms",
  title: "회의실 배정",
  difficulty: 3,
  estimatedMinutes: 35,
  languages: ["java"],
  tags: {
    algorithm: ["greedy", "sorting"],
    java: ["comparator", "lambda"],
  },
  description: `한 스타트업에 회의실이 단 하나 있습니다. 이번 주에 회의실을 쓰고 싶다는 신청이 N건 들어왔고, 각 신청에는 회의를 시작하는 시각과 끝나는 시각이 적혀 있습니다.

회의실에서는 한 번에 하나의 회의만 열 수 있고, 회의는 신청한 시각 그대로 진행해야 합니다(시각을 옮기거나 중간에 끊을 수 없습니다). 단, 어떤 회의가 끝나는 시각과 다른 회의가 시작하는 시각이 **같으면** 두 회의를 이어서 열 수 있습니다. 예를 들어 1시~3시 회의와 3시~5시 회의는 둘 다 열 수 있습니다.

신청 중 일부를 골라 회의실에서 열 수 있는 **회의의 최대 개수**를 구하세요.`,
  input: `첫째 줄에 회의 신청의 수 N이 주어집니다.

둘째 줄부터 N개의 줄에 걸쳐 각 회의의 시작 시각 S와 끝나는 시각 E가 공백으로 구분되어 주어집니다. 시각은 0 이상의 정수입니다.`,
  output: `겹치지 않게 열 수 있는 회의의 최대 개수를 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 100,000
- 0 ≤ S < E ≤ 1,000,000,000
- 시작 시각과 끝나는 시각이 모두 같은 신청이 여러 번 있을 수 있으며, 이들은 서로 다른 회의로 봅니다.
- 신청은 정렬되지 않은 순서로 주어집니다.`,
  examples: [
    {
      input: "5\n1 4\n3 5\n0 6\n5 7\n8 9\n",
      output: "3\n",
      explanation:
        "1~4, 5~7, 8~9 회의를 열면 3개입니다. 3~5, 5~7, 8~9를 골라도 3개이며, 4개를 겹치지 않게 고르는 방법은 없습니다.",
    },
    {
      input: "4\n1 10\n2 3\n3 4\n4 5\n",
      output: "3\n",
      explanation:
        "2~3, 3~4, 4~5 회의는 끝나는 시각과 다음 시작 시각이 같아서 이어서 열 수 있습니다. 가장 먼저 시작하는 1~10 회의를 고르면 1개밖에 열지 못합니다.",
    },
  ],
  hints: [
    "회의를 하나 고를 때마다 남은 시간에 더 많은 회의를 넣고 싶습니다. 첫 번째로 열 회의는 어떤 기준으로 고르는 것이 가장 유리할까요? \"가장 먼저 시작하는 회의\"나 \"가장 짧은 회의\"가 항상 정답일까요?",
    "가장 먼저 시작하는 회의가 아주 길면 다른 회의를 모두 막을 수 있고, 가장 짧은 회의도 두 회의 사이에 걸쳐 둘 다 막을 수 있습니다. 회의실이 \"가장 빨리 비는\" 선택이 무엇인지 생각해보세요.",
    "그리디 알고리즘을 사용합니다. 회의를 끝나는 시각 기준으로 오름차순 정렬한 뒤, 앞에서부터 보면서 \"마지막으로 고른 회의가 끝난 시각 ≤ 이번 회의 시작 시각\"이면 고릅니다.",
    "meetings를 (끝나는 시각 오름차순)으로 정렬\nlastEnd = -1   // 시각은 0 이상이므로\ncount = 0\nfor (s, e) in meetings:\n  if s >= lastEnd:\n    count++\n    lastEnd = e\n출력 count",
  ],
  solution: `**끝나는 시각이 가장 빠른 회의부터 고르는 그리디**가 최적입니다.

**왜 맞을까요?** 최적해 하나를 생각해 봅시다. 그 최적해의 첫 회의를 "전체에서 가장 빨리 끝나는 회의"로 바꿔도, 바꾼 회의는 원래 첫 회의보다 늦게 끝나지 않으므로 뒤의 회의들과 겹치지 않습니다. 개수는 그대로이니 이 선택도 최적입니다. 남은 회의들에 같은 논리를 반복하면 그리디의 선택이 최적임을 알 수 있습니다.

1. 회의를 끝나는 시각 기준으로 오름차순 정렬합니다.
2. 마지막으로 고른 회의의 끝나는 시각 \`lastEnd\`를 기억합니다.
3. 앞에서부터 보면서 시작 시각이 \`lastEnd\` 이상이면 그 회의를 고르고 \`lastEnd\`를 갱신합니다. 같을 때도 고를 수 있다는 점(\`>=\`)에 주의하세요.

**시간복잡도** O(N log N) — 정렬
**공간복잡도** O(N)

**자주 하는 실수**
- 시작 시각 기준이나 회의 길이 기준으로 정렬하기 (예제 2와 같은 반례가 있습니다)
- \`s > lastEnd\`로 비교해서 끝과 시작이 같은 회의를 이어 붙이지 못하는 실수
- \`lastEnd\`를 0으로 초기화하면 이 문제에서는 괜찮지만, 시각이 음수일 수 있는 문제에서는 틀립니다. 의미가 분명한 초깃값을 쓰는 습관을 들이세요.

**Java 팁**
- \`int[][] meetings\`를 \`Arrays.sort(meetings, (a, b) -> Integer.compare(a[1], b[1]))\`처럼 람다 Comparator로 정렬할 수 있습니다.
- \`(a, b) -> a[1] - b[1]\`처럼 빼기로 비교하면 값이 클 때 오버플로가 날 수 있으므로 \`Integer.compare\`를 쓰는 것이 안전합니다.
- \`Comparator.comparingInt((int[] a) -> a[1])\`처럼 표현할 수도 있습니다.`,
  tests: [
    { input: "1\n0 1\n", output: "1\n", note: "N = 1 최소 입력" },
    { input: "3\n2 5\n2 5\n2 5\n", output: "1\n", note: "완전히 같은 회의가 여러 개" },
    { input: "4\n1 10\n2 9\n3 8\n4 7\n", output: "1\n", note: "모든 회의가 서로 겹침 (중첩)" },
    { input: "3\n1 5\n5 9\n4 6\n", output: "2\n", note: "가장 짧은 회의부터 고르면 틀리는 경우" },
    { input: "5\n6 8\n0 2\n4 6\n2 4\n8 10\n", output: "5\n", note: "정렬되지 않은 입력, 끝과 시작이 같은 회의 연결" },
    {
      input: "3\n0 1000000000\n0 500000000\n500000000 1000000000\n",
      output: "2\n",
      note: "시각이 최댓값 근처",
    },
    { input: toInput(shuffle(largeMeetings, 2024)), output: `${LARGE_HALF}\n`, note: "N = 100,000 최대 입력" },
  ],
};

export default problem;
