import type { ProblemContent } from "../../types.ts";

type Student = { name: string; score: number };

// 기대 출력은 정수 비교(점수 × N ≥ 총점)로 독립적으로 계산한다.
function caseOf(students: Student[]) {
  const n = students.length;
  const sum = students.reduce((acc, s) => acc + s.score, 0);
  const passed = students.filter((s) => s.score * n >= sum).map((s) => s.name);
  return {
    input: `${n}\n${students.map((s) => `${s.name} ${s.score}`).join("\n")}\n`,
    output: `${passed.length}\n${passed.join("\n")}\n`,
  };
}

// N = 100 테스트: 이름은 Student001 ~ Student100, 점수는 규칙적으로 섞인 0~100
const hundred: Student[] = [];
for (let i = 1; i <= 100; i++) {
  hundred.push({ name: `Student${String(i).padStart(3, "0")}`, score: (i * 37) % 101 });
}

const problem: ProblemContent = {
  slug: "student-average",
  title: "학생 평균 점수",
  difficulty: 1,
  estimatedMinutes: 20,
  languages: ["c"],
  tags: {
    data_structure: ["array"],
    c: ["struct", "function"],
  },
  description: `담임 선생님이 이번 시험 결과를 정리하려고 합니다. 반 학생 전체의 평균 점수를 구한 다음, **점수가 평균 이상인 학생**을 칭찬 명단에 올리려고 합니다.

학생 N명의 이름과 점수가 주어질 때, 점수가 평균 이상인 학생의 수와 이름을 출력하세요.

- 평균은 (전체 점수의 합) ÷ N이며, 소수일 수 있습니다.
- 점수가 평균과 정확히 같은 학생도 명단에 포함합니다.`,
  input: `첫째 줄에 학생 수 N이 주어집니다.
둘째 줄부터 N개의 줄에 걸쳐 학생의 이름과 점수가 공백으로 구분되어 한 줄에 한 명씩 주어집니다.`,
  output: `첫째 줄에 점수가 평균 이상인 학생의 수 K를 출력합니다.
둘째 줄부터 K개의 줄에 그 학생들의 이름을 **입력된 순서대로** 한 줄에 하나씩 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 100
- 이름은 영어 대소문자로만 이루어져 있고, 길이는 1 이상 20 이하입니다.
- 학생들의 이름은 서로 다릅니다.
- 0 ≤ 점수 ≤ 100 (점수는 정수)`,
  examples: [
    {
      input: "3\nAlice 70\nBob 80\nChris 90\n",
      output: "2\nBob\nChris\n",
      explanation: "평균은 (70 + 80 + 90) ÷ 3 = 80점입니다. 평균과 같은 Bob과 평균보다 높은 Chris가 명단에 오릅니다.",
    },
    {
      input: "4\nMina 60\nJun 85\nSora 72\nHyun 95\n",
      output: "2\nJun\nHyun\n",
      explanation: "평균은 312 ÷ 4 = 78점입니다. 78점 이상인 Jun과 Hyun을 입력된 순서대로 출력합니다.",
    },
  ],
  hints: [
    "학생 한 명은 이름과 점수라는 두 가지 정보를 가집니다. 이 둘을 하나로 묶어서 다룰 수 있는 C의 문법은 무엇일까요?",
    "평균은 모든 점수를 다 읽어야 알 수 있습니다. 그렇다면 학생 정보를 읽으면서 바로 출력할 수 있을까요? 또, 평균이 소수일 때 비교는 어떻게 하면 안전할까요?",
    "이름과 점수를 담는 구조체를 만들고, 구조체 배열에 모든 학생을 저장합니다. 총점을 구하는 함수를 따로 만든 뒤, 배열을 다시 처음부터 훑으며 평균 이상인 학생을 고릅니다. 실수 대신 \"점수 × N ≥ 총점\"으로 비교하면 소수 오차가 없습니다.",
    "struct Student { 이름, 점수 }\nstudents[N]에 모두 읽기\nsum = 총점(students, N)\ncount = 점수 × N ≥ sum 인 학생 수\n출력 count\nfor 학생 s in students:\n  if s.점수 × N ≥ sum: 출력 s.이름",
  ],
  solution: `평균을 알아야 비교할 수 있으므로 **학생 정보를 먼저 모두 저장**해야 합니다. 이름과 점수를 함께 다루기 위해 구조체를 사용합니다.

\`\`\`
struct Student {
    char name[21];   // 최대 20글자 + 널 문자
    int score;
};
\`\`\`

1. \`struct Student\` 배열에 N명의 정보를 읽어 둡니다.
2. 총점을 구하는 함수를 만들어 \`sum\`을 계산합니다.
3. 평균 이상인지는 \`score >= sum / N\` 대신 양변에 N을 곱한 **\`score * N >= sum\`**으로 비교합니다. 정수끼리 비교하므로 소수 오차나 정수 나눗셈의 버림 문제가 없습니다.
4. 조건을 만족하는 학생 수를 먼저 출력하고, 배열을 앞에서부터 다시 훑으며 이름을 출력합니다.

최고 점수를 받은 학생은 항상 평균 이상이므로 K는 1 이상입니다.

**시간복잡도** O(N), **공간복잡도** O(N)

**자주 하는 실수**
- \`sum / N\`을 정수 나눗셈으로 계산해서 평균이 78.5일 때 78로 버려짐 (78점 학생이 잘못 포함됨)
- 이름 배열을 \`char name[20]\`으로 잡아 20글자 이름에서 널 문자 자리가 없음
- 구조체 배열을 함수에 넘길 때는 배열의 시작 주소가 전달되므로, 값을 바꾸지 않는 함수라면 \`const struct Student *\`로 받으면 의도가 분명해집니다.`,
  tests: [
    { input: "1\nSolo 0\n", output: "1\nSolo\n", note: "N = 1, 0점이어도 평균과 같음" },
    { input: "3\nAa 50\nBb 50\nCc 50\n", output: "3\nAa\nBb\nCc\n", note: "모든 점수가 같으면 전원 포함" },
    { input: "2\nKim 1\nLee 2\n", output: "1\nLee\n", note: "평균 1.5 (정수 나눗셈 시 1이 되어 Kim이 잘못 포함됨)" },
    { input: "4\nA 78\nB 79\nC 78\nD 79\n", output: "2\nB\nD\n", note: "평균 78.5, 소수 평균 경계" },
    { input: "3\nABCDEFGHIJKLMNOPQRST 100\nz 0\nMid 100\n", output: "2\nABCDEFGHIJKLMNOPQRST\nMid\n", note: "20글자 이름, 점수 범위 양 끝" },
    { ...caseOf(hundred), note: "N = 100 최대 입력" },
  ],
};

export default problem;
