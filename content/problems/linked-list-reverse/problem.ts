import type { ProblemContent } from "../../types.ts";

function toCase(values: number[]): { input: string; output: string } {
  return {
    input: `${values.length}\n${values.join(" ")}\n`,
    output: `${[...values].reverse().join(" ")}\n`,
  };
}

const largeValues = Array.from({ length: 100000 }, (_, i) => (i % 2 === 0 ? i * 9967 : -i * 9973));

const problem: ProblemContent = {
  slug: "linked-list-reverse",
  title: "연결 리스트 뒤집기",
  difficulty: 3,
  estimatedMinutes: 30,
  languages: ["c"],
  tags: {
    data_structure: ["linked-list"],
    c: ["struct", "pointer", "dynamic-memory"],
  },
  description: `정수 N개가 주어집니다. 이 정수들을 주어진 순서대로 **단일 연결 리스트**에 담은 뒤, 리스트를 뒤집어 처음부터 끝까지 출력하세요.

연결 리스트의 각 노드는 정수 값 하나와 다음 노드를 가리키는 포인터를 가집니다. 리스트를 뒤집는다는 것은 첫 번째 노드가 마지막이 되고 마지막 노드가 첫 번째가 되도록 **노드 사이의 연결 방향을 바꾸는 것**입니다.

이 문제는 연결 리스트를 직접 다루는 연습을 위한 문제입니다. 노드를 동적으로 만들고, 포인터만 바꿔서 뒤집고, 다 쓴 메모리를 해제하는 과정을 모두 직접 구현해 보세요.`,
  input: `첫째 줄에 정수의 개수 N이 주어집니다.

둘째 줄에 N개의 정수가 공백으로 구분되어 주어집니다.`,
  output: `뒤집은 연결 리스트의 값을 첫 노드부터 차례로 한 줄에 공백으로 구분하여 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 100,000
- -1,000,000,000 ≤ 각 정수 ≤ 1,000,000,000`,
  examples: [
    {
      input: "5\n1 2 3 4 5\n",
      output: "5 4 3 2 1\n",
      explanation: "1 → 2 → 3 → 4 → 5 순서의 리스트를 뒤집으면 5 → 4 → 3 → 2 → 1이 됩니다.",
    },
    {
      input: "3\n-7 0 7\n",
      output: "7 0 -7\n",
      explanation: "음수와 0도 값 그대로 순서만 뒤집힙니다.",
    },
  ],
  hints: [
    "노드 하나의 \"다음\" 포인터 방향을 바꾸면, 원래 다음에 있던 노드로는 더 이상 갈 수 없게 됩니다. 연결을 바꾸기 전에 무엇을 미리 기억해 두어야 할까요?",
    "리스트를 앞에서부터 한 번 훑으면서 뒤집으려면 \"이미 뒤집은 부분의 첫 노드\", \"지금 바꿀 노드\", \"아직 뒤집지 않은 부분의 첫 노드\" 세 가지를 동시에 알아야 합니다. 맨 처음에 \"이미 뒤집은 부분\"은 무엇일까요?",
    "포인터 세 개 prev, cur, next를 사용합니다. prev = NULL, cur = head에서 시작해 cur가 NULL이 될 때까지 next를 저장하고, cur->next를 prev로 바꾸고, prev와 cur를 한 칸씩 앞으로 옮깁니다. 반복이 끝나면 prev가 새 head입니다.",
    "struct Node { int value; struct Node *next; }\n\n입력을 읽으며 malloc으로 노드를 만들어 tail 뒤에 붙임\n\nprev = NULL, cur = head\nwhile cur != NULL:\n  next = cur->next\n  cur->next = prev\n  prev = cur\n  cur = next\nhead = prev\n\nhead부터 출력\nhead부터 차례로 free (free하기 전에 다음 노드 주소를 저장)",
  ],
  solution: `노드를 새로 만들지 않고 **포인터 방향만 바꿔서** 뒤집습니다. 핵심은 포인터 세 개입니다.

- \`prev\`: 이미 뒤집은 부분의 첫 노드 (처음에는 \`NULL\`)
- \`cur\`: 지금 방향을 바꿀 노드
- \`next\`: 아직 뒤집지 않은 부분의 첫 노드 (연결을 바꾸기 **전에** 저장해야 잃어버리지 않습니다)

\`\`\`
while (cur != NULL) {
    next = cur->next;   // 1. 다음 노드 기억
    cur->next = prev;   // 2. 방향 뒤집기
    prev = cur;         // 3. 한 칸 전진
    cur = next;
}
head = prev;
\`\`\`

**리스트 만들기**: \`malloc(sizeof(struct Node))\`로 노드를 만들고 \`tail\` 포인터를 유지하면 끝에 붙이는 일이 O(1)입니다. \`malloc\`이 \`NULL\`을 돌려주는 경우도 확인하는 습관을 들이세요.

**메모리 해제 (중요)**: \`malloc\`으로 만든 노드는 반드시 \`free\`해야 합니다. 이때 \`free(cur)\` 다음에 \`cur->next\`를 읽으면 이미 해제된 메모리에 접근하는 오류가 됩니다. **다음 노드 주소를 먼저 저장한 뒤** 해제하세요.

\`\`\`
while (cur != NULL) {
    struct Node *next = cur->next;
    free(cur);
    cur = next;
}
\`\`\`

**시간복잡도** O(N), **공간복잡도** O(N) (노드 N개, 뒤집기 자체는 추가 메모리 O(1))

**자주 하는 실수**
- \`next\`를 저장하지 않고 \`cur->next = prev\`를 먼저 해서 나머지 리스트를 잃어버리는 실수
- 뒤집은 뒤 \`head\`를 \`prev\`로 바꾸지 않아 원래 첫 노드(이제 마지막 노드)부터 출력하는 실수
- 노드를 해제하지 않아 메모리 누수가 생기거나, 해제한 노드에 다시 접근하는 실수
- 재귀로 뒤집으면 N = 100,000일 때 호출 깊이가 깊어져 위험할 수 있습니다. 반복문을 권장합니다.`,
  tests: [
    { ...toCase([42]), note: "N = 1, 노드 하나" },
    { ...toCase([1, 2]), note: "N = 2" },
    { ...toCase([7, 7, 3, 7]), note: "같은 값이 섞여 있음" },
    { ...toCase([1000000000, -1000000000, 0]), note: "값의 최댓값과 최솟값" },
    { ...toCase(largeValues), note: "N = 100,000 최대 입력" },
  ],
};

export default problem;
