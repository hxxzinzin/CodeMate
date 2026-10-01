import type { ProblemContent } from "../../types.ts";

type Edge = [number, number, number];

function toInput(n: number, start: number, edges: Edge[]): string {
  return `${n} ${edges.length} ${start}\n${edges.map((e) => e.join(" ")).join("\n")}${edges.length ? "\n" : ""}`;
}

/**
 * 정답 코드와 독립적인 기대값 계산: 힙 없이 매번 가장 가까운 정점을 선형으로 찾는 O(N²) 다익스트라.
 * 거리는 최대 약 2 × 10^10이라 JS number로 정확히 표현된다.
 */
function expected(n: number, start: number, edges: Edge[]): string {
  const adj: [number, number][][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of edges) adj[u].push([v, w]);
  const dist = new Array<number>(n + 1).fill(Infinity);
  const done = new Array<boolean>(n + 1).fill(false);
  dist[start] = 0;
  for (;;) {
    let u = -1;
    for (let i = 1; i <= n; i++) {
      if (!done[i] && dist[i] !== Infinity && (u === -1 || dist[i] < dist[u])) u = i;
    }
    if (u === -1) break;
    done[u] = true;
    for (const [v, w] of adj[u]) {
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
  }
  return dist.slice(1).map((d) => (d === Infinity ? "-1" : String(d))).join("\n") + "\n";
}

function makeCase(n: number, start: number, edges: Edge[], note: string) {
  return { input: toInput(n, start, edges), output: expected(n, start, edges), note };
}

/** 1 → 2 → ... → N 일직선, 모든 가중치가 최댓값 */
const CHAIN_N = 20000;
const chainEdges: Edge[] = Array.from({ length: CHAIN_N - 1 }, (_, i) => [i + 1, i + 2, 1000000]);

/** 시드 고정 무작위 그래프. 19,501번 이후 정점으로 들어오는 간선은 없다(도달 불가). */
function randomEdges(n: number, m: number, seed: number): Edge[] {
  let x = seed;
  const next = (mod: number) => {
    x = (x * 48271) % 2147483647;
    return x % mod;
  };
  const edges: Edge[] = [];
  for (let i = 0; i < m; i++) {
    edges.push([next(n) + 1, next(19500) + 1, next(1000000) + 1]);
  }
  return edges;
}

const problem: ProblemContent = {
  slug: "delivery-route",
  title: "배달 최단 시간",
  difficulty: 4,
  estimatedMinutes: 55,
  languages: ["java"],
  tags: {
    algorithm: ["shortest-path", "dijkstra"],
    data_structure: ["graph", "priority-queue"],
    java: ["collection", "oop"],
  },
  description: `한 도시에 배달 거점이 N개 있고, 1번부터 N번까지 번호가 붙어 있습니다. 거점 사이에는 M개의 **일방통행** 도로가 있으며, 각 도로를 지나는 데 걸리는 시간이 정해져 있습니다.

물류 센터가 있는 S번 거점에서 출발해 각 거점까지 배달할 때 걸리는 **최단 시간**을 모두 구하세요.

- 도로는 적힌 방향으로만 지날 수 있습니다. u에서 v로 가는 도로가 있어도 v에서 u로 갈 수 있는 것은 아닙니다.
- 두 거점 사이에 도로가 여러 개 있을 수 있고, 출발지와 도착지가 같은 도로가 있을 수도 있습니다.
- S번 거점에서 어떤 길로도 갈 수 없는 거점이 있을 수 있습니다.`,
  input: `첫째 줄에 거점의 수 N, 도로의 수 M, 물류 센터가 있는 거점 번호 S가 공백으로 구분되어 주어집니다.

둘째 줄부터 M개의 줄에 걸쳐 도로 정보 u v w가 주어집니다. u번 거점에서 v번 거점으로 가는 일방통행 도로를 지나는 데 w분이 걸린다는 뜻입니다.`,
  output: `N개의 줄에 걸쳐 출력합니다. i번째 줄에는 S번 거점에서 i번 거점까지의 최단 시간을 출력합니다.

- S번 거점 자신까지의 시간은 \`0\`입니다.
- 도달할 수 없는 거점은 \`-1\`을 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 20,000
- 0 ≤ M ≤ 200,000
- 1 ≤ S ≤ N
- 1 ≤ u, v ≤ N
- 1 ≤ w ≤ 1,000,000
- 최단 시간은 32비트 정수 범위를 넘을 수 있습니다.`,
  examples: [
    {
      input: "5 7 1\n1 2 4\n1 3 1\n3 2 2\n2 4 1\n3 4 6\n4 5 3\n5 1 1\n",
      output: "0\n3\n1\n4\n7\n",
      explanation:
        "2번 거점은 바로 가면 4분이지만 1 → 3 → 2로 가면 1 + 2 = 3분입니다. 4번은 1 → 3 → 2 → 4로 4분, 5번은 그 뒤 3분을 더해 7분입니다.",
    },
    {
      input: "4 3 2\n1 2 5\n2 3 5\n4 3 1\n",
      output: "-1\n0\n5\n-1\n",
      explanation:
        "1 → 2 도로는 일방통행이라 2번에서 1번으로 갈 수 없습니다. 4번 거점도 4 → 3 방향 도로만 있어 2번에서 도달할 수 없습니다.",
    },
  ],
  hints: [
    "도로마다 걸리는 시간이 다르기 때문에, 지나는 도로 수가 적은 길이 항상 빠른 것은 아닙니다. 모든 가중치가 양수일 때 한 출발점에서 모든 정점까지의 최단 거리를 구하는 대표적인 알고리즘은 무엇일까요?",
    "아직 거리가 확정되지 않은 거점 중 \"현재까지 알려진 거리가 가장 짧은\" 거점은 더 짧아질 수 없습니다. 그 거점을 매번 빠르게 찾으려면 어떤 자료구조가 필요할까요? 또 거리 합이 int를 넘을 수 있다는 점도 생각해보세요.",
    "다익스트라 알고리즘을 우선순위 큐로 구현합니다. dist 배열을 무한대로 채우고 dist[S] = 0으로 둔 뒤 (거리, 정점)을 큐에 넣습니다. 꺼낸 거리가 dist보다 크면 이미 처리된 오래된 정보이므로 건너뛰고, 아니면 나가는 도로를 따라 거리를 갱신하며 큐에 넣습니다.",
    "dist[1..N] = INF (long), dist[S] = 0\npq.add((0, S))\nwhile pq가 비어 있지 않음:\n  (d, u) = pq.poll()\n  if d > dist[u]: continue   // 오래된 정보\n  for (v, w) in adj[u]:\n    if d + w < dist[v]:\n      dist[v] = d + w\n      pq.add((dist[v], v))\nfor i = 1..N: 출력 dist[i] == INF ? -1 : dist[i]",
  ],
  solution: `가중치가 모두 양수인 방향 그래프에서 한 정점으로부터의 최단 거리이므로 **다익스트라 알고리즘**을 사용합니다.

**아이디어**: 아직 확정되지 않은 정점 중 현재 거리가 가장 짧은 정점은, 다른 정점을 거쳐 돌아와도 (가중치가 양수이므로) 더 짧아질 수 없습니다. 그래서 그 정점의 거리를 확정하고, 그 정점에서 나가는 간선으로 이웃의 거리를 갱신하는 일을 반복합니다.

1. 인접 리스트로 그래프를 저장합니다. (방향 그래프이므로 u → v만 추가)
2. \`dist\`를 무한대로 채우고 \`dist[S] = 0\`, 우선순위 큐에 \`(0, S)\`를 넣습니다.
3. 큐에서 거리가 가장 작은 항목을 꺼냅니다. 꺼낸 거리가 \`dist[u]\`보다 크면 이미 더 짧은 거리로 처리된 정점이므로 건너뜁니다.
4. u에서 나가는 간선 (v, w)마다 \`dist[u] + w < dist[v]\`이면 갱신하고 큐에 넣습니다.
5. 끝까지 무한대인 정점은 도달할 수 없으므로 \`-1\`을 출력합니다.

**시간복잡도** O((N + M) log M)
**공간복잡도** O(N + M)

**자주 하는 실수**
- 거리를 int로 저장해 오버플로 — 일직선으로 19,999개의 도로를 각각 100만 분씩 지나면 약 200억 분이 됩니다. \`long\`을 쓰세요.
- 무한대를 \`Long.MAX_VALUE\`로 두고 \`dist[u] + w\`를 계산하면 오버플로가 날 수 있습니다. 꺼낸 정점은 항상 유한한 거리를 가지므로 이 풀이에서는 안전하지만, 보통은 충분히 큰 값(예: \`Long.MAX_VALUE / 4\`)을 쓰는 것이 안전합니다.
- "오래된 정보 건너뛰기"를 하지 않으면 같은 정점을 여러 번 처리해 느려집니다.
- 양방향으로 간선을 추가하는 실수 (일방통행 조건 위반)
- 우선순위 큐 없이 매번 모든 정점을 훑어 최솟값을 찾으면 O(N²)이며, 이 문제 제한에서는 느릴 수 있습니다.

**Java 팁**
- 간선을 \`Edge(to, weight)\`, 큐 항목을 \`Node(vertex, dist)\` 같은 작은 클래스(또는 \`record\`)로 만들면 \`int[]\`/\`long[]\`보다 읽기 쉽습니다.
- \`Node implements Comparable<Node>\`로 만들고 \`compareTo\`에서 \`Long.compare\`를 쓰거나, \`new PriorityQueue<>(Comparator.comparingLong(Node::dist))\`처럼 Comparator를 넘깁니다.
- 출력이 최대 2만 줄이므로 \`StringBuilder\`에 모아서 한 번에 출력하세요.`,
  tests: [
    makeCase(1, 1, [], "N = 1, 도로 없음"),
    makeCase(3, 2, [], "도로가 하나도 없어 출발지 외에는 모두 도달 불가"),
    makeCase(2, 1, [[1, 1, 5], [1, 2, 10], [1, 2, 3]], "자기 자신으로 가는 도로와 중복 도로"),
    makeCase(
      5,
      1,
      [[1, 5, 100], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 5, 1], [5, 1, 1]],
      "도로를 많이 거치는 길이 더 빠른 경우",
    ),
    makeCase(4, 4, [[1, 2, 1], [2, 3, 1], [3, 1, 1]], "출발지에서 나가는 도로가 없음"),
    makeCase(CHAIN_N, 1, chainEdges, "N 최대 일직선, 거리 합이 int 범위 초과"),
    makeCase(CHAIN_N, CHAIN_N, chainEdges, "마지막 정점에서 출발, 나머지 모두 도달 불가"),
    makeCase(20000, 1, randomEdges(20000, 200000, 12345), "N, M 최대 무작위 그래프 (일부 도달 불가)"),
  ],
};

export default problem;
