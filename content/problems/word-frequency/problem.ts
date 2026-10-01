import type { ProblemContent } from "../../types.ts";

// 큰 입력 생성용 의사 난수 (매번 같은 값이 나오도록 시드 고정)
function makeRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s;
  };
}

// 기대 출력은 정답 코드와 별개로 JS의 Map과 문자열 비교로 계산한다.
function caseOf(words: string[]) {
  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
  let bestWord = "";
  let bestCount = 0;
  for (const [w, c] of counts) {
    if (c > bestCount || (c === bestCount && w < bestWord)) {
      bestWord = w;
      bestCount = c;
    }
  }
  return { input: `${words.length}\n${words.join(" ")}\n`, output: `${bestWord} ${bestCount}\n` };
}

const rand = makeRandom(777);
const vocabulary: string[] = [];
for (let i = 0; i < 300; i++) {
  const len = (rand() % 10) + 1;
  let w = "";
  for (let j = 0; j < len; j++) w += String.fromCharCode(97 + (rand() % 26));
  vocabulary.push(w);
}
const randomWords: string[] = [];
for (let i = 0; i < 100000; i++) {
  // 앞쪽 단어일수록 자주 나오도록 두 난수 중 작은 쪽을 고른다.
  const idx = Math.min(rand() % vocabulary.length, rand() % vocabulary.length);
  randomWords.push(vocabulary[idx]);
}
const tieWords: string[] = [];
for (let i = 0; i < 50000; i++) tieWords.push("zebra", "apple");

const problem: ProblemContent = {
  slug: "word-frequency",
  title: "단어 빈도 세기",
  difficulty: 2,
  estimatedMinutes: 25,
  languages: ["java"],
  tags: {
    algorithm: ["frequency-count"],
    data_structure: ["hashmap"],
    java: ["collection"],
  },
  description: `인터넷 서점이 독자 리뷰에서 가장 많이 언급된 단어를 찾아 \"오늘의 키워드\"로 보여주려고 합니다.

N개의 단어가 주어질 때, **가장 많이 등장한 단어**와 그 단어의 등장 횟수를 구하세요.

가장 많이 등장한 단어가 여러 개라면, 그중 **사전 순으로 가장 앞서는 단어**를 출력합니다. 사전 순은 앞 글자부터 차례로 알파벳 순서를 비교하며, 한 단어가 다른 단어의 앞부분과 같다면 더 짧은 단어가 앞섭니다. (예: \`ab\`는 \`abc\`보다 앞섭니다.)`,
  input: `첫째 줄에 단어의 개수 N이 주어집니다.
둘째 줄에 N개의 단어가 공백 하나로 구분되어 주어집니다.`,
  output: `가장 많이 등장한 단어와 그 등장 횟수를 공백 하나로 구분하여 출력합니다.`,
  constraints: `- 1 ≤ N ≤ 100,000
- 각 단어는 영어 소문자로만 이루어져 있고, 길이는 1 이상 10 이하입니다.`,
  examples: [
    {
      input: "7\napple banana apple cherry banana apple kiwi\n",
      output: "apple 3\n",
      explanation: "apple이 3번, banana가 2번, cherry와 kiwi가 1번씩 나옵니다. 가장 많이 나온 단어는 apple입니다.",
    },
    {
      input: "6\ndog cat bird cat dog fish\n",
      output: "cat 2\n",
      explanation: "dog와 cat이 2번씩으로 가장 많습니다. 사전 순으로 cat이 dog보다 앞서므로 cat을 출력합니다.",
    },
  ],
  hints: [
    "단어마다 \"몇 번 나왔는지\"를 기록해야 합니다. 단어를 열쇠로, 횟수를 값으로 저장할 수 있는 자료구조는 무엇일까요?",
    "횟수를 다 센 다음 답을 고를 때, 횟수가 같은 단어가 여러 개라면 어떻게 비교해야 할까요? 먼저 나온 단어가 답이 아니라는 점에 주의하세요.",
    "HashMap<String, Integer>에 단어별 등장 횟수를 셉니다. 그다음 모든 항목을 훑으면서 \"횟수가 더 크거나, 횟수가 같고 단어가 사전 순으로 더 앞서면\" 답을 갱신합니다. 문자열의 사전 순 비교는 compareTo로 할 수 있습니다.",
    "counts = 빈 HashMap\nfor 단어 w:\n  counts[w] = counts[w] + 1 (없으면 1)\nbestWord = 없음, bestCount = 0\nfor (w, c) in counts:\n  if c > bestCount 또는 (c == bestCount 이고 w < bestWord):\n    bestWord = w, bestCount = c\n출력 bestWord, bestCount",
  ],
  solution: `단어별 등장 횟수를 **HashMap**으로 센 뒤, 조건에 맞는 단어를 하나 고릅니다.

1. \`HashMap<String, Integer>\`에 단어마다 횟수를 셉니다. \`counts.merge(word, 1, Integer::sum)\` 또는 \`counts.put(word, counts.getOrDefault(word, 0) + 1)\`을 사용할 수 있습니다.
2. 모든 항목을 훑으며 다음 중 하나이면 답을 바꿉니다.
   - 횟수가 지금까지의 최댓값보다 큼
   - 횟수가 같고 \`word.compareTo(bestWord) < 0\` (사전 순으로 더 앞섬)
3. 답 단어와 횟수를 출력합니다.

**HashMap은 순서를 보장하지 않으므로**, 동률일 때 \"먼저 꺼낸 단어\"를 답으로 하면 실행할 때마다 결과가 달라질 수 있습니다. 반드시 사전 순 비교로 동률을 처리하세요. (\`TreeMap\`을 쓰면 키가 사전 순으로 정렬되므로 횟수가 \"더 클 때만\" 갱신해도 됩니다. 대신 연산마다 O(log K)가 듭니다.)

**시간복잡도** O(N × L) (L은 단어 길이, 최대 10), **공간복잡도** O(N × L)

**자주 하는 실수**
- 동률일 때 입력에서 먼저 나온 단어나 HashMap에서 먼저 꺼낸 단어를 출력함
- 문자열을 \`==\`로 비교함 (Java에서는 \`equals\`, 순서 비교는 \`compareTo\`)
- \`Scanner\`로 10만 개 단어를 읽으면 느리므로 \`BufferedReader\`와 \`StringTokenizer\`를 사용하세요.`,
  tests: [
    { input: "1\nhello\n", output: "hello 1\n", note: "N = 1" },
    { input: "4\npear fig apple kiwi\n", output: "apple 1\n", note: "모두 한 번씩 나와 전부 동률 (입력 순서와 사전 순이 다름)" },
    { input: "4\nabc ab abc ab\n", output: "ab 2\n", note: "한 단어가 다른 단어의 앞부분인 동률" },
    { input: "5\nzoo zoo yak yak ant\n", output: "yak 2\n", note: "먼저 나온 단어가 아니라 사전 순으로 앞선 단어" },
    { input: "6\nb a b a b c\n", output: "b 3\n", note: "사전 순으로 앞선 단어보다 횟수가 많은 단어가 우선" },
    { ...caseOf(randomWords), note: "N = 100,000 큰 입력" },
    { ...caseOf(tieWords), note: "N = 100,000, 두 단어가 50,000번씩 동률" },
  ],
};

export default problem;
