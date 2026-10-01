import type { ProblemContent } from "../../types.ts";

// 기대 출력은 JS 배열과 시작 위치 변수로 직접 시뮬레이션해 독립적으로 계산한다.
function caseOf(n: number) {
  const cards: number[] = [];
  for (let i = 1; i <= n; i++) cards.push(i);
  let head = 0;
  const order: number[] = [];
  while (cards.length - head > 1) {
    order.push(cards[head++]); // 맨 위 카드를 버린다
    cards.push(cards[head++]); // 다음 맨 위 카드를 맨 아래로 옮긴다
  }
  order.push(cards[head]);
  return { input: `${n}\n`, output: `${order.join(" ")}\n` };
}

const problem: ProblemContent = {
  slug: "card-queue",
  title: "카드 버리기 시뮬레이션",
  difficulty: 2,
  estimatedMinutes: 20,
  languages: ["java", "c"],
  tags: {
    algorithm: ["simulation"],
    data_structure: ["queue"],
  },
  description: `마술사가 1번부터 N번까지 번호가 적힌 카드 N장을 한 묶음으로 들고 있습니다. 카드는 1번이 맨 위, N번이 맨 아래에 오도록 차례대로 쌓여 있습니다.

마술사는 카드가 한 장 남을 때까지 다음 동작을 반복합니다.

1. 맨 위의 카드를 한 장 내려놓습니다(버립니다).
2. 그다음 맨 위에 있는 카드를 꺼내 묶음의 맨 아래로 옮깁니다.

마지막으로 남은 한 장도 내려놓으면 공연이 끝납니다. 카드가 **내려놓인 순서**를 구하세요. 마지막에 남은 카드가 가장 마지막에 내려놓인 카드입니다.`,
  input: `첫째 줄에 카드의 수 N이 주어집니다.`,
  output: `카드가 내려놓인 순서대로 카드 번호 N개를 공백 하나로 구분하여 한 줄에 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 100,000`,
  examples: [
    {
      input: "6\n",
      output: "1 3 5 2 6 4\n",
      explanation:
        "[1 2 3 4 5 6]에서 1을 버리고 2를 아래로 옮기면 [3 4 5 6 2], 3을 버리고 4를 옮기면 [5 6 2 4], 5를 버리고 6을 옮기면 [2 4 6], 2를 버리고 4를 옮기면 [6 4], 6을 버리고 4를 옮기면 [4]가 남습니다. 마지막으로 4를 내려놓습니다.",
    },
    {
      input: "4\n",
      output: "1 3 2 4\n",
      explanation: "[1 2 3 4] → 1을 버리고 [3 4 2] → 3을 버리고 [2 4] → 2를 버리고 [4]가 남습니다.",
    },
  ],
  hints: [
    "카드는 위에서 꺼내고, 옮기는 카드는 맨 아래에 넣습니다. 한쪽 끝에서 꺼내고 반대쪽 끝에 넣는 자료구조는 무엇일까요?",
    "배열에서 맨 앞 원소를 지우고 나머지를 한 칸씩 당기면, N이 100,000일 때 얼마나 많은 이동이 일어날까요? 원소를 옮기지 않고 \"맨 앞이 어디인지\"만 기억하는 방법을 생각해보세요.",
    "큐에 1부터 N까지 넣습니다. 큐에 두 장 이상 남아 있는 동안 \"앞에서 하나 꺼내 출력 목록에 추가\" → \"앞에서 하나 더 꺼내 뒤에 다시 넣기\"를 반복합니다. 마지막 한 장도 출력 목록에 추가합니다.",
    "queue = [1, 2, ..., N]\nwhile queue 크기 > 1:\n  결과에 queue.poll() 추가\n  queue.offer(queue.poll())\n결과에 queue.poll() 추가\n결과를 공백으로 이어 출력",
  ],
  solution: `카드를 **위(앞)에서 꺼내고 아래(뒤)에 넣는** 동작이므로 큐(FIFO)로 그대로 시뮬레이션합니다.

1. 큐에 1부터 N까지 차례로 넣습니다.
2. 큐의 크기가 2 이상인 동안
   - 앞에서 꺼낸 카드를 결과에 추가합니다. (버리기)
   - 다시 앞에서 꺼낸 카드를 뒤에 넣습니다. (아래로 옮기기)
3. 남은 한 장을 결과에 추가하고, 결과를 한 줄로 출력합니다.

한 번 반복할 때마다 카드가 한 장씩 줄어들므로 반복은 N - 1번입니다.

**C에서 큐 구현**: 크기 2N인 배열과 \`head\`, \`tail\` 두 인덱스를 씁니다. 꺼낼 때는 \`queue[head++]\`, 넣을 때는 \`queue[tail++] = x\`입니다. 처음 N번 넣고 이후 최대 N - 1번 더 넣으므로 2N칸이면 충분합니다. (원형 큐로 만들면 N칸으로도 됩니다.)

**시간복잡도** O(N), **공간복잡도** O(N)

**자주 하는 실수**
- 배열의 맨 앞을 지우고 나머지를 당기는 방식으로 구현해 O(N²)이 되어 느림
- 마지막에 남은 카드를 출력하지 않음
- N = 1일 때 반복문에 들어가지 않으므로 남은 카드 1만 출력되어야 함
- Java에서 결과를 \`System.out.print\`로 10만 번 출력하면 느립니다. \`StringBuilder\`에 모았다가 한 번에 출력하세요.`,
  tests: [
    { ...caseOf(1), note: "N = 1, 버리는 동작 없이 바로 끝남" },
    { ...caseOf(2), note: "N = 2" },
    { ...caseOf(3), note: "N = 3, 옮긴 카드가 마지막에 남음" },
    { ...caseOf(7), note: "홀수 N" },
    { ...caseOf(65536), note: "N이 2의 거듭제곱 (마지막 카드는 N)" },
    { ...caseOf(100000), note: "N = 100,000 최대 입력" },
  ],
};

export default problem;
