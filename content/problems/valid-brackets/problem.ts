import type { ProblemContent } from "../../types.ts";

const problem: ProblemContent = {
  slug: "valid-brackets",
  title: "올바른 괄호",
  difficulty: 1,
  estimatedMinutes: 15,
  languages: ["java", "c"],
  tags: {
    data_structure: ["stack", "string"],
    java: ["collection"],
    c: ["array", "string"],
  },
  description: `소괄호 \`()\`, 중괄호 \`{}\`, 대괄호 \`[]\`로만 이루어진 문자열이 주어집니다.

다음 조건을 모두 만족하면 "올바른 괄호 문자열"입니다.

- 여는 괄호는 같은 종류의 닫는 괄호로 닫혀야 합니다.
- 나중에 연 괄호가 먼저 닫혀야 합니다. 예를 들어 \`([)]\`는 올바르지 않습니다.
- 짝이 맞지 않는 괄호가 남으면 안 됩니다.

주어진 문자열이 올바른 괄호 문자열인지 판별하세요.`,
  input: `첫째 줄에 괄호 문자열 S가 주어집니다.`,
  output: `S가 올바른 괄호 문자열이면 \`YES\`, 아니면 \`NO\`를 출력합니다.`,
  constraints: `- 1 ≤ S의 길이 ≤ 100,000
- S는 \`(\`, \`)\`, \`{\`, \`}\`, \`[\`, \`]\`로만 이루어져 있습니다.`,
  examples: [
    {
      input: "({[]})\n",
      output: "YES\n",
      explanation: "가장 안쪽의 `[]`부터 차례로 짝이 맞게 닫힙니다.",
    },
    {
      input: "([)]\n",
      output: "NO\n",
      explanation: "`[`가 닫히기 전에 `)`가 먼저 나와서, 나중에 연 괄호가 먼저 닫히지 않았습니다.",
    },
  ],
  hints: [
    "괄호를 처리하는 순서를 생각해보세요. 가장 나중에 열린 괄호가 가장 먼저 닫혀야 합니다. 이런 \"나중에 들어온 것이 먼저 나가는\" 구조를 무엇이라고 할까요?",
    "닫는 괄호를 만났을 때 확인해야 할 것은 \"직전에 열렸지만 아직 닫히지 않은 괄호\"입니다. 문자열을 다 읽은 뒤에도 확인할 것이 하나 더 있습니다.",
    "스택을 사용합니다. 여는 괄호는 push하고, 닫는 괄호를 만나면 스택이 비었는지 확인한 뒤 pop한 괄호와 종류가 맞는지 비교합니다. 마지막에 스택이 비어 있어야 합니다.",
    "for 문자 c in S:\n  if c가 여는 괄호: stack.push(c)\n  else:\n    if stack이 비었음: return NO\n    top = stack.pop()\n    if top과 c가 짝이 아님: return NO\nreturn stack이 비었으면 YES, 아니면 NO",
  ],
  solution: `가장 나중에 열린 괄호가 가장 먼저 닫혀야 하므로 **스택(LIFO)**이 딱 맞는 자료구조입니다.

1. 여는 괄호를 만나면 스택에 넣습니다.
2. 닫는 괄호를 만나면
   - 스택이 비어 있으면 짝이 없는 닫는 괄호이므로 \`NO\`
   - 스택에서 꺼낸 괄호와 종류가 다르면 \`NO\`
3. 끝까지 읽은 뒤 스택이 비어 있어야 \`YES\`입니다. 남아 있으면 닫히지 않은 괄호가 있다는 뜻입니다.

**시간복잡도** O(N), **공간복잡도** O(N) (모두 여는 괄호인 경우)

**자주 하는 실수**
- 마지막에 스택이 비었는지 확인하지 않아 \`((\`를 \`YES\`로 판단
- 스택이 빈 상태에서 pop해서 오류 발생 (\`)\`로 시작하는 경우)
- Java에서 \`Stack\` 대신 \`ArrayDeque\`를 쓰면 더 빠르고 권장되는 방식입니다.`,
  tests: [
    { input: "(\n", output: "NO\n", note: "닫히지 않은 괄호 하나" },
    { input: ")\n", output: "NO\n", note: "빈 스택에서 닫는 괄호" },
    { input: "()[]{}\n", output: "YES\n", note: "나란히 놓인 괄호" },
    { input: "(((\n", output: "NO\n", note: "끝까지 읽은 뒤 스택이 남음" },
    { input: "{[()()]}[]\n", output: "YES\n", note: "중첩과 나열 혼합" },
    { input: "(]\n", output: "NO\n", note: "종류가 다른 괄호" },
  ],
};

export default problem;
