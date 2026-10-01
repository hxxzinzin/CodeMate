import type { ContentTestCase, ProblemContent } from "../../types.ts";

/** 테스트 데이터 생성용 결정적 난수 (매번 같은 입력이 만들어진다) */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return (max: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % max;
  };
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * 기대 출력은 슬라이딩 윈도우가 아닌 단순 탐색으로 계산한다.
 * 문자 종류가 62가지라 각 시작점에서 최대 63글자만 보면 되므로 큰 입력에서도 빠르다.
 */
function expected(s: string): string {
  let bestLen = 0;
  let bestStart = 0;
  for (let start = 0; start < s.length; start++) {
    const seen = new Set<string>();
    let end = start;
    while (end < s.length && !seen.has(s[end])) {
      seen.add(s[end]);
      end++;
    }
    if (end - start > bestLen) {
      bestLen = end - start;
      bestStart = start;
    }
  }
  return `${bestLen}\n${s.slice(bestStart, bestStart + bestLen)}\n`;
}

function makeTest(s: string, note: string): ContentTestCase {
  return { input: `${s}\n`, output: expected(s), note };
}

function randomString(length: number, alphabetSize: number, seed: number): string {
  const rand = createRandom(seed);
  let s = "";
  for (let i = 0; i < length; i++) s += ALPHABET[rand(alphabetSize)];
  return s;
}

