import type { ContentTestCase, ProblemContent } from "../../types.ts";

/** 테스트 데이터 생성용 결정적 난수 (매번 같은 입력이 만들어진다) */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return (max: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % max;
  };
}

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

/** N = 100,000 큰 입력. 기대 출력은 JS 기본 정렬로 따로 계산한다. */
function largeTest(): ContentTestCase {
  const n = 100_000;
  const rand = createRandom(99);
  const students = Array.from({ length: n }, (_, i) => {
    // 앞 4글자로 i를 표현해 이름이 겹치지 않게 하고, 뒤에 0~6글자를 덧붙인다
    let name = "";
    let x = (i * 7919) % 456_976; // 26^4, 7919는 26과 서로소라 서로 다른 값이 나온다
    for (let d = 0; d < 4; d++) {
      name = LETTERS[x % 26] + name;
      x = Math.floor(x / 26);
    }
    const extra = rand(7);
    for (let d = 0; d < extra; d++) name += LETTERS[rand(26)];
    return { name, score: rand(101) };
  });
  const sorted = [...students].sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });
  return {
    input: `${n}\n${students.map((s) => `${s.name} ${s.score}`).join("\n")}\n`,
    output: sorted.map((s) => `${s.name} ${s.score}`).join("\n") + "\n",
    note: "N = 100,000 최대 입력, 동점자가 매우 많음",
  };
}

const problem: ProblemContent = {
  slug: "student-ranking",
  title: "성적순 정렬",
  difficulty: 2,
  estimatedMinutes: 25,
  languages: ["java", "c"],
  tags: {
    algorithm: ["sorting"],
    java: ["comparator", "oop"],
    c: ["struct"],
  },
  description: `코딩 동아리에서 모의 코딩테스트를 치렀습니다. 운영진은 N명의 이름과 점수를 모아 순위표를 만들려고 합니다. 순위표는 다음 규칙에 따라 위에서부터 정렬합니다.

1. 점수가 **높은** 학생이 먼저 옵니다.
2. 점수가 같다면 이름이 **사전순으로 앞서는** 학생이 먼저 옵니다.

사전순은 알파벳을 앞 글자부터 차례로 비교하며, 한 이름이 다른 이름의 앞부분과 완전히 같다면 더 짧은 이름이 앞섭니다. 예를 들어 \`kim\`은 \`kimi\`보다 앞섭니다.

규칙에 맞게 정렬한 순위표를 출력하세요.`,
  input: `첫째 줄에 학생 수 N이 주어집니다.

둘째 줄부터 N개의 줄에 걸쳐 학생의 이름과 점수가 공백으로 구분되어 한 줄에 한 명씩 주어집니다.`,
  output: `정렬한 순서대로 N개의 줄에 걸쳐 각 학생의 이름과 점수를 공백 하나로 구분해 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 100,000
- 이름은 알파벳 소문자로만 이루어져 있고, 길이는 1 이상 10 이하입니다.
- 모든 학생의 이름은 서로 다릅니다.
- 0 ≤ 점수 ≤ 100 (정수)`,
  examples: [
    {
      input: "5\njiho 90\nminsu 85\nara 90\nyuna 100\nbora 85\n",
      output: "yuna 100\nara 90\njiho 90\nbora 85\nminsu 85\n",
      explanation: "100점인 yuna가 맨 위에 옵니다. 90점인 ara와 jiho는 이름 사전순으로 ara가 먼저, 85점인 bora와 minsu도 bora가 먼저 옵니다.",
    },
    {
      input: "3\nkimi 70\nkim 70\nki 70\n",
      output: "ki 70\nkim 70\nkimi 70\n",
      explanation: "세 명의 점수가 모두 같습니다. ki가 kim의 앞부분과 같고 kim이 kimi의 앞부분과 같으므로 짧은 이름부터 옵니다.",
    },
  ],
  hints: [
    "정렬 함수는 \"두 학생 중 누가 먼저 와야 하는가\"만 알려 주면 나머지를 알아서 해 줍니다. 두 학생을 비교하는 규칙을 어떻게 표현할 수 있을까요?",
    "기준이 두 개입니다. 첫 번째 기준(점수)으로 순서가 정해지면 두 번째 기준은 볼 필요가 없고, 첫 번째 기준이 같을 때만 두 번째 기준(이름)을 봅니다. 점수는 내림차순, 이름은 오름차순이라는 점도 주의하세요.",
    "이름과 점수를 하나로 묶는 클래스(Java) 또는 구조체(C)를 만들고, 비교 함수에서 점수가 다르면 점수가 큰 쪽을 앞으로, 같으면 문자열 비교 결과로 순서를 정합니다. 그 다음 언어가 제공하는 정렬 함수에 비교 함수를 넘깁니다.",
    "compare(a, b):\n  if a.score != b.score:\n    return b.score - a.score   // 점수 내림차순\n  return a.name과 b.name의 사전순 비교 결과   // 이름 오름차순\n\nstudents를 compare 기준으로 정렬\n각 학생에 대해 \"이름 점수\" 출력",
  ],
  solution: `학생 한 명의 정보(이름, 점수)를 하나로 묶고, **다중 기준 비교 함수**를 정의해 정렬합니다.

비교 규칙
1. 점수가 다르면 점수가 큰 학생이 앞 → \`b.score - a.score\`
2. 점수가 같으면 이름 사전순 → Java는 \`a.name.compareTo(b.name)\`, C는 \`strcmp(a->name, b->name)\`

두 메서드 모두 "한쪽이 다른 쪽의 앞부분이면 짧은 쪽이 작다"는 규칙을 이미 따르므로 따로 처리할 필요가 없습니다.

**시간복잡도** O(N log N × L) (L은 이름 길이, 최대 10)
**공간복잡도** O(N)

**자주 하는 실수**
- 점수와 이름을 각각 다른 배열에 저장한 뒤 한쪽만 정렬해서 짝이 어긋남
- 점수를 오름차순으로 정렬하거나, 동점일 때 이름을 내림차순으로 정렬
- C에서 \`==\`로 문자열을 비교 (주소를 비교하게 됨) → \`strcmp\`를 써야 합니다.
- 출력이 최대 100,000줄인데 매 줄 출력 함수를 따로 호출해 느려짐

**언어별 팁**
- Java: \`Comparator.comparingInt((Student s) -> s.score).reversed().thenComparing(s -> s.name)\`처럼 조합할 수도 있고, 람다 하나로 직접 비교해도 됩니다. 출력은 \`StringBuilder\`로 모아서 하세요.
- C: \`struct\`에 \`char name[11]\`(널 문자 포함)과 \`int score\`를 두고 \`qsort\`의 비교 함수에서 \`const struct Student *\`로 형 변환해 비교합니다.`,
  tests: [
    { input: "1\nsolo 0\n", output: "solo 0\n", note: "N = 1 최소 입력" },
    {
      input: "4\nzed 0\nabc 0\nmid 0\naaaaaaaaaa 0\n",
      output: "aaaaaaaaaa 0\nabc 0\nmid 0\nzed 0\n",
      note: "모두 동점(0점)이면 이름 사전순, 길이 10인 이름",
    },
    {
      input: "4\na 0\nb 100\nc 50\nd 100\n",
      output: "b 100\nd 100\nc 50\na 0\n",
      note: "점수 최솟값·최댓값",
    },
    {
      input: "5\ne 10\nd 20\nc 30\nb 40\na 50\n",
      output: "a 50\nb 40\nc 30\nd 20\ne 10\n",
      note: "점수가 모두 달라 첫 번째 기준만으로 순서가 정해짐",
    },
    largeTest(),
  ],
};

export default problem;
