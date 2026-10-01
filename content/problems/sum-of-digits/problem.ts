import type { ProblemContent } from "../../types.ts";

// 최대 길이(100,000자리) 테스트용 입력
const allNines = "9".repeat(100000);
const oneZerosOne = "1" + "0".repeat(99998) + "1";

const problem: ProblemContent = {
  slug: "sum-of-digits",
  title: "자릿수의 합",
  difficulty: 1,
  estimatedMinutes: 10,
  languages: ["java", "c"],
  tags: {
    algorithm: ["brute-force"],
    data_structure: ["string"],
    java: ["basic-syntax"],
    c: ["string"],
  },
  description: `도서관의 책에는 아주 긴 관리 번호가 붙어 있습니다. 사서는 번호를 잘못 옮겨 적었는지 확인하려고, 번호의 각 자리 숫자를 모두 더한 값을 함께 적어 둡니다.

자연수 N이 주어질 때, N의 각 자리 숫자를 모두 더한 값을 구하세요.

N은 최대 100,000자리까지 길어질 수 있어서 일반적인 정수 자료형에는 담기지 않을 수 있습니다.`,
  input: `첫째 줄에 자연수 N이 주어집니다.`,
  output: `N의 각 자리 숫자의 합을 출력합니다.`,
  constraints: `- 1 ≤ N의 자릿수 ≤ 100,000
- N은 숫자(\`0\`~\`9\`)로만 이루어져 있고, 0으로 시작하지 않습니다.`,
  examples: [
    {
      input: "12345\n",
      output: "15\n",
      explanation: "1 + 2 + 3 + 4 + 5 = 15입니다.",
    },
    {
      input: "9081726354\n",
      output: "45\n",
      explanation: "0부터 9까지의 숫자가 한 번씩 등장하므로 합은 0 + 1 + ... + 9 = 45입니다.",
    },
  ],
  hints: [
    "N이 100,000자리라면 int나 long에 담을 수 있을까요? 숫자를 어떤 형태로 읽어야 할지 먼저 생각해보세요.",
    "N을 문자열로 읽으면 각 자리는 문자 하나입니다. 문자 '7'을 숫자 7로 바꾸려면 어떻게 해야 할까요? 문자 코드의 차이를 떠올려보세요.",
    "문자열을 처음부터 끝까지 한 글자씩 보면서, 그 문자가 나타내는 숫자를 합계에 더하면 됩니다. 문자 c의 숫자 값은 c - '0'입니다.",
    "s = N을 문자열로 읽기\nsum = 0\nfor 문자 c in s:\n  sum += c - '0'\n출력 sum",
  ],
  solution: `N이 최대 100,000자리이므로 \`long\`(약 19자리)으로도 담을 수 없습니다. 따라서 **문자열로 읽어서 한 글자씩 처리**합니다.

1. N을 문자열로 읽습니다.
2. 각 문자 \`c\`에 대해 \`c - '0'\`을 합계에 더합니다. 문자 \`'0'\`~\`'9'\`는 코드 값이 연속되어 있으므로 이 계산으로 숫자 값을 얻을 수 있습니다.
3. 합계를 출력합니다. 최댓값은 9 × 100,000 = 900,000이므로 \`int\`로 충분합니다.

**시간복잡도** O(L), **공간복잡도** O(L) (L은 N의 자릿수)

**자주 하는 실수**
- \`Long.parseLong\`이나 \`scanf("%lld")\`로 읽어서 큰 입력에서 오류가 나거나 값이 잘림
- 문자를 그대로 더해서 \`'1'\`의 코드 값 49가 더해짐
- C에서 문자열 버퍼를 100,000 + 1(널 문자) 크기보다 작게 잡음`,
  tests: [
    { input: "1\n", output: "1\n", note: "가장 작은 입력 (한 자리)" },
    { input: "10\n", output: "1\n", note: "0이 포함된 경우" },
    { input: "99999999999999999999\n", output: "180\n", note: "long 범위를 넘는 20자리 수" },
    { input: allNines + "\n", output: "900000\n", note: "최대 자릿수, 최대 합 (9가 100,000개)" },
    { input: oneZerosOne + "\n", output: "2\n", note: "최대 자릿수, 대부분 0" },
  ],
};

export default problem;
