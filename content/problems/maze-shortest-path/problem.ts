import type { ProblemContent } from "../../types.ts";

/** 모든 칸이 빈 칸인 격자 */
function openGrid(n: number, m: number): string {
  const row = ".".repeat(m);
  return `${n} ${m}\n${Array.from({ length: n }, () => row).join("\n")}\n`;
}

/**
 * 지그재그 미로. 짝수 번째 줄(0부터)은 모두 빈 칸, 홀수 번째 줄은 벽이고
 * 오른쪽 끝과 왼쪽 끝에 번갈아 한 칸씩 통로가 뚫려 있다.
 * 열린 줄이 rows개이면 이동 횟수는 rows * (m - 1) + (n - 1) 이다.
 */
function zigzagGrid(n: number, m: number): string {
  const lines: string[] = [];
  for (let r = 0; r < n; r++) {
    if (r % 2 === 0) {
      lines.push(".".repeat(m));
    } else {
      const gapAtRight = r % 4 === 1;
      lines.push(gapAtRight ? "#".repeat(m - 1) + "." : "." + "#".repeat(m - 1));
    }
  }
  return `${n} ${m}\n${lines.join("\n")}\n`;
}

/** 도착 칸의 위쪽과 왼쪽만 벽으로 막은 큰 격자 */
function blockedGoalGrid(n: number, m: number): string {
  const lines = Array.from({ length: n }, () => ".".repeat(m).split(""));
  lines[n - 2][m - 1] = "#";
  lines[n - 1][m - 2] = "#";
  return `${n} ${m}\n${lines.map((l) => l.join("")).join("\n")}\n`;
}

const ZIGZAG_N = 997;
const ZIGZAG_M = 1000;
const ZIGZAG_OPEN_ROWS = Math.ceil(ZIGZAG_N / 2);

