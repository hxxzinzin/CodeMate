import type { ProblemContent } from "../../types.ts";

type Dep = [number, number];

function toInput(n: number, deps: Dep[]): string {
  return `${n} ${deps.length}\n${deps.map((d) => d.join(" ")).join("\n")}${deps.length ? "\n" : ""}`;
}

/**
 * 정답 코드와 독립적인 기대값 계산: 힙 없이 매번 1번부터 훑어서
 * "남은 선행 작업이 없는 가장 작은 번호"를 고르는 O(N²) 방식. 작은 입력에만 사용한다.
 */
function expected(n: number, deps: Dep[]): string {
  const indeg = new Array<number>(n + 1).fill(0);
  const out: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of deps) {
    out[a].push(b);
    indeg[b]++;
  }
  const done = new Array<boolean>(n + 1).fill(false);
  const order: number[] = [];
  for (let step = 0; step < n; step++) {
    let pick = -1;
    for (let i = 1; i <= n; i++) {
      if (!done[i] && indeg[i] === 0) {
        pick = i;
        break;
      }
    }
    if (pick === -1) return "-1\n";
    done[pick] = true;
    order.push(pick);
    for (const b of out[pick]) indeg[b]--;
  }
  return `${order.join(" ")}\n`;
}

function makeCase(n: number, deps: Dep[], note: string) {
  return { input: toInput(n, deps), output: expected(n, deps), note };
}

