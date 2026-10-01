import type { ProblemContent } from "../../types.ts";

type Op = [1 | 2, number, number];

function toInput(n: number, ops: Op[]): string {
  return `${n} ${ops.length}\n${ops.map((o) => o.join(" ")).join("\n")}\n`;
}

const BIG_N = 500000;
const BIG_Q = 500000;

/**
 * 큰 입력 A: 1~300,000번을 "1 i+1 i"로 한 줄로 잇고(299,999개),
 * 나머지 200,001개 연산은 "2 1 300000"(YES)과 "2 1 400000"(NO)을 번갈아 묻는다.
 * 400,000번은 아무와도 친구가 아니므로 항상 NO이고,
 * 그룹은 {1~300,000} 하나와 나머지 200,000명 각각이므로 200,001개다.
 */
const CHAIN_LEN = 300000;
const opsA: Op[] = [];
for (let i = 1; i < CHAIN_LEN; i++) opsA.push([1, i + 1, i]);
const answersA: string[] = [];
for (let k = 0; opsA.length < BIG_Q; k++) {
  if (k % 2 === 0) {
    opsA.push([2, 1, CHAIN_LEN]);
    answersA.push("YES");
  } else {
    opsA.push([2, 1, 400000]);
    answersA.push("NO");
  }
}
answersA.push(String(1 + (BIG_N - CHAIN_LEN)));

/**
 * 큰 입력 B: "1 i i+2"로 홀수 번호끼리, 짝수 번호끼리 잇는다(499,998개).
 * 마지막 두 연산으로 홀수끼리(YES), 홀수와 짝수(NO)를 묻는다. 그룹은 2개다.
 */
const opsB: Op[] = [];
for (let i = 1; i + 2 <= BIG_N; i++) opsB.push([1, i, i + 2]);
opsB.push([2, 1, BIG_N - 1]);
opsB.push([2, 1, BIG_N]);