const problem: ProblemContent = {
  slug: "maze-shortest-path",
  title: "미로 최단 거리",
  difficulty: 3,
  estimatedMinutes: 40,
  languages: ["java", "c"],
  tags: {
    algorithm: ["bfs"],
    data_structure: ["queue", "graph"],
  },
  description: `로봇 청소기가 N행 M열 격자 모양의 창고 왼쪽 위 칸 (1, 1)에서 출발해 오른쪽 아래 칸 (N, M)에 있는 충전기까지 가려고 합니다.

격자의 각 칸은 빈 칸(\`.\`) 또는 상자가 쌓인 칸(\`#\`)입니다. 로봇은 한 번에 상하좌우로 인접한 빈 칸 하나로만 이동할 수 있고, 상자가 쌓인 칸이나 격자 바깥으로는 갈 수 없습니다.

로봇이 충전기에 도착하기 위한 **최소 이동 횟수**를 구하세요. 도착할 수 없다면 \`-1\`을 출력합니다.`,
  input: `첫째 줄에 격자의 크기 N과 M이 공백으로 구분되어 주어집니다.

둘째 줄부터 N개의 줄에 걸쳐 격자의 각 행이 주어집니다. 각 행은 \`.\`과 \`#\`으로만 이루어진 길이 M의 문자열이며, 공백 없이 주어집니다.`,
  output: `(1, 1)에서 (N, M)까지의 최소 이동 횟수를 출력합니다. 도착할 수 없으면 \`-1\`을 출력합니다.

이동 횟수는 지나간 칸의 수가 아니라 **이동한 횟수**입니다. 따라서 N = M = 1이면 답은 0입니다.`,
  constraints: `- 1 ≤ N, M ≤ 1,000
- 출발 칸 (1, 1)과 도착 칸 (N, M)은 항상 빈 칸(\`.\`)입니다.`,
  examples: [
    {
      input: "5 5\n.#...\n.#.#.\n.#.#.\n.#.#.\n...#.\n",
      output: "16\n",
      explanation:
        "왼쪽 열을 따라 아래로 4번, 오른쪽으로 2번, 가운데 열을 따라 위로 4번, 오른쪽으로 2번, 마지막 열을 따라 아래로 4번 이동해 모두 16번 이동합니다. 벽 때문에 이보다 짧은 길은 없습니다.",
    },
    {
      input: "3 3\n.#.\n#..\n...\n",
      output: "-1\n",
      explanation: "출발 칸의 오른쪽과 아래쪽이 모두 막혀 있어서 한 칸도 움직일 수 없습니다.",
    },
  ],
  hints: [
    "모든 이동의 비용이 1로 같습니다. 출발점에서 가까운 칸부터 차례로 방문한다면, 어떤 칸에 처음 도착했을 때의 이동 횟수는 어떤 의미를 가질까요?",
    "같은 칸을 여러 번 방문하면 시간이 크게 늘어납니다. 칸을 \"방문했다\"고 표시하는 시점을 큐에서 꺼낼 때로 할지, 큐에 넣을 때로 할지 생각해보세요. 또 도착할 수 없는 경우는 어떻게 알아낼 수 있을까요?",
    "너비 우선 탐색(BFS)을 사용합니다. 각 칸까지의 거리를 저장하는 배열을 -1로 초기화하고, 출발 칸의 거리를 0으로 둔 뒤 큐에 넣습니다. 큐에서 꺼낸 칸의 상하좌우 중 아직 거리가 정해지지 않은 빈 칸에 \"현재 거리 + 1\"을 기록하며 큐에 넣습니다.",
    "dist[][] = -1로 초기화\ndist[0][0] = 0, queue.add((0, 0))\nwhile queue가 비어 있지 않음:\n  (r, c) = queue.poll()\n  for (dr, dc) in 상하좌우:\n    (nr, nc) = (r + dr, c + dc)\n    if 격자 안이고 빈 칸이고 dist[nr][nc] == -1:\n      dist[nr][nc] = dist[r][c] + 1\n      queue.add((nr, nc))\n출력 dist[N-1][M-1]   // 도달하지 못했으면 -1 그대로",
  ],
  solution: `모든 이동의 비용이 같은 격자에서의 최단 거리는 **BFS(너비 우선 탐색)**로 구합니다.

BFS는 출발점에서 거리가 0인 칸, 1인 칸, 2인 칸… 순서로 방문합니다. 그래서 어떤 칸에 **처음 도착했을 때의 거리가 곧 최단 거리**입니다.

1. 거리 배열 \`dist\`를 -1로 채웁니다. -1은 "아직 방문하지 않음"을 뜻합니다.
2. 출발 칸의 거리를 0으로 두고 큐에 넣습니다.
3. 큐에서 칸을 하나 꺼내 상하좌우를 확인합니다. 격자 안이고, 빈 칸이고, 아직 방문하지 않았다면 거리를 \`현재 거리 + 1\`로 기록하고 큐에 넣습니다.
4. 큐가 빌 때까지 반복한 뒤 \`dist[N-1][M-1]\`을 출력합니다. 도달하지 못했다면 처음 값 -1이 그대로 남아 있습니다.

**시간복잡도** O(N × M) — 각 칸은 최대 한 번 큐에 들어갑니다.
**공간복잡도** O(N × M) — 거리 배열과 큐

**자주 하는 실수**
- 큐에서 **꺼낼 때** 방문 표시를 하면 같은 칸이 큐에 여러 번 들어가 시간·메모리가 크게 늘어납니다. **넣을 때** 표시하세요.
- DFS로 모든 경로를 탐색하면 최단 거리를 보장하지 못하거나 시간 초과가 납니다.
- N = M = 1일 때 0이 아니라 1을 출력하는 실수 (이동 횟수와 지나간 칸 수를 혼동)
- 행과 열을 바꿔서 인덱스를 잘못 계산하는 실수 (N과 M이 다를 때 드러납니다)

**언어별 팁**
- Java: \`ArrayDeque<int[]>\`를 큐로 쓰거나, 칸 번호 \`r * M + c\`를 int 배열 큐에 넣으면 더 빠릅니다. 입력은 \`BufferedReader.readLine()\`으로 한 줄씩 읽으세요.
- C: 큐를 크기 N × M인 정수 배열과 head, tail 인덱스로 직접 구현합니다. 1,000 × 1,000 배열은 지역 변수로 두면 스택이 넘칠 수 있으니 전역으로 선언하세요.`,
  tests: [
    { input: "1 1\n.\n", output: "0\n", note: "N = M = 1, 출발점이 곧 도착점" },
    { input: "1 6\n......\n", output: "5\n", note: "한 줄짜리 격자" },
    { input: "2 2\n.#\n#.\n", output: "-1\n", note: "출발점이 바로 갇힌 경우" },
    {
      input: "4 6\n......\n.####.\n......\n#####.\n",
      output: "8\n",
      note: "경로가 여러 개인 경우",
    },
    {
      input: "3 5\n..#..\n..#..\n..#..\n",
      output: "-1\n",
      note: "벽이 세로로 격자를 완전히 가르는 경우",
    },
    { input: openGrid(1000, 1000), output: "1998\n", note: "최대 크기, 장애물 없음" },
    {
      input: zigzagGrid(ZIGZAG_N, ZIGZAG_M),
      output: `${ZIGZAG_OPEN_ROWS * (ZIGZAG_M - 1) + (ZIGZAG_N - 1)}\n`,
      note: "큰 지그재그 미로 (최단 경로가 매우 김)",
    },
    { input: blockedGoalGrid(1000, 1000), output: "-1\n", note: "최대 크기, 도착 칸만 막힘" },
  ],
};

export default problem;