/** 시드 고정 무작위 DAG: 무작위 순열에서 앞선 작업 → 뒤의 작업 방향으로만 의존 관계를 만든다. */
function randomDag(n: number, m: number, seed: number): Dep[] {
  let x = seed;
  const next = (mod: number) => {
    x = (x * 48271) % 2147483647;
    return x % mod;
  };
  const perm = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) {
    const j = next(i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const deps: Dep[] = [];
  while (deps.length < m) {
    const p = next(n);
    const q = next(n);
    if (p === q) continue;
    deps.push(p < q ? [perm[p], perm[q]] : [perm[q], perm[p]]);
  }
  return deps;
}

const BIG_N = 32000;
/** i+1번 작업이 i번 작업보다 먼저: 가능한 순서는 N, N-1, ..., 1 하나뿐이다. */
const reverseChain: Dep[] = Array.from({ length: BIG_N - 1 }, (_, i) => [i + 2, i + 1]);
const reverseChainAnswer = Array.from({ length: BIG_N }, (_, i) => BIG_N - i).join(" ");

const problem: ProblemContent = {
  slug: "task-order",
  title: "작업 순서 정하기",
  difficulty: 4,
  estimatedMinutes: 50,
  languages: ["java", "c"],
  tags: {
    algorithm: ["topological-sort"],
    data_structure: ["graph", "queue", "priority-queue"],
  },
  description: `게임 개발팀이 출시 전에 처리해야 할 작업 N개를 정리했습니다. 작업에는 1번부터 N번까지 번호가 붙어 있습니다.

일부 작업 사이에는 선후 관계가 있습니다. "A B"는 **A번 작업을 끝내야 B번 작업을 시작할 수 있다**는 뜻입니다. 팀은 한 번에 작업 하나씩만 처리합니다.

모든 선후 관계를 지키면서 N개의 작업을 모두 처리하는 순서를 구하세요. 가능한 순서가 여러 가지라면, **매 순간 시작할 수 있는 작업 중 번호가 가장 작은 작업을 먼저** 처리하는 순서를 출력합니다.

선후 관계가 서로 꼬여 있어(예: 1번 다음에 2번, 2번 다음에 1번) 모든 작업을 처리할 수 없다면 \`-1\`을 출력합니다.`,
  input: `첫째 줄에 작업의 수 N과 선후 관계의 수 M이 공백으로 구분되어 주어집니다.

둘째 줄부터 M개의 줄에 걸쳐 선후 관계 A B가 주어집니다. A번 작업을 B번 작업보다 먼저 끝내야 한다는 뜻입니다.`,
  output: `작업을 처리하는 순서를 한 줄에 공백으로 구분하여 출력합니다.

- 시작할 수 있는 작업이 여러 개이면 그중 번호가 가장 작은 작업을 먼저 처리합니다. 이 규칙에 따라 답은 하나로 정해집니다.
- 모든 작업을 처리할 수 없으면 \`-1\`만 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 32,000
- 0 ≤ M ≤ 100,000
- 1 ≤ A, B ≤ N, A ≠ B
- 같은 선후 관계가 여러 번 주어질 수 있습니다.`,
  examples: [
    {
      input: "5 3\n3 1\n5 2\n1 2\n",
      output: "3 1 4 5 2\n",
      explanation:
        "처음 시작할 수 있는 작업은 3, 4, 5번이고 가장 작은 3번을 처리합니다. 그러면 1번을 시작할 수 있게 되어 후보는 1, 4, 5번이 되고 1번을 처리합니다. 이어서 4번, 5번을 처리하면 마지막으로 2번을 시작할 수 있습니다.",
    },
    {
      input: "3 3\n1 2\n2 3\n3 1\n",
      output: "-1\n",
      explanation: "1 → 2 → 3 → 1로 선후 관계가 순환하므로 어떤 작업도 먼저 시작할 수 없습니다.",
    },
  ],
  hints: [
    "가장 먼저 처리할 수 있는 작업은 어떤 작업일까요? \"먼저 끝내야 하는 작업이 하나도 남지 않은\" 작업이라는 조건을 숫자 하나로 관리할 수 있을지 생각해보세요.",
    "작업 하나를 처리하면, 그 작업 뒤에 와야 하는 작업들의 \"남은 선행 작업 수\"가 줄어듭니다. 순환이 있으면 이 과정이 어디서 멈추게 될까요? 또 후보 중 번호가 가장 작은 작업을 매번 빠르게 꺼내려면 일반 큐로 충분할까요?",
    "위상 정렬(Kahn 알고리즘)을 사용합니다. 각 작업의 진입 차수(남은 선행 작업 수)를 세고, 진입 차수가 0인 작업을 후보에 넣습니다. 후보를 꺼낼 때마다 결과에 추가하고 이웃의 진입 차수를 줄여 0이 되면 후보에 넣습니다. 번호가 작은 것부터 꺼내야 하므로 후보는 최소 힙(우선순위 큐)으로 관리합니다. 처리한 작업 수가 N보다 적으면 순환이 있는 것입니다.",
    "indeg[], adj[] 구성 (A -> B 간선, indeg[B]++)\npq = 최소 힙\nfor i = 1..N: if indeg[i] == 0: pq.add(i)\norder = []\nwhile pq가 비어 있지 않음:\n  u = pq.poll()\n  order.add(u)\n  for v in adj[u]:\n    indeg[v]--\n    if indeg[v] == 0: pq.add(v)\nif order의 길이 < N: 출력 -1\nelse: order 출력",
  ],
  solution: `선후 관계를 방향 그래프(A → B)로 보면, 모든 간선 방향을 지키는 정점 나열이 **위상 정렬**입니다. 여기에 "번호가 작은 작업 먼저"라는 조건이 붙어 답이 하나로 정해집니다.

**Kahn 알고리즘 + 최소 힙**
1. 각 작업의 **진입 차수**(아직 끝나지 않은 선행 작업 수)를 셉니다. 같은 관계가 여러 번 주어지면 그만큼 세고, 그만큼 줄이므로 따로 처리하지 않아도 됩니다.
2. 진입 차수가 0인 작업을 모두 최소 힙에 넣습니다.
3. 힙에서 가장 작은 번호를 꺼내 결과에 추가하고, 그 작업 뒤에 오는 작업들의 진입 차수를 1씩 줄입니다. 0이 된 작업은 힙에 넣습니다.
4. 힙이 비었는데 처리한 작업이 N개보다 적다면, 남은 작업들은 서로를 기다리는 순환에 걸려 있으므로 \`-1\`을 출력합니다.

**왜 일반 큐가 아니라 힙일까요?** 일반 큐(FIFO)를 쓰면 "먼저 후보가 된 작업"이 먼저 나옵니다. 예를 들어 4번이 처음부터 후보였고 1번이 나중에 후보가 되었다면, 큐는 4번을 먼저 꺼내지만 문제의 규칙은 1번을 먼저 처리하라고 합니다.

**시간복잡도** O((N + M) log N)
**공간복잡도** O(N + M)

**자주 하는 실수**
- 우선순위 큐 대신 일반 큐를 써서 순서가 달라지는 실수
- 순환 판정을 하지 않아 일부 작업만 출력하는 실수
- 간선 방향을 반대로(B → A) 저장하는 실수

**언어별 팁**
- Java: \`PriorityQueue<Integer>\`는 기본이 최소 힙입니다. 인접 리스트는 \`List<List<Integer>>\`로, 출력은 \`StringBuilder\`로 모읍니다.
- C: 최소 힙을 배열로 직접 구현합니다. 넣을 때는 맨 끝에 두고 부모와 비교하며 올리고(sift-up), 꺼낼 때는 맨 끝 원소를 루트로 옮긴 뒤 더 작은 자식과 비교하며 내립니다(sift-down). 인접 리스트는 \`head[]\`, \`next[]\`, \`to[]\` 배열로 만들면 malloc 없이 구현할 수 있습니다.`,
  tests: [
    makeCase(1, [], "N = 1, 선후 관계 없음"),
    makeCase(5, [], "선후 관계가 없으면 번호 순서대로"),
    makeCase(4, [[3, 1]], "일반 큐(FIFO)로 풀면 틀리는 경우"),
    makeCase(4, [[1, 2], [1, 2], [2, 3], [1, 3]], "같은 선후 관계 중복"),
    makeCase(6, [[1, 2], [4, 5], [5, 6], [6, 4]], "일부 작업만 순환에 걸린 경우"),
    { input: toInput(BIG_N, []), output: `${Array.from({ length: BIG_N }, (_, i) => i + 1).join(" ")}\n`, note: "N 최대, 선후 관계 없음" },
    { input: toInput(BIG_N, reverseChain), output: `${reverseChainAnswer}\n`, note: "N 최대, 역순으로 이어진 사슬" },
    { input: toInput(BIG_N, [...reverseChain, [1, BIG_N]]), output: "-1\n", note: "N 최대, 전체가 하나의 큰 순환" },
    makeCase(3000, randomDag(3000, 100000, 777), "M 최대 무작위 DAG"),
  ],
};

export default problem;