const problem: ProblemContent = {
  slug: "longest-unique-substring",
  title: "중복 없는 가장 긴 부분 문자열",
  difficulty: 3,
  estimatedMinutes: 35,
  languages: ["java"],
  tags: {
    algorithm: ["sliding-window"],
    data_structure: ["hashmap", "string"],
    java: ["collection"],
  },
  description: `보안팀은 암호 문자열 S에서 "같은 문자가 두 번 이상 나오지 않는 구간"이 얼마나 길게 이어지는지 분석하려고 합니다.

S의 **연속된** 일부분(부분 문자열) 중에서 모든 문자가 서로 다른 것을 찾고, 그중 가장 긴 것의 길이와 내용을 구하세요.

- 대문자와 소문자는 서로 다른 문자로 봅니다. 예를 들어 \`a\`와 \`A\`는 다른 문자입니다.
- 가장 긴 부분 문자열이 여러 개라면 S에서 **가장 앞에서 시작하는 것**을 출력합니다.`,
  input: `첫째 줄에 문자열 S가 주어집니다.`,
  output: `첫째 줄에 모든 문자가 서로 다른 가장 긴 부분 문자열의 길이를 출력합니다.

둘째 줄에 그 부분 문자열을 출력합니다.`,
  constraints: `- 1 ≤ S의 길이 ≤ 100,000
- S는 영문 대문자, 영문 소문자, 숫자로만 이루어져 있습니다.`,
  examples: [
    {
      input: "abcabcbb\n",
      output: "3\nabc\n",
      explanation: "abc, bca, cab 등 길이 3인 부분 문자열이 여러 개 있고, 길이 4 이상은 반드시 같은 문자가 들어갑니다. 가장 앞에서 시작하는 abc를 출력합니다.",
    },
    {
      input: "aAbBaa\n",
      output: "4\naAbB\n",
      explanation: "a와 A는 다른 문자이므로 aAbB는 중복이 없습니다. 길이 4인 aAbB와 AbBa 중 앞에서 시작하는 aAbB를 출력합니다.",
    },
  ],
  hints: [
    "모든 시작점과 끝점을 검사하면 너무 느립니다. 구간의 왼쪽 끝과 오른쪽 끝을 둘 다 \"앞으로만\" 움직이면서 중복 없는 상태를 유지할 수 있지 않을까요?",
    "오른쪽 끝에 새 문자를 넣었더니 중복이 생겼다면, 왼쪽 끝을 어디까지 옮겨야 중복이 사라질까요? 그 문자가 \"마지막으로 나온 위치\"를 알고 있다면 한 번에 옮길 수 있습니다. 단, 그 위치가 이미 현재 구간보다 왼쪽에 있다면 왼쪽 끝을 뒤로 되돌리면 안 됩니다.",
    "HashMap에 \"문자 → 마지막으로 나온 인덱스\"를 저장하며 슬라이딩 윈도우를 씁니다. right를 0부터 끝까지 옮기면서, 현재 문자가 구간 [left, right) 안에 이미 있으면 left를 그 위치 + 1로 옮깁니다. 매번 구간 길이가 최댓값보다 \"엄격히 클 때만\" 길이와 시작 위치를 갱신합니다.",
    "last = 빈 HashMap   // 문자 → 마지막 인덱스\nleft = 0, bestLen = 0, bestStart = 0\nfor right in 0..len-1:\n  c = S[right]\n  if last에 c가 있고 last[c] >= left:\n    left = last[c] + 1\n  last[c] = right\n  if right - left + 1 > bestLen:\n    bestLen = right - left + 1\n    bestStart = left\n출력 bestLen\n출력 S.substring(bestStart, bestStart + bestLen)",
  ],
  solution: `**슬라이딩 윈도우**와 **HashMap**을 함께 사용합니다. 구간 [left, right]가 항상 중복 없는 문자열이 되도록 유지하면서 right를 한 칸씩 늘립니다.

- HashMap에 각 문자가 마지막으로 나온 인덱스를 저장합니다.
- 새 문자 c가 이미 구간 안(\`last[c] >= left\`)에 있다면 \`left = last[c] + 1\`로 옮겨 중복을 없앱니다.
- \`last[c] < left\`라면 그 문자는 이미 구간 밖이므로 left를 움직이지 않습니다. 이 조건이 없으면 left가 뒤로 돌아가 중복이 있는 구간을 답으로 셀 수 있습니다. (예: \`abba\`에서 마지막 a를 처리할 때)
- 길이가 최댓값보다 **엄격히 클 때만** 갱신하면 동점일 때 가장 앞의 부분 문자열이 남습니다.

left와 right 모두 앞으로만 움직이므로 전체 O(N)입니다.

**시간복잡도** O(N)
**공간복잡도** O(K) (K는 문자 종류 수, 최대 62)

**자주 하는 실수**
- \`last[c] >= left\` 확인 없이 \`left = last[c] + 1\`을 해서 left가 뒤로 이동
- 대소문자를 같은 문자로 취급
- \`>=\`로 비교해 동점일 때 뒤쪽 부분 문자열을 출력
- 모든 시작점마다 Set을 새로 만들어 검사하는 O(N × K) 풀이도 이 제한에서는 통과할 수 있지만, 문자 종류가 많아지면 느려집니다.

**Java 팁**
- \`HashMap<Character, Integer>\`에서 \`getOrDefault(c, -1)\`을 쓰면 처음 나온 문자도 한 번에 처리할 수 있습니다.
- 문자 종류가 정해져 있다면 \`int[128]\` 배열로 바꿔 더 빠르게 만들 수도 있습니다.`,
  tests: [
    makeTest("z", "길이 1 최소 입력"),
    makeTest("aaaaa", "모든 문자가 같음"),
    makeTest(ALPHABET, "62개 문자가 모두 다름 (문자열 전체가 답)"),
    makeTest("abba", "left가 뒤로 돌아가면 안 되는 경우"),
    makeTest("tmmzuxt", "중복 문자가 구간 밖에 있는 경우"),
    makeTest("xyzXYZ0xyz", "대소문자·숫자 혼합"),
    makeTest(randomString(100_000, 62, 5150), "길이 100,000, 62가지 문자 무작위"),
    makeTest(randomString(100_000, 3, 8), "길이 100,000, 3가지 문자만 사용 (동점이 매우 많음)"),
  ],
};

export default problem;