const problem: ProblemContent = {
  slug: "friend-groups",
  title: "친구 그룹 수",
  difficulty: 4,
  estimatedMinutes: 50,
  languages: ["java", "c"],
  tags: {
    algorithm: ["union-find"],
    data_structure: ["graph"],
    c: ["array"],
  },
  description: `새로 문을 연 동아리 커뮤니티에 회원이 N명 있고, 1번부터 N번까지 번호가 붙어 있습니다. 처음에는 아무도 서로 친구가 아닙니다.

친구 관계는 서로 이어집니다. 즉, A와 B가 친구이고 B와 C가 친구이면 A와 C는 **같은 친구 그룹**에 속합니다. 친구 관계로 직접 또는 간접적으로 이어진 회원들이 하나의 그룹이며, 아무와도 친구가 아닌 회원은 혼자서 한 그룹입니다.

다음 두 종류의 연산이 Q개 주어집니다.

- \`1 a b\`: a번 회원과 b번 회원이 친구가 됩니다.
- \`2 a b\`: a번 회원과 b번 회원이 지금 같은 그룹에 속해 있는지 확인합니다.

모든 \`2\`번 연산에 답하고, 모든 연산이 끝난 뒤 **친구 그룹의 개수**를 구하세요.`,
  input: `첫째 줄에 회원 수 N과 연산의 수 Q가 공백으로 구분되어 주어집니다.

둘째 줄부터 Q개의 줄에 걸쳐 연산이 한 줄에 하나씩 \`1 a b\` 또는 \`2 a b\` 형식으로 주어집니다.`,
  output: `\`2\`번 연산이 주어질 때마다, 주어진 순서대로 한 줄에 하나씩 a와 b가 같은 그룹이면 \`YES\`, 아니면 \`NO\`를 출력합니다.

모든 연산이 끝난 뒤 마지막 줄에 친구 그룹의 개수를 출력합니다. \`2\`번 연산이 하나도 없으면 그룹의 개수 한 줄만 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 500,000
- 1 ≤ Q ≤ 500,000
- 1 ≤ a, b ≤ N
- a와 b가 같을 수 있습니다. (자기 자신은 항상 같은 그룹입니다.)
- 이미 같은 그룹인 두 회원이 다시 친구가 될 수 있습니다.`,
  examples: [
    {
      input: "5 6\n1 1 2\n1 3 4\n2 1 3\n1 2 3\n2 1 4\n2 5 5\n",
      output: "NO\nYES\nYES\n2\n",
      explanation:
        "처음 확인할 때는 {1, 2}와 {3, 4}가 따로 있어 NO입니다. 2번과 3번이 친구가 되면 {1, 2, 3, 4}가 한 그룹이 되어 1번과 4번은 YES입니다. 5번은 자기 자신과 같은 그룹이므로 YES입니다. 마지막 그룹은 {1, 2, 3, 4}와 {5}로 2개입니다.",
    },
    {
      input: "4 3\n2 1 2\n1 1 2\n1 2 1\n",
      output: "NO\n3\n",
      explanation:
        "처음에는 모두 혼자라 NO입니다. 1번과 2번이 친구가 된 뒤 다시 친구가 되어도 그룹 수는 한 번만 줄어 {1, 2}, {3}, {4}로 3개입니다.",
    },
  ],
  hints: [
    "각 그룹마다 \"대표 회원\"을 한 명씩 정해 두면, 두 회원이 같은 그룹인지는 어떻게 확인할 수 있을까요? 두 그룹이 합쳐질 때는 대표를 어떻게 바꾸면 될까요?",
    "그룹이 합쳐질 때마다 그룹 안의 모든 회원 정보를 고치면 너무 느립니다. 대신 각 회원이 \"부모\"만 가리키게 하면 어떨까요? 이때 부모를 따라가는 길이 길어지면 연산 50만 번을 제시간에 처리할 수 있을지도 생각해보세요. 그룹 수는 언제 줄어들까요?",
    "유니온 파인드(Disjoint Set Union)를 사용합니다. parent 배열로 트리를 만들고, find(x)는 루트를 찾으면서 지나간 모든 노드가 루트를 직접 가리키게 바꿉니다(경로 압축). union(a, b)는 두 루트가 다를 때만 한쪽 루트를 다른 쪽 아래에 붙이고 그룹 수를 1 줄입니다. 작은 트리를 큰 트리 밑에 붙이면 더 좋습니다.",
    "parent[i] = i, size[i] = 1, groups = N\n\nfind(x):\n  root = x\n  while parent[root] != root: root = parent[root]\n  while x != root:          // 경로 압축\n    next = parent[x]; parent[x] = root; x = next\n  return root\n\nunion(a, b):\n  ra = find(a), rb = find(b)\n  if ra == rb: return\n  size가 작은 쪽을 큰 쪽 밑에 붙이고 size 갱신\n  groups--\n\n연산마다: 1이면 union, 2이면 find(a) == find(b) ? YES : NO 출력\n마지막에 groups 출력",
  ],
  solution: `"같은 그룹인가?"와 "두 그룹 합치기"를 빠르게 반복하는 문제이므로 **유니온 파인드(서로소 집합)**를 사용합니다.

**구조**: 각 그룹을 하나의 트리로 표현하고, 트리의 루트를 그룹의 대표로 씁니다. \`parent[x]\`는 x의 부모이며, 루트는 자기 자신을 가리킵니다.

- \`find(x)\`: 부모를 따라 올라가 루트를 찾습니다. 두 회원의 루트가 같으면 같은 그룹입니다.
- \`union(a, b)\`: 두 루트가 다르면 한 루트를 다른 루트의 자식으로 붙입니다. 이때만 그룹 수를 1 줄입니다. 이미 같은 그룹이면 아무 일도 하지 않습니다.

**경로 압축이 필요한 이유**: 아무 최적화 없이 붙이면 트리가 한 줄로 길어져 \`find\` 한 번에 O(N)이 걸릴 수 있습니다. 회원과 연산이 50만이면 최악의 경우 수천억 번의 연산이 필요합니다. \`find\`에서 지나간 노드들이 루트를 직접 가리키도록 바꾸는 **경로 압축**, 그리고 작은 트리를 큰 트리 밑에 붙이는 **크기(또는 랭크) 기준 합치기**를 함께 쓰면 연산 한 번이 사실상 상수 시간이 됩니다.

**그룹 수 관리**: 처음 그룹 수는 N이고, 실제로 서로 다른 두 그룹이 합쳐질 때마다 1씩 줄입니다. 마지막에 루트의 개수를 직접 세도 됩니다.

**시간복잡도** O((N + Q) α(N)) — α는 아커만 역함수로, 실제로는 4 이하의 상수입니다.
**공간복잡도** O(N)

**자주 하는 실수**
- 루트가 아니라 \`parent[a]\`와 \`parent[b]\`를 바로 비교하는 실수 (부모가 달라도 루트는 같을 수 있습니다)
- \`union\`에서 루트끼리가 아니라 a, b 자체를 연결하는 실수 (\`parent[a] = b\`)
- 이미 같은 그룹인데 그룹 수를 또 줄이는 실수
- 경로 압축 없이 풀어 시간 초과
- 재귀로 \`find\`를 짜면서 크기 기준 합치기를 하지 않으면, 경로 압축 전 트리가 매우 깊어 스택 오버플로가 날 수 있습니다. 반복문으로 작성하면 안전합니다.

**언어별 팁**
- Java: 출력할 줄이 많으므로 \`StringBuilder\`에 모아 한 번에 출력하세요.
- C: \`parent\`, \`size\` 배열은 크기가 50만이므로 전역으로 선언합니다. \`scanf\`로 충분히 빠르게 읽을 수 있습니다.`,
  tests: [
    { input: "1 1\n2 1 1\n", output: "YES\n1\n", note: "N = 1 최소 입력, 자기 자신 확인" },
    { input: "5 1\n2 1 5\n", output: "NO\n5\n", note: "친구 관계가 하나도 없음" },
    { input: "3 2\n1 1 2\n1 2 3\n", output: "1\n", note: "2번 연산이 없으면 그룹 수만 출력" },
    {
      input: "6 7\n1 1 2\n1 2 3\n1 3 1\n1 4 4\n2 1 3\n2 3 4\n1 5 6\n",
      output: "YES\nNO\n3\n",
      note: "이미 같은 그룹끼리 합치기, 자기 자신과 친구",
    },
    {
      input: "4 5\n1 1 2\n1 3 4\n2 2 4\n1 2 4\n2 1 3\n",
      output: "NO\nYES\n1\n",
      note: "루트가 아닌 회원끼리 합쳐도 그룹 전체가 합쳐짐",
    },
    { input: toInput(BIG_N, opsA), output: `${answersA.join("\n")}\n`, note: "N, Q 최대, 긴 사슬 뒤 질문 반복 (경로 압축 필요)" },
    { input: toInput(BIG_N, opsB), output: "YES\nNO\n2\n", note: "N, Q 최대, 홀수·짝수 두 그룹" },
  ],
};

export default problem;
