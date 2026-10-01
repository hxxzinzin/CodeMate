-- 자동 생성 파일입니다. 직접 수정하지 말고 content/problems를 수정한 뒤
-- npm run content:seed 로 다시 생성하세요.
-- 문제 수: 30

begin;

-- card-queue: 카드 버리기 시뮬레이션
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('72f12e24-a825-52e9-939e-585305c4c56c', 'card-queue', '카드 버리기 시뮬레이션', '마술사가 1번부터 N번까지 번호가 적힌 카드 N장을 한 묶음으로 들고 있습니다. 카드는 1번이 맨 위, N번이 맨 아래에 오도록 차례대로 쌓여 있습니다.

마술사는 카드가 한 장 남을 때까지 다음 동작을 반복합니다.

1. 맨 위의 카드를 한 장 내려놓습니다(버립니다).
2. 그다음 맨 위에 있는 카드를 꺼내 묶음의 맨 아래로 옮깁니다.

마지막으로 남은 한 장도 내려놓으면 공연이 끝납니다. 카드가 **내려놓인 순서**를 구하세요. 마지막에 남은 카드가 가장 마지막에 내려놓인 카드입니다.', '첫째 줄에 카드의 수 N이 주어집니다.', '카드가 내려놓인 순서대로 카드 번호 N개를 공백 하나로 구분하여 한 줄에 출력합니다.', '- 1 ≤ N ≤ 100,000',
   '[{"input":"6\n","output":"1 3 5 2 6 4\n","explanation":"[1 2 3 4 5 6]에서 1을 버리고 2를 아래로 옮기면 [3 4 5 6 2], 3을 버리고 4를 옮기면 [5 6 2 4], 5를 버리고 6을 옮기면 [2 4 6], 2를 버리고 4를 옮기면 [6 4], 6을 버리고 4를 옮기면 [4]가 남습니다. 마지막으로 4를 내려놓습니다."},{"input":"4\n","output":"1 3 2 4\n","explanation":"[1 2 3 4] → 1을 버리고 [3 4 2] → 3을 버리고 [2 4] → 2를 버리고 [4]가 남습니다."}]'::jsonb, 2, 20, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '72f12e24-a825-52e9-939e-585305c4c56c';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('72f12e24-a825-52e9-939e-585305c4c56c', 'algorithm', 'simulation'),
  ('72f12e24-a825-52e9-939e-585305c4c56c', 'data_structure', 'queue');

delete from public.problem_hints where problem_id = '72f12e24-a825-52e9-939e-585305c4c56c';
insert into public.problem_hints (problem_id, level, content) values
  ('72f12e24-a825-52e9-939e-585305c4c56c', 1, '카드는 위에서 꺼내고, 옮기는 카드는 맨 아래에 넣습니다. 한쪽 끝에서 꺼내고 반대쪽 끝에 넣는 자료구조는 무엇일까요?'),
  ('72f12e24-a825-52e9-939e-585305c4c56c', 2, '배열에서 맨 앞 원소를 지우고 나머지를 한 칸씩 당기면, N이 100,000일 때 얼마나 많은 이동이 일어날까요? 원소를 옮기지 않고 "맨 앞이 어디인지"만 기억하는 방법을 생각해보세요.'),
  ('72f12e24-a825-52e9-939e-585305c4c56c', 3, '큐에 1부터 N까지 넣습니다. 큐에 두 장 이상 남아 있는 동안 "앞에서 하나 꺼내 출력 목록에 추가" → "앞에서 하나 더 꺼내 뒤에 다시 넣기"를 반복합니다. 마지막 한 장도 출력 목록에 추가합니다.'),
  ('72f12e24-a825-52e9-939e-585305c4c56c', 4, 'queue = [1, 2, ..., N]
while queue 크기 > 1:
  결과에 queue.poll() 추가
  queue.offer(queue.poll())
결과에 queue.poll() 추가
결과를 공백으로 이어 출력');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('72f12e24-a825-52e9-939e-585305c4c56c', '카드를 **위(앞)에서 꺼내고 아래(뒤)에 넣는** 동작이므로 큐(FIFO)로 그대로 시뮬레이션합니다.

1. 큐에 1부터 N까지 차례로 넣습니다.
2. 큐의 크기가 2 이상인 동안
   - 앞에서 꺼낸 카드를 결과에 추가합니다. (버리기)
   - 다시 앞에서 꺼낸 카드를 뒤에 넣습니다. (아래로 옮기기)
3. 남은 한 장을 결과에 추가하고, 결과를 한 줄로 출력합니다.

한 번 반복할 때마다 카드가 한 장씩 줄어들므로 반복은 N - 1번입니다.

**C에서 큐 구현**: 크기 2N인 배열과 `head`, `tail` 두 인덱스를 씁니다. 꺼낼 때는 `queue[head++]`, 넣을 때는 `queue[tail++] = x`입니다. 처음 N번 넣고 이후 최대 N - 1번 더 넣으므로 2N칸이면 충분합니다. (원형 큐로 만들면 N칸으로도 됩니다.)

**시간복잡도** O(N), **공간복잡도** O(N)

**자주 하는 실수**
- 배열의 맨 앞을 지우고 나머지를 당기는 방식으로 구현해 O(N²)이 되어 느림
- 마지막에 남은 카드를 출력하지 않음
- N = 1일 때 반복문에 들어가지 않으므로 남은 카드 1만 출력되어야 함
- Java에서 결과를 `System.out.print`로 10만 번 출력하면 느립니다. `StringBuilder`에 모았다가 한 번에 출력하세요.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(br.readLine().trim());\n\n        Deque<Integer> queue = new ArrayDeque<>();\n        for (int i = 1; i <= n; i++) {\n            queue.offer(i);\n        }\n\n        StringBuilder sb = new StringBuilder();\n        while (queue.size() > 1) {\n            sb.append(queue.poll()).append('' '');  // 맨 위 카드를 버린다\n            queue.offer(queue.poll());            // 다음 카드를 맨 아래로 옮긴다\n        }\n        sb.append(queue.poll());\n        System.out.println(sb);\n    }\n}\n","c":"#include <stdio.h>\n\n#define MAX_N 100000\n\n/* 처음 N번 넣고 이후 최대 N - 1번 더 넣으므로 2N칸이면 충분하다. */\nint queue[2 * MAX_N];\nint head = 0;\nint tail = 0;\n\nvoid push(int x) {\n    queue[tail++] = x;\n}\n\nint pop(void) {\n    return queue[head++];\n}\n\nint size(void) {\n    return tail - head;\n}\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n\n    for (int i = 1; i <= n; i++) {\n        push(i);\n    }\n\n    while (size() > 1) {\n        printf(\"%d \", pop());  /* 맨 위 카드를 버린다 */\n        push(pop());           /* 다음 카드를 맨 아래로 옮긴다 */\n    }\n    printf(\"%d\\n\", pop());\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- coin-change: 동전으로 금액 만들기
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('019798fc-c41a-56c0-8812-f8d2e986df1b', 'coin-change', '동전으로 금액 만들기', '어느 나라의 동전은 액면가가 조금 특이합니다. 동전은 N종류가 있고, 각 종류의 동전은 원하는 만큼 얼마든지 사용할 수 있습니다.

동전을 골라 액면가의 합이 정확히 K원이 되도록 하려고 합니다. 이때 사용하는 **동전 개수의 최솟값**을 구하세요. 어떻게 해도 정확히 K원을 만들 수 없다면 `-1`을 출력합니다.

액면가가 특이하기 때문에, 큰 동전부터 최대한 많이 쓰는 방법이 항상 최소 개수가 되는 것은 아닙니다.', '첫째 줄에 동전 종류의 수 N과 만들어야 하는 금액 K가 공백으로 구분되어 주어집니다.

둘째 줄에 N개의 동전 액면가가 공백으로 구분되어 주어집니다.', 'K원을 만드는 데 필요한 동전 개수의 최솟값을 출력합니다. 만들 수 없으면 `-1`을 출력합니다.', '- 1 ≤ N ≤ 100
- 1 ≤ K ≤ 100,000
- 1 ≤ 각 동전의 액면가 ≤ 10,000
- 같은 액면가의 동전이 여러 번 주어질 수 있습니다.',
   '[{"input":"3 6\n1 3 4\n","output":"2\n","explanation":"3원 동전 2개로 6원을 만들 수 있습니다. 큰 동전부터 쓰면 4 + 1 + 1로 3개가 필요하므로, 큰 동전부터 고르는 방법은 최소가 아닙니다."},{"input":"2 9\n5 7\n","output":"-1\n","explanation":"5원과 7원 동전을 어떻게 조합해도 합이 정확히 9원이 되지 않습니다."}]'::jsonb, 3, 40, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '019798fc-c41a-56c0-8812-f8d2e986df1b';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('019798fc-c41a-56c0-8812-f8d2e986df1b', 'algorithm', 'dp'),
  ('019798fc-c41a-56c0-8812-f8d2e986df1b', 'data_structure', 'array');

delete from public.problem_hints where problem_id = '019798fc-c41a-56c0-8812-f8d2e986df1b';
insert into public.problem_hints (problem_id, level, content) values
  ('019798fc-c41a-56c0-8812-f8d2e986df1b', 1, 'K원을 만드는 마지막 동전이 c원이라고 해 봅시다. 그러면 그 앞까지는 몇 원을 만든 상태였을까요? 큰 문제를 더 작은 금액의 같은 문제로 나눌 수 있는지 생각해보세요.'),
  ('019798fc-c41a-56c0-8812-f8d2e986df1b', 2, '작은 금액의 답을 이미 알고 있다면 큰 금액의 답을 빠르게 구할 수 있습니다. 같은 금액의 답을 여러 번 다시 계산하지 않으려면 어디에 저장해 두면 좋을까요? 또 "만들 수 없음"은 어떤 값으로 표현할지 정해 두세요.'),
  ('019798fc-c41a-56c0-8812-f8d2e986df1b', 3, '동적 계획법(DP)을 사용합니다. dp[x]를 "x원을 만드는 최소 동전 개수"로 정의하면 dp[0] = 0이고, dp[x] = min(dp[x - c] + 1) (c는 x 이하인 모든 동전)입니다. 만들 수 없는 금액은 아주 큰 값(무한대)으로 두면 계산이 간단해집니다.'),
  ('019798fc-c41a-56c0-8812-f8d2e986df1b', 4, 'INF = K + 1   // 동전 개수는 K를 넘을 수 없음
dp[0..K] = INF, dp[0] = 0
for x = 1 to K:
  for c in coins:
    if c <= x and dp[x - c] + 1 < dp[x]:
      dp[x] = dp[x - c] + 1
출력 (dp[K] == INF) ? -1 : dp[K]');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('019798fc-c41a-56c0-8812-f8d2e986df1b', '큰 동전부터 최대한 쓰는 **그리디는 틀립니다.** 예제 1처럼 동전이 1, 3, 4원이면 6원을 4 + 1 + 1(3개)로 만들지만, 정답은 3 + 3(2개)입니다. 모든 경우를 따져 보되 중복 계산을 없애는 **동적 계획법(DP)**을 사용합니다.

**점화식**
- `dp[x]` = x원을 만드는 최소 동전 개수
- `dp[0] = 0` (아무 동전도 쓰지 않음)
- `dp[x] = min(dp[x - c] + 1)` — 마지막으로 쓴 동전이 c원이라면, 그 전까지 x - c원을 최소 개수로 만들었어야 합니다.

만들 수 없는 금액은 "무한대"로 둡니다. 동전은 최소 1원이므로 개수는 K를 넘을 수 없고, 따라서 `K + 1`을 무한대로 쓰면 오버플로 걱정 없이 `+ 1`을 계산할 수 있습니다. 마지막에 `dp[K]`가 여전히 무한대이면 `-1`을 출력합니다.

**시간복잡도** O(N × K) — 최대 100 × 100,000 = 1,000만 번
**공간복잡도** O(K)

**자주 하는 실수**
- 그리디로 풀어서 예제 1 같은 경우를 틀리는 실수
- 무한대로 `Integer.MAX_VALUE`(C에서는 `INT_MAX`)를 쓰고 `+ 1`을 해서 오버플로가 나는 실수
- 만들 수 없는 경우를 처리하지 않고 무한대 값을 그대로 출력하는 실수
- 재귀로 풀면서 메모이제이션을 하지 않아 시간 초과가 나는 실수

**언어별 팁**
- Java: `Arrays.fill(dp, INF)`로 한 번에 초기화할 수 있습니다.
- C: 크기 100,001인 배열은 전역으로 선언하는 것이 안전합니다.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int n = Integer.parseInt(st.nextToken());\n        int k = Integer.parseInt(st.nextToken());\n\n        int[] coins = new int[n];\n        st = new StringTokenizer(br.readLine());\n        for (int i = 0; i < n; i++) {\n            coins[i] = Integer.parseInt(st.nextToken());\n        }\n\n        System.out.println(minCoins(coins, k));\n    }\n\n    static int minCoins(int[] coins, int k) {\n        final int INF = k + 1; // 동전 개수는 K를 넘을 수 없으므로 K + 1을 \"만들 수 없음\"으로 쓴다\n        int[] dp = new int[k + 1];\n        Arrays.fill(dp, INF);\n        dp[0] = 0;\n\n        for (int x = 1; x <= k; x++) {\n            for (int c : coins) {\n                if (c <= x && dp[x - c] + 1 < dp[x]) {\n                    dp[x] = dp[x - c] + 1;\n                }\n            }\n        }\n        return dp[k] == INF ? -1 : dp[k];\n    }\n}\n","c":"#include <stdio.h>\n\n#define MAX_N 100\n#define MAX_K 100000\n\nint coins[MAX_N];\nint dp[MAX_K + 1];\n\nint main(void) {\n    int n, k;\n    if (scanf(\"%d %d\", &n, &k) != 2) return 0;\n    for (int i = 0; i < n; i++) {\n        scanf(\"%d\", &coins[i]);\n    }\n\n    const int INF = k + 1; /* 동전 개수는 K를 넘을 수 없으므로 K + 1을 \"만들 수 없음\"으로 쓴다 */\n    dp[0] = 0;\n    for (int x = 1; x <= k; x++) {\n        dp[x] = INF;\n        for (int i = 0; i < n; i++) {\n            int c = coins[i];\n            if (c <= x && dp[x - c] + 1 < dp[x]) {\n                dp[x] = dp[x - c] + 1;\n            }\n        }\n    }\n\n    printf(\"%d\\n\", dp[k] == INF ? -1 : dp[k]);\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- count-islands: 섬의 개수
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('92903a66-6f00-5020-a916-13976ee03114', 'count-islands', '섬의 개수', '탐사선이 바다 위를 촬영해 N행 M열 격자 모양의 지도를 만들었습니다. 지도의 각 칸은 땅(`1`) 또는 바다(`0`)입니다.

땅인 칸끼리 **상하좌우**로 맞닿아 있으면 같은 섬에 속합니다. 대각선으로만 맞닿은 칸은 서로 다른 섬입니다. 즉, 상하좌우로 이어진 땅 칸들의 덩어리 하나가 섬 하나입니다.

지도에 섬이 모두 몇 개 있는지 구하세요.', '첫째 줄에 지도의 크기 N과 M이 공백으로 구분되어 주어집니다.

둘째 줄부터 N개의 줄에 걸쳐 지도의 각 행이 주어집니다. 각 행은 `0`과 `1`로만 이루어진 길이 M의 문자열이며, 공백 없이 주어집니다.', '섬의 개수를 출력합니다. 땅이 하나도 없으면 `0`을 출력합니다.', '- 1 ≤ N, M ≤ 50
- 지도의 바깥은 모두 바다라고 생각합니다.',
   '[{"input":"4 5\n11000\n11010\n00010\n10001\n","output":"4\n","explanation":"왼쪽 위의 2×2 땅, 4번째 열에 세로로 이어진 2칸, 왼쪽 아래 1칸, 오른쪽 아래 1칸으로 섬이 4개입니다."},{"input":"3 3\n101\n010\n101\n","output":"5\n","explanation":"땅 5칸이 모두 대각선으로만 맞닿아 있으므로 각각이 별개의 섬입니다."}]'::jsonb, 3, 35, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '92903a66-6f00-5020-a916-13976ee03114';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('92903a66-6f00-5020-a916-13976ee03114', 'algorithm', 'dfs'),
  ('92903a66-6f00-5020-a916-13976ee03114', 'algorithm', 'recursion'),
  ('92903a66-6f00-5020-a916-13976ee03114', 'data_structure', 'graph'),
  ('92903a66-6f00-5020-a916-13976ee03114', 'c', 'recursion');

delete from public.problem_hints where problem_id = '92903a66-6f00-5020-a916-13976ee03114';
insert into public.problem_hints (problem_id, level, content) values
  ('92903a66-6f00-5020-a916-13976ee03114', 1, '땅 칸 하나에서 출발해 상하좌우로 이어진 땅을 모두 찾아내면 섬 하나가 완성됩니다. 이런 "연결된 영역 찾기"에는 어떤 탐색 방법을 쓸 수 있을까요?'),
  ('92903a66-6f00-5020-a916-13976ee03114', 2, '이미 어떤 섬에 포함된 칸에서 다시 탐색을 시작하면 같은 섬을 두 번 세게 됩니다. 한 번 확인한 땅 칸을 어떻게 표시해 둘지 생각해보세요.'),
  ('92903a66-6f00-5020-a916-13976ee03114', 3, '지도의 모든 칸을 차례로 보면서, 아직 방문하지 않은 땅 칸을 만나면 섬의 개수를 1 늘리고 그 칸에서 DFS를 시작해 이어진 땅을 모두 방문 처리합니다. DFS는 "현재 칸을 방문 표시하고, 상하좌우의 방문하지 않은 땅 칸에 대해 자기 자신을 다시 호출"하는 재귀 함수로 만들 수 있습니다.'),
  ('92903a66-6f00-5020-a916-13976ee03114', 4, 'dfs(r, c):
  visited[r][c] = true
  for (nr, nc) in (r, c)의 상하좌우:
    if 지도 안이고 땅이고 !visited[nr][nc]:
      dfs(nr, nc)

count = 0
for 모든 칸 (r, c):
  if 땅이고 !visited[r][c]:
    count++
    dfs(r, c)
출력 count');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('92903a66-6f00-5020-a916-13976ee03114', '격자를 그래프로 보면, 땅 칸이 정점이고 상하좌우로 맞닿은 땅 칸 사이에 간선이 있습니다. 섬의 개수는 이 그래프의 **연결 요소 개수**입니다.

1. 모든 칸을 왼쪽 위부터 차례로 확인합니다.
2. 방문하지 않은 땅 칸을 만나면 새로운 섬을 발견한 것이므로 개수를 1 늘립니다.
3. 그 칸에서 **DFS(깊이 우선 탐색)**를 시작해 상하좌우로 이어진 땅을 모두 방문 표시합니다. 이렇게 하면 같은 섬의 다른 칸에서 다시 개수를 세지 않습니다.

DFS는 재귀로 짧게 작성할 수 있습니다. "현재 칸을 방문 표시하고, 네 방향 이웃 중 방문하지 않은 땅 칸에 대해 다시 dfs를 호출"하면 됩니다. 재귀는 더 갈 곳이 없을 때 자연스럽게 끝납니다.

**시간복잡도** O(N × M) — 각 칸은 한 번만 방문합니다.
**공간복잡도** O(N × M) — 방문 배열과 재귀 호출 스택 (최악의 경우 땅 칸 수만큼 깊어집니다)

**자주 하는 실수**
- 방문 표시를 하지 않거나 늦게 해서 같은 칸을 무한히 오가는 실수
- 대각선 방향까지 탐색해서 섬을 합쳐 버리는 실수
- 범위 검사를 이웃 칸에 접근한 **뒤에** 해서 배열 범위를 벗어나는 실수

**재귀 깊이에 대해**
이 문제는 격자가 최대 50 × 50이라 재귀 깊이가 최대 2,500 정도로 안전합니다. 격자가 훨씬 크다면 재귀 대신 직접 만든 스택이나 BFS 큐를 사용해야 스택 오버플로를 피할 수 있습니다.

**언어별 팁**
- Java: 방문 배열 대신 지도의 `''1''`을 `''0''`으로 바꿔 방문 표시를 하면 메모리를 아낄 수 있습니다.
- C: 지도와 방문 배열을 전역으로 두면 재귀 함수에 인자로 넘기지 않아도 되어 코드가 간결해집니다.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    static final int[] DR = {-1, 1, 0, 0};\n    static final int[] DC = {0, 0, -1, 1};\n\n    static int n, m;\n    static char[][] map;\n\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        n = Integer.parseInt(st.nextToken());\n        m = Integer.parseInt(st.nextToken());\n\n        map = new char[n][];\n        for (int i = 0; i < n; i++) {\n            map[i] = br.readLine().trim().toCharArray();\n        }\n\n        int count = 0;\n        for (int r = 0; r < n; r++) {\n            for (int c = 0; c < m; c++) {\n                if (map[r][c] == ''1'') {\n                    count++;\n                    dfs(r, c);\n                }\n            }\n        }\n        System.out.println(count);\n    }\n\n    /** (r, c)와 이어진 땅을 모두 ''0''으로 바꿔 방문 표시한다. */\n    static void dfs(int r, int c) {\n        map[r][c] = ''0'';\n        for (int d = 0; d < 4; d++) {\n            int nr = r + DR[d], nc = c + DC[d];\n            if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;\n            if (map[nr][nc] == ''1'') dfs(nr, nc);\n        }\n    }\n}\n","c":"#include <stdio.h>\n\n#define MAX 50\n\nint n, m;\nchar map[MAX][MAX + 2];\nint visited[MAX][MAX];\n\nconst int DR[4] = {-1, 1, 0, 0};\nconst int DC[4] = {0, 0, -1, 1};\n\n/* (r, c)와 상하좌우로 이어진 땅을 모두 방문 표시한다. */\nvoid dfs(int r, int c) {\n    visited[r][c] = 1;\n    for (int d = 0; d < 4; d++) {\n        int nr = r + DR[d], nc = c + DC[d];\n        if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;\n        if (map[nr][nc] == ''1'' && !visited[nr][nc]) dfs(nr, nc);\n    }\n}\n\nint main(void) {\n    if (scanf(\"%d %d\", &n, &m) != 2) return 0;\n    for (int i = 0; i < n; i++) {\n        scanf(\"%51s\", map[i]);\n    }\n\n    int count = 0;\n    for (int r = 0; r < n; r++) {\n        for (int c = 0; c < m; c++) {\n            if (map[r][c] == ''1'' && !visited[r][c]) {\n                count++;\n                dfs(r, c);\n            }\n        }\n    }\n\n    printf(\"%d\\n\", count);\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- delivery-route: 배달 최단 시간
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('20907217-8f00-580f-a14e-6e78c47246ef', 'delivery-route', '배달 최단 시간', '한 도시에 배달 거점이 N개 있고, 1번부터 N번까지 번호가 붙어 있습니다. 거점 사이에는 M개의 **일방통행** 도로가 있으며, 각 도로를 지나는 데 걸리는 시간이 정해져 있습니다.

물류 센터가 있는 S번 거점에서 출발해 각 거점까지 배달할 때 걸리는 **최단 시간**을 모두 구하세요.

- 도로는 적힌 방향으로만 지날 수 있습니다. u에서 v로 가는 도로가 있어도 v에서 u로 갈 수 있는 것은 아닙니다.
- 두 거점 사이에 도로가 여러 개 있을 수 있고, 출발지와 도착지가 같은 도로가 있을 수도 있습니다.
- S번 거점에서 어떤 길로도 갈 수 없는 거점이 있을 수 있습니다.', '첫째 줄에 거점의 수 N, 도로의 수 M, 물류 센터가 있는 거점 번호 S가 공백으로 구분되어 주어집니다.

둘째 줄부터 M개의 줄에 걸쳐 도로 정보 u v w가 주어집니다. u번 거점에서 v번 거점으로 가는 일방통행 도로를 지나는 데 w분이 걸린다는 뜻입니다.', 'N개의 줄에 걸쳐 출력합니다. i번째 줄에는 S번 거점에서 i번 거점까지의 최단 시간을 출력합니다.

- S번 거점 자신까지의 시간은 `0`입니다.
- 도달할 수 없는 거점은 `-1`을 출력합니다.', '- 1 ≤ N ≤ 20,000
- 0 ≤ M ≤ 200,000
- 1 ≤ S ≤ N
- 1 ≤ u, v ≤ N
- 1 ≤ w ≤ 1,000,000
- 최단 시간은 32비트 정수 범위를 넘을 수 있습니다.',
   '[{"input":"5 7 1\n1 2 4\n1 3 1\n3 2 2\n2 4 1\n3 4 6\n4 5 3\n5 1 1\n","output":"0\n3\n1\n4\n7\n","explanation":"2번 거점은 바로 가면 4분이지만 1 → 3 → 2로 가면 1 + 2 = 3분입니다. 4번은 1 → 3 → 2 → 4로 4분, 5번은 그 뒤 3분을 더해 7분입니다."},{"input":"4 3 2\n1 2 5\n2 3 5\n4 3 1\n","output":"-1\n0\n5\n-1\n","explanation":"1 → 2 도로는 일방통행이라 2번에서 1번으로 갈 수 없습니다. 4번 거점도 4 → 3 방향 도로만 있어 2번에서 도달할 수 없습니다."}]'::jsonb, 4, 55, array['java'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '20907217-8f00-580f-a14e-6e78c47246ef';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('20907217-8f00-580f-a14e-6e78c47246ef', 'algorithm', 'shortest-path'),
  ('20907217-8f00-580f-a14e-6e78c47246ef', 'algorithm', 'dijkstra'),
  ('20907217-8f00-580f-a14e-6e78c47246ef', 'data_structure', 'graph'),
  ('20907217-8f00-580f-a14e-6e78c47246ef', 'data_structure', 'priority-queue'),
  ('20907217-8f00-580f-a14e-6e78c47246ef', 'java', 'collection'),
  ('20907217-8f00-580f-a14e-6e78c47246ef', 'java', 'oop');

delete from public.problem_hints where problem_id = '20907217-8f00-580f-a14e-6e78c47246ef';
insert into public.problem_hints (problem_id, level, content) values
  ('20907217-8f00-580f-a14e-6e78c47246ef', 1, '도로마다 걸리는 시간이 다르기 때문에, 지나는 도로 수가 적은 길이 항상 빠른 것은 아닙니다. 모든 가중치가 양수일 때 한 출발점에서 모든 정점까지의 최단 거리를 구하는 대표적인 알고리즘은 무엇일까요?'),
  ('20907217-8f00-580f-a14e-6e78c47246ef', 2, '아직 거리가 확정되지 않은 거점 중 "현재까지 알려진 거리가 가장 짧은" 거점은 더 짧아질 수 없습니다. 그 거점을 매번 빠르게 찾으려면 어떤 자료구조가 필요할까요? 또 거리 합이 int를 넘을 수 있다는 점도 생각해보세요.'),
  ('20907217-8f00-580f-a14e-6e78c47246ef', 3, '다익스트라 알고리즘을 우선순위 큐로 구현합니다. dist 배열을 무한대로 채우고 dist[S] = 0으로 둔 뒤 (거리, 정점)을 큐에 넣습니다. 꺼낸 거리가 dist보다 크면 이미 처리된 오래된 정보이므로 건너뛰고, 아니면 나가는 도로를 따라 거리를 갱신하며 큐에 넣습니다.'),
  ('20907217-8f00-580f-a14e-6e78c47246ef', 4, 'dist[1..N] = INF (long), dist[S] = 0
pq.add((0, S))
while pq가 비어 있지 않음:
  (d, u) = pq.poll()
  if d > dist[u]: continue   // 오래된 정보
  for (v, w) in adj[u]:
    if d + w < dist[v]:
      dist[v] = d + w
      pq.add((dist[v], v))
for i = 1..N: 출력 dist[i] == INF ? -1 : dist[i]');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('20907217-8f00-580f-a14e-6e78c47246ef', '가중치가 모두 양수인 방향 그래프에서 한 정점으로부터의 최단 거리이므로 **다익스트라 알고리즘**을 사용합니다.

**아이디어**: 아직 확정되지 않은 정점 중 현재 거리가 가장 짧은 정점은, 다른 정점을 거쳐 돌아와도 (가중치가 양수이므로) 더 짧아질 수 없습니다. 그래서 그 정점의 거리를 확정하고, 그 정점에서 나가는 간선으로 이웃의 거리를 갱신하는 일을 반복합니다.

1. 인접 리스트로 그래프를 저장합니다. (방향 그래프이므로 u → v만 추가)
2. `dist`를 무한대로 채우고 `dist[S] = 0`, 우선순위 큐에 `(0, S)`를 넣습니다.
3. 큐에서 거리가 가장 작은 항목을 꺼냅니다. 꺼낸 거리가 `dist[u]`보다 크면 이미 더 짧은 거리로 처리된 정점이므로 건너뜁니다.
4. u에서 나가는 간선 (v, w)마다 `dist[u] + w < dist[v]`이면 갱신하고 큐에 넣습니다.
5. 끝까지 무한대인 정점은 도달할 수 없으므로 `-1`을 출력합니다.

**시간복잡도** O((N + M) log M)
**공간복잡도** O(N + M)

**자주 하는 실수**
- 거리를 int로 저장해 오버플로 — 일직선으로 19,999개의 도로를 각각 100만 분씩 지나면 약 200억 분이 됩니다. `long`을 쓰세요.
- 무한대를 `Long.MAX_VALUE`로 두고 `dist[u] + w`를 계산하면 오버플로가 날 수 있습니다. 꺼낸 정점은 항상 유한한 거리를 가지므로 이 풀이에서는 안전하지만, 보통은 충분히 큰 값(예: `Long.MAX_VALUE / 4`)을 쓰는 것이 안전합니다.
- "오래된 정보 건너뛰기"를 하지 않으면 같은 정점을 여러 번 처리해 느려집니다.
- 양방향으로 간선을 추가하는 실수 (일방통행 조건 위반)
- 우선순위 큐 없이 매번 모든 정점을 훑어 최솟값을 찾으면 O(N²)이며, 이 문제 제한에서는 느릴 수 있습니다.

**Java 팁**
- 간선을 `Edge(to, weight)`, 큐 항목을 `Node(vertex, dist)` 같은 작은 클래스(또는 `record`)로 만들면 `int[]`/`long[]`보다 읽기 쉽습니다.
- `Node implements Comparable<Node>`로 만들고 `compareTo`에서 `Long.compare`를 쓰거나, `new PriorityQueue<>(Comparator.comparingLong(Node::dist))`처럼 Comparator를 넘깁니다.
- 출력이 최대 2만 줄이므로 `StringBuilder`에 모아서 한 번에 출력하세요.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    /** u에서 나가는 일방통행 도로 하나 */\n    record Edge(int to, int weight) {}\n\n    /** 우선순위 큐에 넣는 (정점, 그 시점의 거리) */\n    record Node(int vertex, long dist) {}\n\n    static final long INF = Long.MAX_VALUE / 4;\n\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int n = Integer.parseInt(st.nextToken());\n        int m = Integer.parseInt(st.nextToken());\n        int start = Integer.parseInt(st.nextToken());\n\n        List<List<Edge>> graph = new ArrayList<>(n + 1);\n        for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());\n        for (int i = 0; i < m; i++) {\n            st = new StringTokenizer(br.readLine());\n            int u = Integer.parseInt(st.nextToken());\n            int v = Integer.parseInt(st.nextToken());\n            int w = Integer.parseInt(st.nextToken());\n            graph.get(u).add(new Edge(v, w)); // 방향 그래프: u -> v만 추가\n        }\n\n        long[] dist = dijkstra(graph, n, start);\n\n        StringBuilder sb = new StringBuilder();\n        for (int i = 1; i <= n; i++) {\n            sb.append(dist[i] == INF ? -1 : dist[i]).append(''\\n'');\n        }\n        System.out.print(sb);\n    }\n\n    static long[] dijkstra(List<List<Edge>> graph, int n, int start) {\n        long[] dist = new long[n + 1];\n        Arrays.fill(dist, INF);\n        dist[start] = 0;\n\n        PriorityQueue<Node> pq = new PriorityQueue<>(Comparator.comparingLong(Node::dist));\n        pq.add(new Node(start, 0));\n\n        while (!pq.isEmpty()) {\n            Node cur = pq.poll();\n            int u = cur.vertex();\n            if (cur.dist() > dist[u]) continue; // 이미 더 짧은 거리로 처리된 오래된 정보\n\n            for (Edge e : graph.get(u)) {\n                long nd = dist[u] + e.weight();\n                if (nd < dist[e.to()]) {\n                    dist[e.to()] = nd;\n                    pq.add(new Node(e.to(), nd));\n                }\n            }\n        }\n        return dist;\n    }\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- distinct-count: 서로 다른 수의 개수
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('d1708cf3-3cb3-5ce1-bd22-6096a7d13fa1', 'distinct-count', '서로 다른 수의 개수', '놀이공원 입구 게이트는 회원 카드가 찍힐 때마다 회원 번호를 기록합니다. 하루 동안 기록된 회원 번호 N개가 주어집니다.

한 회원이 놀이공원을 나갔다가 다시 들어오면 같은 번호가 여러 번 기록될 수 있습니다. 오늘 놀이공원에 방문한 회원은 모두 몇 명인지, 즉 기록에 나타난 **서로 다른 회원 번호의 개수**를 구하세요.', '첫째 줄에 기록의 수 N이 주어집니다.

둘째 줄에 기록된 회원 번호 N개가 기록된 순서대로 공백으로 구분되어 주어집니다.', '서로 다른 회원 번호의 개수를 출력합니다.', '- 1 ≤ N ≤ 500,000
- 1 ≤ 회원 번호 ≤ 1,000,000,000',
   '[{"input":"7\n1004 2025 1004 77 2025 1004 9\n","output":"4\n","explanation":"1004는 세 번, 2025는 두 번 기록되었지만 한 명으로 셉니다. 방문한 회원은 1004, 2025, 77, 9의 네 명입니다."},{"input":"3\n5 5 5\n","output":"1\n","explanation":"같은 회원이 세 번 드나들었으므로 방문한 회원은 한 명입니다."}]'::jsonb, 2, 20, array['java'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = 'd1708cf3-3cb3-5ce1-bd22-6096a7d13fa1';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('d1708cf3-3cb3-5ce1-bd22-6096a7d13fa1', 'data_structure', 'hashset'),
  ('d1708cf3-3cb3-5ce1-bd22-6096a7d13fa1', 'java', 'collection');

delete from public.problem_hints where problem_id = 'd1708cf3-3cb3-5ce1-bd22-6096a7d13fa1';
insert into public.problem_hints (problem_id, level, content) values
  ('d1708cf3-3cb3-5ce1-bd22-6096a7d13fa1', 1, '"이 번호를 전에 본 적이 있는가?"를 빠르게 확인할 수 있다면 문제가 쉬워집니다. 중복을 허용하지 않고, 어떤 값이 들어 있는지 빠르게 확인할 수 있는 자료구조는 무엇일까요?'),
  ('d1708cf3-3cb3-5ce1-bd22-6096a7d13fa1', 2, '기록마다 앞의 모든 기록과 비교하면 O(N²)으로 너무 느립니다. 회원 번호가 최대 10억이라 크기 10억짜리 배열로 표시하는 방법도 메모리가 부족합니다.'),
  ('d1708cf3-3cb3-5ce1-bd22-6096a7d13fa1', 3, 'HashSet에 회원 번호를 모두 넣으면 같은 번호는 한 번만 저장됩니다. 마지막에 Set의 크기가 곧 답입니다. (정렬한 뒤 인접한 값이 다른 곳을 세는 방법도 있습니다.)'),
  ('d1708cf3-3cb3-5ce1-bd22-6096a7d13fa1', 4, 'set = 빈 HashSet
for 각 회원 번호 x:
  set.add(x)   // 이미 있으면 무시됨
출력 set.size()');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('d1708cf3-3cb3-5ce1-bd22-6096a7d13fa1', '**HashSet**은 같은 값을 한 번만 저장하고, 추가·조회를 평균 O(1)에 처리합니다. 모든 회원 번호를 HashSet에 넣은 뒤 크기를 출력하면 됩니다.

**시간복잡도** 평균 O(N)
**공간복잡도** O(N)

다른 방법으로, 배열을 정렬한 뒤 `a[i] != a[i-1]`인 위치의 개수를 세도 됩니다. 이 경우 O(N log N)이며 추가 메모리가 적게 듭니다.

**자주 하는 실수**
- 이중 반복문으로 중복을 확인해 시간 초과
- 회원 번호 크기만큼 boolean 배열을 만들어 메모리 초과 (10억 칸)
- `List.contains`로 중복을 확인 (List의 contains는 O(N)이라 결국 O(N²))

**Java 팁**
- `new HashSet<>(N * 2)`처럼 초기 용량을 넉넉히 주면 재해싱(rehash) 횟수가 줄어듭니다.
- `set.add(x)`는 새로 추가되면 `true`, 이미 있으면 `false`를 반환하므로 개수를 직접 세는 데도 쓸 수 있습니다.
- 입력이 최대 50만 개이므로 `Scanner` 대신 `BufferedReader`와 `StringTokenizer`를 쓰세요.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(br.readLine().trim());\n\n        Set<Integer> members = new HashSet<>(n * 2);\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        for (int i = 0; i < n; i++) {\n            members.add(Integer.parseInt(st.nextToken()));\n        }\n\n        System.out.println(members.size());\n    }\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- first-unique-char: 처음으로 한 번만 나오는 문자
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('be3dddac-1d66-5478-abe2-cfe3c9def1fb', 'first-unique-char', '처음으로 한 번만 나오는 문자', '암호 해독 동아리에서 문자열 속 "외톨이 문자"를 찾는 놀이를 하고 있습니다. 외톨이 문자란 문자열 전체에서 **딱 한 번만 등장하는 문자**를 말합니다.

영어 소문자로 이루어진 문자열 S가 주어질 때, 외톨이 문자 중 **S에서 가장 앞에 있는 문자**를 출력하세요.

외톨이 문자가 하나도 없다면 `-1`을 출력합니다.', '첫째 줄에 문자열 S가 주어집니다.', 'S에서 한 번만 등장하는 문자 중 가장 앞에 있는 문자를 출력합니다. 그런 문자가 없으면 `-1`을 출력합니다.', '- 1 ≤ S의 길이 ≤ 100,000
- S는 영어 소문자로만 이루어져 있습니다.',
   '[{"input":"statistics\n","output":"a\n","explanation":"s와 t는 3번, i는 2번 나옵니다. 한 번만 나오는 문자는 a와 c이고, 그중 앞에 있는 a가 답입니다."},{"input":"abcabc\n","output":"-1\n","explanation":"a, b, c가 모두 두 번씩 나오므로 한 번만 나오는 문자가 없습니다."}]'::jsonb, 2, 20, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = 'be3dddac-1d66-5478-abe2-cfe3c9def1fb';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('be3dddac-1d66-5478-abe2-cfe3c9def1fb', 'algorithm', 'frequency-count'),
  ('be3dddac-1d66-5478-abe2-cfe3c9def1fb', 'data_structure', 'string'),
  ('be3dddac-1d66-5478-abe2-cfe3c9def1fb', 'data_structure', 'array');

delete from public.problem_hints where problem_id = 'be3dddac-1d66-5478-abe2-cfe3c9def1fb';
insert into public.problem_hints (problem_id, level, content) values
  ('be3dddac-1d66-5478-abe2-cfe3c9def1fb', 1, '어떤 문자가 "한 번만" 나오는지 알려면 문자열의 어디까지 봐야 할까요? 앞부분만 보고 판단할 수 있을까요?'),
  ('be3dddac-1d66-5478-abe2-cfe3c9def1fb', 2, '문자마다 바로 뒤를 전부 뒤져서 같은 문자가 있는지 확인하면 길이가 100,000일 때 너무 느립니다. 문자의 종류는 소문자 26개뿐이라는 점을 활용할 수 있을까요?'),
  ('be3dddac-1d66-5478-abe2-cfe3c9def1fb', 3, '두 번 훑습니다. 첫 번째로 훑을 때 크기 26인 배열에 문자별 등장 횟수를 셉니다. 두 번째로 앞에서부터 다시 훑으면서 횟수가 1인 문자를 처음 만나면 그것이 답입니다.'),
  ('be3dddac-1d66-5478-abe2-cfe3c9def1fb', 4, 'count[26] = 모두 0
for 문자 c in S:
  count[c - ''a'']++
for 문자 c in S (앞에서부터):
  if count[c - ''a''] == 1: 출력 c, 종료
출력 -1');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('be3dddac-1d66-5478-abe2-cfe3c9def1fb', '문자열 전체를 봐야 "한 번만 나왔는지" 알 수 있으므로, **먼저 횟수를 모두 센 뒤 다시 앞에서부터 찾는** 두 단계로 풉니다.

1. 크기 26인 정수 배열 `count`를 만들고, 각 문자 `c`마다 `count[c - ''a'']`를 1 늘립니다.
2. S를 다시 앞에서부터 훑으며 `count[c - ''a''] == 1`인 첫 문자를 출력합니다.
3. 끝까지 없으면 `-1`을 출력합니다.

두 번째 단계에서 배열 `count`를 a부터 z 순서로 훑으면 "알파벳 순으로 가장 앞선 문자"를 찾게 되어 틀립니다. 반드시 **문자열의 순서대로** 훑어야 합니다.

**시간복잡도** O(L), **공간복잡도** O(L) (입력 문자열 저장. 횟수 배열은 26칸으로 고정)

**자주 하는 실수**
- 각 문자마다 문자열 전체를 다시 훑어 O(L²)이 되어 시간 초과
- 횟수 배열을 알파벳 순으로 훑어서 문자열 순서가 아닌 알파벳 순서로 답을 고름
- Java에서 `HashMap<Character, Integer>`를 써도 맞지만, 소문자만 나오므로 `int[26]`이 더 간단하고 빠릅니다.', '{"java":"import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine().trim();\n\n        int[] count = new int[26];\n        for (int i = 0; i < s.length(); i++) {\n            count[s.charAt(i) - ''a'']++;\n        }\n\n        for (int i = 0; i < s.length(); i++) {\n            char c = s.charAt(i);\n            if (count[c - ''a''] == 1) {\n                System.out.println(c);\n                return;\n            }\n        }\n        System.out.println(-1);\n    }\n}\n","c":"#include <stdio.h>\n\n#define MAX_LEN 100000\n\nchar s[MAX_LEN + 1];\n\nint main(void) {\n    if (scanf(\"%100000s\", s) != 1) return 0;\n\n    int count[26] = {0};\n    for (int i = 0; s[i] != ''\\0''; i++) {\n        count[s[i] - ''a'']++;\n    }\n\n    for (int i = 0; s[i] != ''\\0''; i++) {\n        if (count[s[i] - ''a''] == 1) {\n            printf(\"%c\\n\", s[i]);\n            return 0;\n        }\n    }\n    printf(\"-1\\n\");\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- friend-groups: 친구 그룹 수
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('413f0b8f-4954-56de-8cb0-59b88e3aea65', 'friend-groups', '친구 그룹 수', '새로 문을 연 동아리 커뮤니티에 회원이 N명 있고, 1번부터 N번까지 번호가 붙어 있습니다. 처음에는 아무도 서로 친구가 아닙니다.

친구 관계는 서로 이어집니다. 즉, A와 B가 친구이고 B와 C가 친구이면 A와 C는 **같은 친구 그룹**에 속합니다. 친구 관계로 직접 또는 간접적으로 이어진 회원들이 하나의 그룹이며, 아무와도 친구가 아닌 회원은 혼자서 한 그룹입니다.

다음 두 종류의 연산이 Q개 주어집니다.

- `1 a b`: a번 회원과 b번 회원이 친구가 됩니다.
- `2 a b`: a번 회원과 b번 회원이 지금 같은 그룹에 속해 있는지 확인합니다.

모든 `2`번 연산에 답하고, 모든 연산이 끝난 뒤 **친구 그룹의 개수**를 구하세요.', '첫째 줄에 회원 수 N과 연산의 수 Q가 공백으로 구분되어 주어집니다.

둘째 줄부터 Q개의 줄에 걸쳐 연산이 한 줄에 하나씩 `1 a b` 또는 `2 a b` 형식으로 주어집니다.', '`2`번 연산이 주어질 때마다, 주어진 순서대로 한 줄에 하나씩 a와 b가 같은 그룹이면 `YES`, 아니면 `NO`를 출력합니다.

모든 연산이 끝난 뒤 마지막 줄에 친구 그룹의 개수를 출력합니다. `2`번 연산이 하나도 없으면 그룹의 개수 한 줄만 출력합니다.', '- 1 ≤ N ≤ 500,000
- 1 ≤ Q ≤ 500,000
- 1 ≤ a, b ≤ N
- a와 b가 같을 수 있습니다. (자기 자신은 항상 같은 그룹입니다.)
- 이미 같은 그룹인 두 회원이 다시 친구가 될 수 있습니다.',
   '[{"input":"5 6\n1 1 2\n1 3 4\n2 1 3\n1 2 3\n2 1 4\n2 5 5\n","output":"NO\nYES\nYES\n2\n","explanation":"처음 확인할 때는 {1, 2}와 {3, 4}가 따로 있어 NO입니다. 2번과 3번이 친구가 되면 {1, 2, 3, 4}가 한 그룹이 되어 1번과 4번은 YES입니다. 5번은 자기 자신과 같은 그룹이므로 YES입니다. 마지막 그룹은 {1, 2, 3, 4}와 {5}로 2개입니다."},{"input":"4 3\n2 1 2\n1 1 2\n1 2 1\n","output":"NO\n3\n","explanation":"처음에는 모두 혼자라 NO입니다. 1번과 2번이 친구가 된 뒤 다시 친구가 되어도 그룹 수는 한 번만 줄어 {1, 2}, {3}, {4}로 3개입니다."}]'::jsonb, 4, 50, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '413f0b8f-4954-56de-8cb0-59b88e3aea65';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('413f0b8f-4954-56de-8cb0-59b88e3aea65', 'algorithm', 'union-find'),
  ('413f0b8f-4954-56de-8cb0-59b88e3aea65', 'data_structure', 'graph'),
  ('413f0b8f-4954-56de-8cb0-59b88e3aea65', 'c', 'array');

delete from public.problem_hints where problem_id = '413f0b8f-4954-56de-8cb0-59b88e3aea65';
insert into public.problem_hints (problem_id, level, content) values
  ('413f0b8f-4954-56de-8cb0-59b88e3aea65', 1, '각 그룹마다 "대표 회원"을 한 명씩 정해 두면, 두 회원이 같은 그룹인지는 어떻게 확인할 수 있을까요? 두 그룹이 합쳐질 때는 대표를 어떻게 바꾸면 될까요?'),
  ('413f0b8f-4954-56de-8cb0-59b88e3aea65', 2, '그룹이 합쳐질 때마다 그룹 안의 모든 회원 정보를 고치면 너무 느립니다. 대신 각 회원이 "부모"만 가리키게 하면 어떨까요? 이때 부모를 따라가는 길이 길어지면 연산 50만 번을 제시간에 처리할 수 있을지도 생각해보세요. 그룹 수는 언제 줄어들까요?'),
  ('413f0b8f-4954-56de-8cb0-59b88e3aea65', 3, '유니온 파인드(Disjoint Set Union)를 사용합니다. parent 배열로 트리를 만들고, find(x)는 루트를 찾으면서 지나간 모든 노드가 루트를 직접 가리키게 바꿉니다(경로 압축). union(a, b)는 두 루트가 다를 때만 한쪽 루트를 다른 쪽 아래에 붙이고 그룹 수를 1 줄입니다. 작은 트리를 큰 트리 밑에 붙이면 더 좋습니다.'),
  ('413f0b8f-4954-56de-8cb0-59b88e3aea65', 4, 'parent[i] = i, size[i] = 1, groups = N

find(x):
  root = x
  while parent[root] != root: root = parent[root]
  while x != root:          // 경로 압축
    next = parent[x]; parent[x] = root; x = next
  return root

union(a, b):
  ra = find(a), rb = find(b)
  if ra == rb: return
  size가 작은 쪽을 큰 쪽 밑에 붙이고 size 갱신
  groups--

연산마다: 1이면 union, 2이면 find(a) == find(b) ? YES : NO 출력
마지막에 groups 출력');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('413f0b8f-4954-56de-8cb0-59b88e3aea65', '"같은 그룹인가?"와 "두 그룹 합치기"를 빠르게 반복하는 문제이므로 **유니온 파인드(서로소 집합)**를 사용합니다.

**구조**: 각 그룹을 하나의 트리로 표현하고, 트리의 루트를 그룹의 대표로 씁니다. `parent[x]`는 x의 부모이며, 루트는 자기 자신을 가리킵니다.

- `find(x)`: 부모를 따라 올라가 루트를 찾습니다. 두 회원의 루트가 같으면 같은 그룹입니다.
- `union(a, b)`: 두 루트가 다르면 한 루트를 다른 루트의 자식으로 붙입니다. 이때만 그룹 수를 1 줄입니다. 이미 같은 그룹이면 아무 일도 하지 않습니다.

**경로 압축이 필요한 이유**: 아무 최적화 없이 붙이면 트리가 한 줄로 길어져 `find` 한 번에 O(N)이 걸릴 수 있습니다. 회원과 연산이 50만이면 최악의 경우 수천억 번의 연산이 필요합니다. `find`에서 지나간 노드들이 루트를 직접 가리키도록 바꾸는 **경로 압축**, 그리고 작은 트리를 큰 트리 밑에 붙이는 **크기(또는 랭크) 기준 합치기**를 함께 쓰면 연산 한 번이 사실상 상수 시간이 됩니다.

**그룹 수 관리**: 처음 그룹 수는 N이고, 실제로 서로 다른 두 그룹이 합쳐질 때마다 1씩 줄입니다. 마지막에 루트의 개수를 직접 세도 됩니다.

**시간복잡도** O((N + Q) α(N)) — α는 아커만 역함수로, 실제로는 4 이하의 상수입니다.
**공간복잡도** O(N)

**자주 하는 실수**
- 루트가 아니라 `parent[a]`와 `parent[b]`를 바로 비교하는 실수 (부모가 달라도 루트는 같을 수 있습니다)
- `union`에서 루트끼리가 아니라 a, b 자체를 연결하는 실수 (`parent[a] = b`)
- 이미 같은 그룹인데 그룹 수를 또 줄이는 실수
- 경로 압축 없이 풀어 시간 초과
- 재귀로 `find`를 짜면서 크기 기준 합치기를 하지 않으면, 경로 압축 전 트리가 매우 깊어 스택 오버플로가 날 수 있습니다. 반복문으로 작성하면 안전합니다.

**언어별 팁**
- Java: 출력할 줄이 많으므로 `StringBuilder`에 모아 한 번에 출력하세요.
- C: `parent`, `size` 배열은 크기가 50만이므로 전역으로 선언합니다. `scanf`로 충분히 빠르게 읽을 수 있습니다.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    static int[] parent;\n    static int[] size;\n    static int groups;\n\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int n = Integer.parseInt(st.nextToken());\n        int q = Integer.parseInt(st.nextToken());\n\n        parent = new int[n + 1];\n        size = new int[n + 1];\n        for (int i = 1; i <= n; i++) {\n            parent[i] = i;\n            size[i] = 1;\n        }\n        groups = n;\n\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < q; i++) {\n            st = new StringTokenizer(br.readLine());\n            int type = Integer.parseInt(st.nextToken());\n            int a = Integer.parseInt(st.nextToken());\n            int b = Integer.parseInt(st.nextToken());\n            if (type == 1) {\n                union(a, b);\n            } else {\n                sb.append(find(a) == find(b) ? \"YES\" : \"NO\").append(''\\n'');\n            }\n        }\n        sb.append(groups).append(''\\n'');\n        System.out.print(sb);\n    }\n\n    /** 루트를 찾고, 지나온 노드들이 루트를 직접 가리키게 한다 (경로 압축). */\n    static int find(int x) {\n        int root = x;\n        while (parent[root] != root) root = parent[root];\n        while (x != root) {\n            int next = parent[x];\n            parent[x] = root;\n            x = next;\n        }\n        return root;\n    }\n\n    /** 서로 다른 그룹이면 작은 트리를 큰 트리 밑에 붙이고 그룹 수를 줄인다. */\n    static void union(int a, int b) {\n        int ra = find(a), rb = find(b);\n        if (ra == rb) return;\n        if (size[ra] < size[rb]) {\n            int t = ra;\n            ra = rb;\n            rb = t;\n        }\n        parent[rb] = ra;\n        size[ra] += size[rb];\n        groups--;\n    }\n}\n","c":"#include <stdio.h>\n\n#define MAX_N 500000\n\nint parent[MAX_N + 1];\nint size[MAX_N + 1];\nint groups;\n\n/* 루트를 찾고, 지나온 노드들이 루트를 직접 가리키게 한다 (경로 압축). */\nint find(int x) {\n    int root = x;\n    while (parent[root] != root) root = parent[root];\n    while (x != root) {\n        int next = parent[x];\n        parent[x] = root;\n        x = next;\n    }\n    return root;\n}\n\n/* 서로 다른 그룹이면 작은 트리를 큰 트리 밑에 붙이고 그룹 수를 줄인다. */\nvoid unite(int a, int b) {\n    int ra = find(a), rb = find(b);\n    if (ra == rb) return;\n    if (size[ra] < size[rb]) {\n        int t = ra;\n        ra = rb;\n        rb = t;\n    }\n    parent[rb] = ra;\n    size[ra] += size[rb];\n    groups--;\n}\n\nint main(void) {\n    int n, q;\n    if (scanf(\"%d %d\", &n, &q) != 2) return 0;\n\n    for (int i = 1; i <= n; i++) {\n        parent[i] = i;\n        size[i] = 1;\n    }\n    groups = n;\n\n    for (int i = 0; i < q; i++) {\n        int type, a, b;\n        scanf(\"%d %d %d\", &type, &a, &b);\n        if (type == 1) {\n            unite(a, b);\n        } else {\n            puts(find(a) == find(b) ? \"YES\" : \"NO\");\n        }\n    }\n    printf(\"%d\\n\", groups);\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- linked-list-reverse: 연결 리스트 뒤집기
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('1128f8e0-87bd-52c9-b357-fa83f5363be9', 'linked-list-reverse', '연결 리스트 뒤집기', '정수 N개가 주어집니다. 이 정수들을 주어진 순서대로 **단일 연결 리스트**에 담은 뒤, 리스트를 뒤집어 처음부터 끝까지 출력하세요.

연결 리스트의 각 노드는 정수 값 하나와 다음 노드를 가리키는 포인터를 가집니다. 리스트를 뒤집는다는 것은 첫 번째 노드가 마지막이 되고 마지막 노드가 첫 번째가 되도록 **노드 사이의 연결 방향을 바꾸는 것**입니다.

이 문제는 연결 리스트를 직접 다루는 연습을 위한 문제입니다. 노드를 동적으로 만들고, 포인터만 바꿔서 뒤집고, 다 쓴 메모리를 해제하는 과정을 모두 직접 구현해 보세요.', '첫째 줄에 정수의 개수 N이 주어집니다.

둘째 줄에 N개의 정수가 공백으로 구분되어 주어집니다.', '뒤집은 연결 리스트의 값을 첫 노드부터 차례로 한 줄에 공백으로 구분하여 출력합니다.', '- 1 ≤ N ≤ 100,000
- -1,000,000,000 ≤ 각 정수 ≤ 1,000,000,000',
   '[{"input":"5\n1 2 3 4 5\n","output":"5 4 3 2 1\n","explanation":"1 → 2 → 3 → 4 → 5 순서의 리스트를 뒤집으면 5 → 4 → 3 → 2 → 1이 됩니다."},{"input":"3\n-7 0 7\n","output":"7 0 -7\n","explanation":"음수와 0도 값 그대로 순서만 뒤집힙니다."}]'::jsonb, 3, 30, array['c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '1128f8e0-87bd-52c9-b357-fa83f5363be9';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('1128f8e0-87bd-52c9-b357-fa83f5363be9', 'data_structure', 'linked-list'),
  ('1128f8e0-87bd-52c9-b357-fa83f5363be9', 'c', 'struct'),
  ('1128f8e0-87bd-52c9-b357-fa83f5363be9', 'c', 'pointer'),
  ('1128f8e0-87bd-52c9-b357-fa83f5363be9', 'c', 'dynamic-memory');

delete from public.problem_hints where problem_id = '1128f8e0-87bd-52c9-b357-fa83f5363be9';
insert into public.problem_hints (problem_id, level, content) values
  ('1128f8e0-87bd-52c9-b357-fa83f5363be9', 1, '노드 하나의 "다음" 포인터 방향을 바꾸면, 원래 다음에 있던 노드로는 더 이상 갈 수 없게 됩니다. 연결을 바꾸기 전에 무엇을 미리 기억해 두어야 할까요?'),
  ('1128f8e0-87bd-52c9-b357-fa83f5363be9', 2, '리스트를 앞에서부터 한 번 훑으면서 뒤집으려면 "이미 뒤집은 부분의 첫 노드", "지금 바꿀 노드", "아직 뒤집지 않은 부분의 첫 노드" 세 가지를 동시에 알아야 합니다. 맨 처음에 "이미 뒤집은 부분"은 무엇일까요?'),
  ('1128f8e0-87bd-52c9-b357-fa83f5363be9', 3, '포인터 세 개 prev, cur, next를 사용합니다. prev = NULL, cur = head에서 시작해 cur가 NULL이 될 때까지 next를 저장하고, cur->next를 prev로 바꾸고, prev와 cur를 한 칸씩 앞으로 옮깁니다. 반복이 끝나면 prev가 새 head입니다.'),
  ('1128f8e0-87bd-52c9-b357-fa83f5363be9', 4, 'struct Node { int value; struct Node *next; }

입력을 읽으며 malloc으로 노드를 만들어 tail 뒤에 붙임

prev = NULL, cur = head
while cur != NULL:
  next = cur->next
  cur->next = prev
  prev = cur
  cur = next
head = prev

head부터 출력
head부터 차례로 free (free하기 전에 다음 노드 주소를 저장)');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('1128f8e0-87bd-52c9-b357-fa83f5363be9', '노드를 새로 만들지 않고 **포인터 방향만 바꿔서** 뒤집습니다. 핵심은 포인터 세 개입니다.

- `prev`: 이미 뒤집은 부분의 첫 노드 (처음에는 `NULL`)
- `cur`: 지금 방향을 바꿀 노드
- `next`: 아직 뒤집지 않은 부분의 첫 노드 (연결을 바꾸기 **전에** 저장해야 잃어버리지 않습니다)

```
while (cur != NULL) {
    next = cur->next;   // 1. 다음 노드 기억
    cur->next = prev;   // 2. 방향 뒤집기
    prev = cur;         // 3. 한 칸 전진
    cur = next;
}
head = prev;
```

**리스트 만들기**: `malloc(sizeof(struct Node))`로 노드를 만들고 `tail` 포인터를 유지하면 끝에 붙이는 일이 O(1)입니다. `malloc`이 `NULL`을 돌려주는 경우도 확인하는 습관을 들이세요.

**메모리 해제 (중요)**: `malloc`으로 만든 노드는 반드시 `free`해야 합니다. 이때 `free(cur)` 다음에 `cur->next`를 읽으면 이미 해제된 메모리에 접근하는 오류가 됩니다. **다음 노드 주소를 먼저 저장한 뒤** 해제하세요.

```
while (cur != NULL) {
    struct Node *next = cur->next;
    free(cur);
    cur = next;
}
```

**시간복잡도** O(N), **공간복잡도** O(N) (노드 N개, 뒤집기 자체는 추가 메모리 O(1))

**자주 하는 실수**
- `next`를 저장하지 않고 `cur->next = prev`를 먼저 해서 나머지 리스트를 잃어버리는 실수
- 뒤집은 뒤 `head`를 `prev`로 바꾸지 않아 원래 첫 노드(이제 마지막 노드)부터 출력하는 실수
- 노드를 해제하지 않아 메모리 누수가 생기거나, 해제한 노드에 다시 접근하는 실수
- 재귀로 뒤집으면 N = 100,000일 때 호출 깊이가 깊어져 위험할 수 있습니다. 반복문을 권장합니다.', '{"c":"#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int value;\n    struct Node *next;\n};\n\n/* 값 하나를 담은 새 노드를 만든다. */\nstruct Node *create_node(int value) {\n    struct Node *node = malloc(sizeof(struct Node));\n    if (node == NULL) {\n        fprintf(stderr, \"메모리 할당 실패\\n\");\n        exit(1);\n    }\n    node->value = value;\n    node->next = NULL;\n    return node;\n}\n\n/* 포인터 방향만 바꿔서 리스트를 뒤집고 새 head를 돌려준다. */\nstruct Node *reverse(struct Node *head) {\n    struct Node *prev = NULL;\n    struct Node *cur = head;\n    while (cur != NULL) {\n        struct Node *next = cur->next; /* 1. 다음 노드 기억 */\n        cur->next = prev;              /* 2. 방향 뒤집기 */\n        prev = cur;                    /* 3. 한 칸 전진 */\n        cur = next;\n    }\n    return prev;\n}\n\n/* 모든 노드를 해제한다. 해제하기 전에 다음 노드 주소를 저장한다. */\nvoid free_list(struct Node *head) {\n    while (head != NULL) {\n        struct Node *next = head->next;\n        free(head);\n        head = next;\n    }\n}\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n\n    struct Node *head = NULL;\n    struct Node *tail = NULL;\n    for (int i = 0; i < n; i++) {\n        int value;\n        scanf(\"%d\", &value);\n        struct Node *node = create_node(value);\n        if (head == NULL) {\n            head = node;\n        } else {\n            tail->next = node;\n        }\n        tail = node;\n    }\n\n    head = reverse(head);\n\n    for (struct Node *cur = head; cur != NULL; cur = cur->next) {\n        printf(\"%d%c\", cur->value, cur->next != NULL ? '' '' : ''\\n'');\n    }\n\n    free_list(head);\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- longest-unique-substring: 중복 없는 가장 긴 부분 문자열
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('783b0e97-9328-570e-9cd3-24f35b6318a7', 'longest-unique-substring', '중복 없는 가장 긴 부분 문자열', '보안팀은 암호 문자열 S에서 "같은 문자가 두 번 이상 나오지 않는 구간"이 얼마나 길게 이어지는지 분석하려고 합니다.

S의 **연속된** 일부분(부분 문자열) 중에서 모든 문자가 서로 다른 것을 찾고, 그중 가장 긴 것의 길이와 내용을 구하세요.

- 대문자와 소문자는 서로 다른 문자로 봅니다. 예를 들어 `a`와 `A`는 다른 문자입니다.
- 가장 긴 부분 문자열이 여러 개라면 S에서 **가장 앞에서 시작하는 것**을 출력합니다.', '첫째 줄에 문자열 S가 주어집니다.', '첫째 줄에 모든 문자가 서로 다른 가장 긴 부분 문자열의 길이를 출력합니다.

둘째 줄에 그 부분 문자열을 출력합니다.', '- 1 ≤ S의 길이 ≤ 100,000
- S는 영문 대문자, 영문 소문자, 숫자로만 이루어져 있습니다.',
   '[{"input":"abcabcbb\n","output":"3\nabc\n","explanation":"abc, bca, cab 등 길이 3인 부분 문자열이 여러 개 있고, 길이 4 이상은 반드시 같은 문자가 들어갑니다. 가장 앞에서 시작하는 abc를 출력합니다."},{"input":"aAbBaa\n","output":"4\naAbB\n","explanation":"a와 A는 다른 문자이므로 aAbB는 중복이 없습니다. 길이 4인 aAbB와 AbBa 중 앞에서 시작하는 aAbB를 출력합니다."}]'::jsonb, 3, 35, array['java'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '783b0e97-9328-570e-9cd3-24f35b6318a7';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('783b0e97-9328-570e-9cd3-24f35b6318a7', 'algorithm', 'sliding-window'),
  ('783b0e97-9328-570e-9cd3-24f35b6318a7', 'data_structure', 'hashmap'),
  ('783b0e97-9328-570e-9cd3-24f35b6318a7', 'data_structure', 'string'),
  ('783b0e97-9328-570e-9cd3-24f35b6318a7', 'java', 'collection');

delete from public.problem_hints where problem_id = '783b0e97-9328-570e-9cd3-24f35b6318a7';
insert into public.problem_hints (problem_id, level, content) values
  ('783b0e97-9328-570e-9cd3-24f35b6318a7', 1, '모든 시작점과 끝점을 검사하면 너무 느립니다. 구간의 왼쪽 끝과 오른쪽 끝을 둘 다 "앞으로만" 움직이면서 중복 없는 상태를 유지할 수 있지 않을까요?'),
  ('783b0e97-9328-570e-9cd3-24f35b6318a7', 2, '오른쪽 끝에 새 문자를 넣었더니 중복이 생겼다면, 왼쪽 끝을 어디까지 옮겨야 중복이 사라질까요? 그 문자가 "마지막으로 나온 위치"를 알고 있다면 한 번에 옮길 수 있습니다. 단, 그 위치가 이미 현재 구간보다 왼쪽에 있다면 왼쪽 끝을 뒤로 되돌리면 안 됩니다.'),
  ('783b0e97-9328-570e-9cd3-24f35b6318a7', 3, 'HashMap에 "문자 → 마지막으로 나온 인덱스"를 저장하며 슬라이딩 윈도우를 씁니다. right를 0부터 끝까지 옮기면서, 현재 문자가 구간 [left, right) 안에 이미 있으면 left를 그 위치 + 1로 옮깁니다. 매번 구간 길이가 최댓값보다 "엄격히 클 때만" 길이와 시작 위치를 갱신합니다.'),
  ('783b0e97-9328-570e-9cd3-24f35b6318a7', 4, 'last = 빈 HashMap   // 문자 → 마지막 인덱스
left = 0, bestLen = 0, bestStart = 0
for right in 0..len-1:
  c = S[right]
  if last에 c가 있고 last[c] >= left:
    left = last[c] + 1
  last[c] = right
  if right - left + 1 > bestLen:
    bestLen = right - left + 1
    bestStart = left
출력 bestLen
출력 S.substring(bestStart, bestStart + bestLen)');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('783b0e97-9328-570e-9cd3-24f35b6318a7', '**슬라이딩 윈도우**와 **HashMap**을 함께 사용합니다. 구간 [left, right]가 항상 중복 없는 문자열이 되도록 유지하면서 right를 한 칸씩 늘립니다.

- HashMap에 각 문자가 마지막으로 나온 인덱스를 저장합니다.
- 새 문자 c가 이미 구간 안(`last[c] >= left`)에 있다면 `left = last[c] + 1`로 옮겨 중복을 없앱니다.
- `last[c] < left`라면 그 문자는 이미 구간 밖이므로 left를 움직이지 않습니다. 이 조건이 없으면 left가 뒤로 돌아가 중복이 있는 구간을 답으로 셀 수 있습니다. (예: `abba`에서 마지막 a를 처리할 때)
- 길이가 최댓값보다 **엄격히 클 때만** 갱신하면 동점일 때 가장 앞의 부분 문자열이 남습니다.

left와 right 모두 앞으로만 움직이므로 전체 O(N)입니다.

**시간복잡도** O(N)
**공간복잡도** O(K) (K는 문자 종류 수, 최대 62)

**자주 하는 실수**
- `last[c] >= left` 확인 없이 `left = last[c] + 1`을 해서 left가 뒤로 이동
- 대소문자를 같은 문자로 취급
- `>=`로 비교해 동점일 때 뒤쪽 부분 문자열을 출력
- 모든 시작점마다 Set을 새로 만들어 검사하는 O(N × K) 풀이도 이 제한에서는 통과할 수 있지만, 문자 종류가 많아지면 느려집니다.

**Java 팁**
- `HashMap<Character, Integer>`에서 `getOrDefault(c, -1)`을 쓰면 처음 나온 문자도 한 번에 처리할 수 있습니다.
- 문자 종류가 정해져 있다면 `int[128]` 배열로 바꿔 더 빠르게 만들 수도 있습니다.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine().trim();\n\n        Map<Character, Integer> lastIndex = new HashMap<>();\n        int left = 0;\n        int bestLen = 0;\n        int bestStart = 0;\n\n        for (int right = 0; right < s.length(); right++) {\n            char c = s.charAt(right);\n            int prev = lastIndex.getOrDefault(c, -1);\n            if (prev >= left) {\n                // c가 현재 구간 안에 이미 있으므로 그 다음 칸부터 다시 시작\n                left = prev + 1;\n            }\n            lastIndex.put(c, right);\n\n            int len = right - left + 1;\n            if (len > bestLen) { // 동점이면 앞의 것을 유지\n                bestLen = len;\n                bestStart = left;\n            }\n        }\n\n        StringBuilder sb = new StringBuilder();\n        sb.append(bestLen).append(''\\n'');\n        sb.append(s, bestStart, bestStart + bestLen).append(''\\n'');\n        System.out.print(sb);\n    }\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- max-k-window: 연속 K일의 최대 합
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('1a0f53c3-af31-56b7-842f-7b68a599a624', 'max-k-window', '연속 K일의 최대 합', '푸드트럭을 운영하는 하은이는 N일 동안의 하루 순이익을 기록했습니다. 이익이 난 날은 양수, 손해를 본 날은 음수입니다.

하은이는 홍보 자료에 "가장 장사가 잘된 연속 K일"을 소개하려고 합니다. 연속한 K일의 순이익 합이 가장 큰 구간을 찾아, 그 **합**과 구간이 **시작하는 날**을 구하세요. 날짜는 1일부터 N일까지 번호가 붙어 있습니다.

합이 가장 큰 구간이 여러 개라면 **가장 먼저 시작하는 구간**을 고릅니다.', '첫째 줄에 기록한 날의 수 N과 구간의 길이 K가 공백으로 구분되어 주어집니다.

둘째 줄에 1일부터 N일까지의 순이익이 공백으로 구분되어 주어집니다.', '연속 K일의 순이익 합의 최댓값과 그 구간의 시작일을 공백 하나로 구분해 한 줄에 출력합니다.', '- 1 ≤ K ≤ N ≤ 100,000
- -10,000 ≤ 하루 순이익 ≤ 10,000',
   '[{"input":"7 3\n2 -1 4 3 -2 5 1\n","output":"6 2\n","explanation":"3일 구간의 합은 시작일 순서대로 5, 6, 5, 6, 4입니다. 최댓값 6이 2일과 4일에 시작하는 구간에서 나오므로 더 먼저 시작하는 2일을 출력합니다."},{"input":"4 2\n-5 -3 -8 -1\n","output":"-8 1\n","explanation":"2일 구간의 합은 -8, -11, -9입니다. 모든 합이 음수이므로 최댓값은 -8이고, 1일에 시작합니다."}]'::jsonb, 3, 30, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '1a0f53c3-af31-56b7-842f-7b68a599a624';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('1a0f53c3-af31-56b7-842f-7b68a599a624', 'algorithm', 'sliding-window'),
  ('1a0f53c3-af31-56b7-842f-7b68a599a624', 'data_structure', 'array');

delete from public.problem_hints where problem_id = '1a0f53c3-af31-56b7-842f-7b68a599a624';
insert into public.problem_hints (problem_id, level, content) values
  ('1a0f53c3-af31-56b7-842f-7b68a599a624', 1, '1일부터 시작하는 K일 구간과 2일부터 시작하는 K일 구간을 비교해 보세요. 두 구간은 얼마나 겹치고, 실제로 달라지는 날은 며칠일까요?'),
  ('1a0f53c3-af31-56b7-842f-7b68a599a624', 2, '구간마다 K개를 새로 더하면 O(N × K)로, N = 100,000, K = 50,000이면 약 25억 번의 덧셈이 필요합니다. 또 모든 날이 손해일 수 있으므로 최댓값의 초깃값을 0으로 두면 안 되고, 동점일 때 시작일이 바뀌지 않도록 비교 조건에도 주의해야 합니다.'),
  ('1a0f53c3-af31-56b7-842f-7b68a599a624', 3, '슬라이딩 윈도우를 사용합니다. 먼저 첫 K일의 합을 구한 뒤, 구간을 한 칸 오른쪽으로 밀 때마다 새로 들어오는 날의 값을 더하고 빠지는 날의 값을 뺍니다. 새 합이 지금까지의 최댓값보다 "엄격히 클 때만" 최댓값과 시작일을 갱신합니다.'),
  ('1a0f53c3-af31-56b7-842f-7b68a599a624', 4, 'sum = a[1] + ... + a[K]
best = sum, bestDay = 1
for i in K+1..N:
  sum = sum + a[i] - a[i-K]   // i-K일이 빠지고 i일이 들어옴
  if sum > best:                // 같을 때는 갱신하지 않음
    best = sum
    bestDay = i - K + 1
출력 best, bestDay');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('1a0f53c3-af31-56b7-842f-7b68a599a624', '길이 K인 구간을 한 칸 밀면 맨 앞의 하루가 빠지고 새로운 하루가 들어올 뿐, 나머지 K-1일은 그대로입니다. 그래서 합을 처음부터 다시 구하지 않고 `sum += a[i] - a[i-K]`로 O(1)에 갱신할 수 있습니다(**슬라이딩 윈도우**).

1. 첫 K일의 합을 구해 최댓값과 시작일(1)의 초깃값으로 둡니다.
2. i = K+1부터 N까지 구간을 한 칸씩 밀며 합을 갱신합니다. 이때 구간의 시작일은 i - K + 1입니다.
3. 새 합이 최댓값보다 **엄격히 클 때만** 갱신하면, 동점일 때 먼저 시작한 구간이 자연스럽게 남습니다.

**시간복잡도** O(N)
**공간복잡도** O(N) (입력 저장)

**자주 하는 실수**
- 최댓값의 초깃값을 0으로 두어, 모든 합이 음수일 때 0을 출력
- `>=`로 비교해 동점일 때 나중 구간의 시작일을 출력
- 시작일을 0부터 세거나 구간의 끝 날짜를 출력하는 인덱스 실수
- K = N이면 구간이 하나뿐이라 반복문이 한 번도 돌지 않는데, 이때도 첫 구간이 답으로 출력되어야 합니다.

합의 절댓값은 최대 100,000 × 10,000 = 10^9으로 int 범위 안이지만, 제한이 조금만 커져도 넘칠 수 있으니 습관적으로 범위를 계산해 보세요.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int n = Integer.parseInt(st.nextToken());\n        int k = Integer.parseInt(st.nextToken());\n\n        int[] profit = new int[n + 1]; // 1일부터 사용\n        st = new StringTokenizer(br.readLine());\n        for (int i = 1; i <= n; i++) {\n            profit[i] = Integer.parseInt(st.nextToken());\n        }\n\n        // 첫 K일의 합으로 시작\n        long sum = 0;\n        for (int i = 1; i <= k; i++) {\n            sum += profit[i];\n        }\n        long best = sum;\n        int bestDay = 1;\n\n        // 구간을 한 칸씩 오른쪽으로 민다: i일이 들어오고 i-K일이 빠진다\n        for (int i = k + 1; i <= n; i++) {\n            sum += profit[i] - profit[i - k];\n            if (sum > best) { // 동점이면 먼저 시작한 구간을 유지\n                best = sum;\n                bestDay = i - k + 1;\n            }\n        }\n\n        System.out.println(best + \" \" + bestDay);\n    }\n}\n","c":"#include <stdio.h>\n\n#define MAX_N 100000\n\nint profit[MAX_N + 1]; /* 1일부터 사용 */\n\nint main(void) {\n    int n, k;\n    if (scanf(\"%d %d\", &n, &k) != 2) return 0;\n    for (int i = 1; i <= n; i++) {\n        scanf(\"%d\", &profit[i]);\n    }\n\n    /* 첫 K일의 합으로 시작 */\n    long long sum = 0;\n    for (int i = 1; i <= k; i++) {\n        sum += profit[i];\n    }\n    long long best = sum;\n    int best_day = 1;\n\n    /* 구간을 한 칸씩 오른쪽으로 민다: i일이 들어오고 i-K일이 빠진다 */\n    for (int i = k + 1; i <= n; i++) {\n        sum += profit[i] - profit[i - k];\n        if (sum > best) { /* 동점이면 먼저 시작한 구간을 유지 */\n            best = sum;\n            best_day = i - k + 1;\n        }\n    }\n\n    printf(\"%lld %d\\n\", best, best_day);\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- max-min: 최댓값과 최솟값
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('2ad6d34d-8b2f-537e-932f-c31c38d574bd', 'max-min', '최댓값과 최솟값', '기상 관측소에서 하루 동안 측정한 기온 기록 N개가 있습니다. 관측소는 하루 요약표에 가장 높은 기록과 가장 낮은 기록을 적어야 합니다.

N개의 정수가 주어질 때, 그중 최댓값과 최솟값을 구하세요.', '첫째 줄에 정수의 개수 N이 주어집니다.
둘째 줄에 N개의 정수가 공백으로 구분되어 주어집니다.', '최댓값과 최솟값을 공백 하나로 구분하여 한 줄에 출력합니다. (최댓값을 먼저 출력합니다.)', '- 1 ≤ N ≤ 100,000
- -1,000,000 ≤ 각 정수 ≤ 1,000,000',
   '[{"input":"5\n3 -1 7 0 4\n","output":"7 -1\n","explanation":"가장 큰 값은 7, 가장 작은 값은 -1입니다."},{"input":"3\n10 10 10\n","output":"10 10\n","explanation":"모든 값이 같으면 최댓값과 최솟값도 같습니다."}]'::jsonb, 1, 10, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '2ad6d34d-8b2f-537e-932f-c31c38d574bd';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('2ad6d34d-8b2f-537e-932f-c31c38d574bd', 'data_structure', 'array'),
  ('2ad6d34d-8b2f-537e-932f-c31c38d574bd', 'java', 'basic-syntax'),
  ('2ad6d34d-8b2f-537e-932f-c31c38d574bd', 'c', 'array');

delete from public.problem_hints where problem_id = '2ad6d34d-8b2f-537e-932f-c31c38d574bd';
insert into public.problem_hints (problem_id, level, content) values
  ('2ad6d34d-8b2f-537e-932f-c31c38d574bd', 1, '모든 값을 한 번씩만 보고도 가장 큰 값을 알 수 있을까요? 지금까지 본 값 중 가장 큰 값을 기억해 두면 어떨까요?'),
  ('2ad6d34d-8b2f-537e-932f-c31c38d574bd', 2, '최댓값과 최솟값을 담을 변수의 처음 값을 무엇으로 정할지가 중요합니다. 0으로 시작하면 모든 수가 음수일 때 어떻게 될까요?'),
  ('2ad6d34d-8b2f-537e-932f-c31c38d574bd', 3, '첫 번째 수로 최댓값과 최솟값을 모두 초기화한 뒤, 나머지 수를 하나씩 보면서 더 크면 최댓값을, 더 작으면 최솟값을 갱신합니다.'),
  ('2ad6d34d-8b2f-537e-932f-c31c38d574bd', 4, 'max = min = 첫 번째 수
for 나머지 수 x:
  if x > max: max = x
  if x < min: min = x
출력 max, min');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('2ad6d34d-8b2f-537e-932f-c31c38d574bd', '수를 한 번씩 훑으면서 **지금까지 본 값 중 가장 큰 값과 가장 작은 값**을 갱신합니다.

1. 첫 번째 수로 `max`와 `min`을 초기화합니다.
2. 나머지 수 `x`마다 `x > max`이면 `max = x`, `x < min`이면 `min = x`로 바꿉니다.
3. `max min` 순서로 출력합니다.

정렬해서 양 끝을 보는 방법도 있지만 O(N log N)이 걸리므로, 한 번 훑는 O(N) 방법이 더 효율적입니다.

**시간복잡도** O(N), **공간복잡도** O(N) (배열에 저장할 경우. 읽으면서 바로 비교하면 O(1))

**자주 하는 실수**
- `max`, `min`을 0으로 초기화해서 모든 값이 음수(또는 양수)일 때 틀림
- 최솟값과 최댓값의 출력 순서를 바꿈
- Java에서 `Scanner`로 10만 개를 읽으면 느릴 수 있으니 `BufferedReader`와 `StringTokenizer`를 사용하세요.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(br.readLine().trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n\n        int first = Integer.parseInt(st.nextToken());\n        int max = first;\n        int min = first;\n        for (int i = 1; i < n; i++) {\n            int x = Integer.parseInt(st.nextToken());\n            if (x > max) max = x;\n            if (x < min) min = x;\n        }\n        System.out.println(max + \" \" + min);\n    }\n}\n","c":"#include <stdio.h>\n\n#define MAX_N 100000\n\nint nums[MAX_N];\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    for (int i = 0; i < n; i++) {\n        scanf(\"%d\", &nums[i]);\n    }\n\n    int max = nums[0];\n    int min = nums[0];\n    for (int i = 1; i < n; i++) {\n        if (nums[i] > max) max = nums[i];\n        if (nums[i] < min) min = nums[i];\n    }\n    printf(\"%d %d\\n\", max, min);\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- maze-shortest-path: 미로 최단 거리
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('d9b23b99-1c9a-52ef-be9b-a01d61369b0c', 'maze-shortest-path', '미로 최단 거리', '로봇 청소기가 N행 M열 격자 모양의 창고 왼쪽 위 칸 (1, 1)에서 출발해 오른쪽 아래 칸 (N, M)에 있는 충전기까지 가려고 합니다.

격자의 각 칸은 빈 칸(`.`) 또는 상자가 쌓인 칸(`#`)입니다. 로봇은 한 번에 상하좌우로 인접한 빈 칸 하나로만 이동할 수 있고, 상자가 쌓인 칸이나 격자 바깥으로는 갈 수 없습니다.

로봇이 충전기에 도착하기 위한 **최소 이동 횟수**를 구하세요. 도착할 수 없다면 `-1`을 출력합니다.', '첫째 줄에 격자의 크기 N과 M이 공백으로 구분되어 주어집니다.

둘째 줄부터 N개의 줄에 걸쳐 격자의 각 행이 주어집니다. 각 행은 `.`과 `#`으로만 이루어진 길이 M의 문자열이며, 공백 없이 주어집니다.', '(1, 1)에서 (N, M)까지의 최소 이동 횟수를 출력합니다. 도착할 수 없으면 `-1`을 출력합니다.

이동 횟수는 지나간 칸의 수가 아니라 **이동한 횟수**입니다. 따라서 N = M = 1이면 답은 0입니다.', '- 1 ≤ N, M ≤ 1,000
- 출발 칸 (1, 1)과 도착 칸 (N, M)은 항상 빈 칸(`.`)입니다.',
   '[{"input":"5 5\n.#...\n.#.#.\n.#.#.\n.#.#.\n...#.\n","output":"16\n","explanation":"왼쪽 열을 따라 아래로 4번, 오른쪽으로 2번, 가운데 열을 따라 위로 4번, 오른쪽으로 2번, 마지막 열을 따라 아래로 4번 이동해 모두 16번 이동합니다. 벽 때문에 이보다 짧은 길은 없습니다."},{"input":"3 3\n.#.\n#..\n...\n","output":"-1\n","explanation":"출발 칸의 오른쪽과 아래쪽이 모두 막혀 있어서 한 칸도 움직일 수 없습니다."}]'::jsonb, 3, 40, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = 'd9b23b99-1c9a-52ef-be9b-a01d61369b0c';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('d9b23b99-1c9a-52ef-be9b-a01d61369b0c', 'algorithm', 'bfs'),
  ('d9b23b99-1c9a-52ef-be9b-a01d61369b0c', 'data_structure', 'queue'),
  ('d9b23b99-1c9a-52ef-be9b-a01d61369b0c', 'data_structure', 'graph');

delete from public.problem_hints where problem_id = 'd9b23b99-1c9a-52ef-be9b-a01d61369b0c';
insert into public.problem_hints (problem_id, level, content) values
  ('d9b23b99-1c9a-52ef-be9b-a01d61369b0c', 1, '모든 이동의 비용이 1로 같습니다. 출발점에서 가까운 칸부터 차례로 방문한다면, 어떤 칸에 처음 도착했을 때의 이동 횟수는 어떤 의미를 가질까요?'),
  ('d9b23b99-1c9a-52ef-be9b-a01d61369b0c', 2, '같은 칸을 여러 번 방문하면 시간이 크게 늘어납니다. 칸을 "방문했다"고 표시하는 시점을 큐에서 꺼낼 때로 할지, 큐에 넣을 때로 할지 생각해보세요. 또 도착할 수 없는 경우는 어떻게 알아낼 수 있을까요?'),
  ('d9b23b99-1c9a-52ef-be9b-a01d61369b0c', 3, '너비 우선 탐색(BFS)을 사용합니다. 각 칸까지의 거리를 저장하는 배열을 -1로 초기화하고, 출발 칸의 거리를 0으로 둔 뒤 큐에 넣습니다. 큐에서 꺼낸 칸의 상하좌우 중 아직 거리가 정해지지 않은 빈 칸에 "현재 거리 + 1"을 기록하며 큐에 넣습니다.'),
  ('d9b23b99-1c9a-52ef-be9b-a01d61369b0c', 4, 'dist[][] = -1로 초기화
dist[0][0] = 0, queue.add((0, 0))
while queue가 비어 있지 않음:
  (r, c) = queue.poll()
  for (dr, dc) in 상하좌우:
    (nr, nc) = (r + dr, c + dc)
    if 격자 안이고 빈 칸이고 dist[nr][nc] == -1:
      dist[nr][nc] = dist[r][c] + 1
      queue.add((nr, nc))
출력 dist[N-1][M-1]   // 도달하지 못했으면 -1 그대로');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('d9b23b99-1c9a-52ef-be9b-a01d61369b0c', '모든 이동의 비용이 같은 격자에서의 최단 거리는 **BFS(너비 우선 탐색)**로 구합니다.

BFS는 출발점에서 거리가 0인 칸, 1인 칸, 2인 칸… 순서로 방문합니다. 그래서 어떤 칸에 **처음 도착했을 때의 거리가 곧 최단 거리**입니다.

1. 거리 배열 `dist`를 -1로 채웁니다. -1은 "아직 방문하지 않음"을 뜻합니다.
2. 출발 칸의 거리를 0으로 두고 큐에 넣습니다.
3. 큐에서 칸을 하나 꺼내 상하좌우를 확인합니다. 격자 안이고, 빈 칸이고, 아직 방문하지 않았다면 거리를 `현재 거리 + 1`로 기록하고 큐에 넣습니다.
4. 큐가 빌 때까지 반복한 뒤 `dist[N-1][M-1]`을 출력합니다. 도달하지 못했다면 처음 값 -1이 그대로 남아 있습니다.

**시간복잡도** O(N × M) — 각 칸은 최대 한 번 큐에 들어갑니다.
**공간복잡도** O(N × M) — 거리 배열과 큐

**자주 하는 실수**
- 큐에서 **꺼낼 때** 방문 표시를 하면 같은 칸이 큐에 여러 번 들어가 시간·메모리가 크게 늘어납니다. **넣을 때** 표시하세요.
- DFS로 모든 경로를 탐색하면 최단 거리를 보장하지 못하거나 시간 초과가 납니다.
- N = M = 1일 때 0이 아니라 1을 출력하는 실수 (이동 횟수와 지나간 칸 수를 혼동)
- 행과 열을 바꿔서 인덱스를 잘못 계산하는 실수 (N과 M이 다를 때 드러납니다)

**언어별 팁**
- Java: `ArrayDeque<int[]>`를 큐로 쓰거나, 칸 번호 `r * M + c`를 int 배열 큐에 넣으면 더 빠릅니다. 입력은 `BufferedReader.readLine()`으로 한 줄씩 읽으세요.
- C: 큐를 크기 N × M인 정수 배열과 head, tail 인덱스로 직접 구현합니다. 1,000 × 1,000 배열은 지역 변수로 두면 스택이 넘칠 수 있으니 전역으로 선언하세요.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    static final int[] DR = {-1, 1, 0, 0};\n    static final int[] DC = {0, 0, -1, 1};\n\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int n = Integer.parseInt(st.nextToken());\n        int m = Integer.parseInt(st.nextToken());\n\n        char[][] grid = new char[n][];\n        for (int i = 0; i < n; i++) {\n            grid[i] = br.readLine().trim().toCharArray();\n        }\n\n        System.out.println(bfs(grid, n, m));\n    }\n\n    static int bfs(char[][] grid, int n, int m) {\n        int[][] dist = new int[n][m];\n        for (int[] row : dist) Arrays.fill(row, -1);\n\n        // 칸 (r, c)를 r * m + c 하나의 정수로 저장하는 배열 큐\n        int[] queue = new int[n * m];\n        int head = 0, tail = 0;\n        dist[0][0] = 0;\n        queue[tail++] = 0;\n\n        while (head < tail) {\n            int cur = queue[head++];\n            int r = cur / m, c = cur % m;\n            for (int d = 0; d < 4; d++) {\n                int nr = r + DR[d], nc = c + DC[d];\n                if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;\n                if (grid[nr][nc] == ''#'' || dist[nr][nc] != -1) continue;\n                dist[nr][nc] = dist[r][c] + 1; // 큐에 넣을 때 방문 표시\n                queue[tail++] = nr * m + nc;\n            }\n        }\n        return dist[n - 1][m - 1];\n    }\n}\n","c":"#include <stdio.h>\n#include <string.h>\n\n#define MAX 1000\n\nchar grid[MAX][MAX + 2];\nint dist[MAX][MAX];\nint queue[MAX * MAX];\n\nconst int DR[4] = {-1, 1, 0, 0};\nconst int DC[4] = {0, 0, -1, 1};\n\nint main(void) {\n    int n, m;\n    if (scanf(\"%d %d\", &n, &m) != 2) return 0;\n    for (int i = 0; i < n; i++) {\n        scanf(\"%1001s\", grid[i]);\n    }\n\n    memset(dist, -1, sizeof(dist));\n\n    /* 칸 (r, c)를 r * m + c 하나의 정수로 저장하는 배열 큐 */\n    int head = 0, tail = 0;\n    dist[0][0] = 0;\n    queue[tail++] = 0;\n\n    while (head < tail) {\n        int cur = queue[head++];\n        int r = cur / m, c = cur % m;\n        for (int d = 0; d < 4; d++) {\n            int nr = r + DR[d], nc = c + DC[d];\n            if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;\n            if (grid[nr][nc] == ''#'' || dist[nr][nc] != -1) continue;\n            dist[nr][nc] = dist[r][c] + 1; /* 큐에 넣을 때 방문 표시 */\n            queue[tail++] = nr * m + nc;\n        }\n    }\n\n    printf(\"%d\\n\", dist[n - 1][m - 1]);\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- meeting-rooms: 회의실 배정
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('b2fedaec-9764-5fbf-bd86-63352dd78e60', 'meeting-rooms', '회의실 배정', '한 스타트업에 회의실이 단 하나 있습니다. 이번 주에 회의실을 쓰고 싶다는 신청이 N건 들어왔고, 각 신청에는 회의를 시작하는 시각과 끝나는 시각이 적혀 있습니다.

회의실에서는 한 번에 하나의 회의만 열 수 있고, 회의는 신청한 시각 그대로 진행해야 합니다(시각을 옮기거나 중간에 끊을 수 없습니다). 단, 어떤 회의가 끝나는 시각과 다른 회의가 시작하는 시각이 **같으면** 두 회의를 이어서 열 수 있습니다. 예를 들어 1시~3시 회의와 3시~5시 회의는 둘 다 열 수 있습니다.

신청 중 일부를 골라 회의실에서 열 수 있는 **회의의 최대 개수**를 구하세요.', '첫째 줄에 회의 신청의 수 N이 주어집니다.

둘째 줄부터 N개의 줄에 걸쳐 각 회의의 시작 시각 S와 끝나는 시각 E가 공백으로 구분되어 주어집니다. 시각은 0 이상의 정수입니다.', '겹치지 않게 열 수 있는 회의의 최대 개수를 출력합니다.', '- 1 ≤ N ≤ 100,000
- 0 ≤ S < E ≤ 1,000,000,000
- 시작 시각과 끝나는 시각이 모두 같은 신청이 여러 번 있을 수 있으며, 이들은 서로 다른 회의로 봅니다.
- 신청은 정렬되지 않은 순서로 주어집니다.',
   '[{"input":"5\n1 4\n3 5\n0 6\n5 7\n8 9\n","output":"3\n","explanation":"1~4, 5~7, 8~9 회의를 열면 3개입니다. 3~5, 5~7, 8~9를 골라도 3개이며, 4개를 겹치지 않게 고르는 방법은 없습니다."},{"input":"4\n1 10\n2 3\n3 4\n4 5\n","output":"3\n","explanation":"2~3, 3~4, 4~5 회의는 끝나는 시각과 다음 시작 시각이 같아서 이어서 열 수 있습니다. 가장 먼저 시작하는 1~10 회의를 고르면 1개밖에 열지 못합니다."}]'::jsonb, 3, 35, array['java'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = 'b2fedaec-9764-5fbf-bd86-63352dd78e60';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('b2fedaec-9764-5fbf-bd86-63352dd78e60', 'algorithm', 'greedy'),
  ('b2fedaec-9764-5fbf-bd86-63352dd78e60', 'algorithm', 'sorting'),
  ('b2fedaec-9764-5fbf-bd86-63352dd78e60', 'java', 'comparator'),
  ('b2fedaec-9764-5fbf-bd86-63352dd78e60', 'java', 'lambda');

delete from public.problem_hints where problem_id = 'b2fedaec-9764-5fbf-bd86-63352dd78e60';
insert into public.problem_hints (problem_id, level, content) values
  ('b2fedaec-9764-5fbf-bd86-63352dd78e60', 1, '회의를 하나 고를 때마다 남은 시간에 더 많은 회의를 넣고 싶습니다. 첫 번째로 열 회의는 어떤 기준으로 고르는 것이 가장 유리할까요? "가장 먼저 시작하는 회의"나 "가장 짧은 회의"가 항상 정답일까요?'),
  ('b2fedaec-9764-5fbf-bd86-63352dd78e60', 2, '가장 먼저 시작하는 회의가 아주 길면 다른 회의를 모두 막을 수 있고, 가장 짧은 회의도 두 회의 사이에 걸쳐 둘 다 막을 수 있습니다. 회의실이 "가장 빨리 비는" 선택이 무엇인지 생각해보세요.'),
  ('b2fedaec-9764-5fbf-bd86-63352dd78e60', 3, '그리디 알고리즘을 사용합니다. 회의를 끝나는 시각 기준으로 오름차순 정렬한 뒤, 앞에서부터 보면서 "마지막으로 고른 회의가 끝난 시각 ≤ 이번 회의 시작 시각"이면 고릅니다.'),
  ('b2fedaec-9764-5fbf-bd86-63352dd78e60', 4, 'meetings를 (끝나는 시각 오름차순)으로 정렬
lastEnd = -1   // 시각은 0 이상이므로
count = 0
for (s, e) in meetings:
  if s >= lastEnd:
    count++
    lastEnd = e
출력 count');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('b2fedaec-9764-5fbf-bd86-63352dd78e60', '**끝나는 시각이 가장 빠른 회의부터 고르는 그리디**가 최적입니다.

**왜 맞을까요?** 최적해 하나를 생각해 봅시다. 그 최적해의 첫 회의를 "전체에서 가장 빨리 끝나는 회의"로 바꿔도, 바꾼 회의는 원래 첫 회의보다 늦게 끝나지 않으므로 뒤의 회의들과 겹치지 않습니다. 개수는 그대로이니 이 선택도 최적입니다. 남은 회의들에 같은 논리를 반복하면 그리디의 선택이 최적임을 알 수 있습니다.

1. 회의를 끝나는 시각 기준으로 오름차순 정렬합니다.
2. 마지막으로 고른 회의의 끝나는 시각 `lastEnd`를 기억합니다.
3. 앞에서부터 보면서 시작 시각이 `lastEnd` 이상이면 그 회의를 고르고 `lastEnd`를 갱신합니다. 같을 때도 고를 수 있다는 점(`>=`)에 주의하세요.

**시간복잡도** O(N log N) — 정렬
**공간복잡도** O(N)

**자주 하는 실수**
- 시작 시각 기준이나 회의 길이 기준으로 정렬하기 (예제 2와 같은 반례가 있습니다)
- `s > lastEnd`로 비교해서 끝과 시작이 같은 회의를 이어 붙이지 못하는 실수
- `lastEnd`를 0으로 초기화하면 이 문제에서는 괜찮지만, 시각이 음수일 수 있는 문제에서는 틀립니다. 의미가 분명한 초깃값을 쓰는 습관을 들이세요.

**Java 팁**
- `int[][] meetings`를 `Arrays.sort(meetings, (a, b) -> Integer.compare(a[1], b[1]))`처럼 람다 Comparator로 정렬할 수 있습니다.
- `(a, b) -> a[1] - b[1]`처럼 빼기로 비교하면 값이 클 때 오버플로가 날 수 있으므로 `Integer.compare`를 쓰는 것이 안전합니다.
- `Comparator.comparingInt((int[] a) -> a[1])`처럼 표현할 수도 있습니다.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(br.readLine().trim());\n\n        int[][] meetings = new int[n][2];\n        for (int i = 0; i < n; i++) {\n            StringTokenizer st = new StringTokenizer(br.readLine());\n            meetings[i][0] = Integer.parseInt(st.nextToken());\n            meetings[i][1] = Integer.parseInt(st.nextToken());\n        }\n\n        // 끝나는 시각 오름차순 (빼기 대신 Integer.compare로 오버플로 방지)\n        Arrays.sort(meetings, (a, b) -> Integer.compare(a[1], b[1]));\n\n        int count = 0;\n        int lastEnd = -1;\n        for (int[] meeting : meetings) {\n            if (meeting[0] >= lastEnd) { // 끝나는 시각과 시작 시각이 같아도 이어서 열 수 있다\n                count++;\n                lastEnd = meeting[1];\n            }\n        }\n        System.out.println(count);\n    }\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- merge-card-piles: 카드 묶음 합치기
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('2258d2fb-83c0-5e09-8a58-08a89a4b17b3', 'merge-card-piles', '카드 묶음 합치기', '카드 게임 대회를 준비하는 운영진이 크기가 제각각인 카드 묶음 N개를 하나로 모으려고 합니다.

한 번에 **아무 두 묶음**이나 골라 하나로 합칠 수 있습니다. 카드 a장짜리 묶음과 b장짜리 묶음을 합치면 a + b장짜리 묶음이 하나 생기고, 카드를 한 장씩 세어 확인해야 하므로 **a + b만큼의 비용**이 듭니다.

N개의 묶음이 하나가 될 때까지 합치기를 반복할 때, 드는 **비용의 총합의 최솟값**을 구하세요.', '첫째 줄에 카드 묶음의 수 N이 주어집니다.

둘째 줄에 각 묶음의 카드 수 N개가 공백으로 구분되어 주어집니다.', '모든 묶음을 하나로 합치는 데 드는 비용 총합의 최솟값을 출력합니다. 묶음이 처음부터 하나뿐이면 합칠 필요가 없으므로 `0`을 출력합니다.', '- 1 ≤ N ≤ 100,000
- 1 ≤ 각 묶음의 카드 수 ≤ 1,000,000
- 서로 이웃한 묶음이 아니어도 합칠 수 있습니다.
- 답은 32비트 정수 범위를 넘을 수 있습니다.',
   '[{"input":"3\n10 20 40\n","output":"100\n","explanation":"10장과 20장을 합치면 비용 30, 생긴 30장 묶음과 40장을 합치면 비용 70으로 총 100입니다."},{"input":"5\n5 5 5 5 30\n","output":"90\n","explanation":"5+5(10), 5+5(10), 10+10(20), 20+30(50)으로 합치면 총 90입니다. 작은 것부터 한 묶음에 차례로 쌓아 나가면 10, 15, 20, 50으로 95가 되어 더 비쌉니다."}]'::jsonb, 3, 40, array['java'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '2258d2fb-83c0-5e09-8a58-08a89a4b17b3';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('2258d2fb-83c0-5e09-8a58-08a89a4b17b3', 'algorithm', 'greedy'),
  ('2258d2fb-83c0-5e09-8a58-08a89a4b17b3', 'data_structure', 'heap'),
  ('2258d2fb-83c0-5e09-8a58-08a89a4b17b3', 'data_structure', 'priority-queue'),
  ('2258d2fb-83c0-5e09-8a58-08a89a4b17b3', 'java', 'collection');

delete from public.problem_hints where problem_id = '2258d2fb-83c0-5e09-8a58-08a89a4b17b3';
insert into public.problem_hints (problem_id, level, content) values
  ('2258d2fb-83c0-5e09-8a58-08a89a4b17b3', 1, '어떤 카드는 여러 번 합쳐질수록 비용에 여러 번 더해집니다. 그렇다면 여러 번 합쳐져도 부담이 적은 묶음은 큰 묶음일까요, 작은 묶음일까요?'),
  ('2258d2fb-83c0-5e09-8a58-08a89a4b17b3', 2, '매번 "지금 남아 있는 묶음 중" 가장 작은 두 개를 합치는 것을 생각해보세요. 합쳐서 새로 생긴 묶음도 다시 후보가 된다는 점에 주의하세요. 매번 정렬을 다시 하면 너무 느립니다.'),
  ('2258d2fb-83c0-5e09-8a58-08a89a4b17b3', 3, '최솟값을 빠르게 꺼내고 새 값을 빠르게 넣을 수 있는 우선순위 큐(최소 힙)를 사용합니다. 모든 묶음을 넣고, 두 개를 꺼내 합친 값을 비용에 더한 뒤 다시 넣는 일을 묶음이 하나 남을 때까지 반복합니다. 합계는 long으로 관리하세요.'),
  ('2258d2fb-83c0-5e09-8a58-08a89a4b17b3', 4, 'pq = 최소 힙, 모든 묶음 크기를 add
total = 0 (long)
while pq.size() > 1:
  a = pq.poll()
  b = pq.poll()
  total += a + b
  pq.add(a + b)
출력 total');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('2258d2fb-83c0-5e09-8a58-08a89a4b17b3', '매번 **가장 작은 두 묶음을 합치는 그리디**가 최적입니다. (허프만 코딩과 같은 원리입니다.)

어떤 묶음의 카드는 합쳐질 때마다 비용에 한 번씩 더해집니다. 그러니 큰 묶음은 되도록 늦게, 적게 합쳐지는 것이 유리하고, 작은 묶음을 먼저 합치는 것이 이득입니다. 이때 **새로 만들어진 묶음도 다시 후보에 넣어야** 합니다. 예제 2에서 한 묶음에 차례로 쌓기만 하면 95가 되지만, 5+5를 두 번 따로 만든 뒤 합치면 90이 됩니다.

1. 모든 묶음 크기를 최소 힙(우선순위 큐)에 넣습니다.
2. 힙에 원소가 2개 이상인 동안 가장 작은 두 값을 꺼내 합치고, 그 합을 비용에 더한 뒤 다시 힙에 넣습니다.
3. 원소가 하나 남으면 누적 비용을 출력합니다. N = 1이면 반복이 한 번도 일어나지 않아 0이 됩니다.

**시간복잡도** O(N log N) — 힙 연산 약 3N번
**공간복잡도** O(N)

**자주 하는 실수**
- 처음에 한 번만 정렬하고 앞에서부터 차례로 더하기 (새로 생긴 묶음이 다른 묶음보다 커질 수 있음)
- 비용 합계를 int로 두어 오버플로 — 묶음 하나의 크기만 해도 최대 1,000,000 × 100,000 = 1,000억까지 커집니다. 힙에 넣는 값도 long이어야 합니다.
- 매번 배열을 다시 정렬해서 O(N² log N)으로 시간 초과

**Java 팁**
- `PriorityQueue<Long>`은 기본이 최소 힙입니다. 최대 힙이 필요할 때는 `new PriorityQueue<>(Comparator.reverseOrder())`를 씁니다.
- `pq.poll() + pq.poll()`처럼 쓰면 Long이 자동으로 언박싱되어 long으로 계산됩니다. 합을 다시 넣을 때 int로 바꾸지 않도록 주의하세요.
- 입력이 한 줄에 10만 개이므로 `BufferedReader`와 `StringTokenizer`로 읽으세요.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(br.readLine().trim());\n\n        PriorityQueue<Long> pq = new PriorityQueue<>(); // 기본이 최소 힙\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        for (int i = 0; i < n; i++) {\n            pq.add(Long.parseLong(st.nextToken()));\n        }\n\n        long total = 0;\n        while (pq.size() > 1) {\n            long merged = pq.poll() + pq.poll(); // 가장 작은 두 묶음을 합친다\n            total += merged;\n            pq.add(merged); // 새로 생긴 묶음도 다시 후보가 된다\n        }\n        System.out.println(total);\n    }\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- next-greater: 오른쪽에서 처음 만나는 큰 수
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('5f210ecd-40fe-5ae0-8b83-9369478b0626', 'next-greater', '오른쪽에서 처음 만나는 큰 수', '해안 도로를 따라 건물 N채가 왼쪽부터 한 줄로 서 있습니다. 각 건물 옥상에서 오른쪽을 바라볼 때, **처음으로 만나는 자기보다 높은 건물**의 높이를 알고 싶습니다.

- "자기보다 높은"은 높이가 엄격히 큰 것을 뜻합니다. 높이가 같은 건물은 해당하지 않습니다.
- 오른쪽에 자기보다 높은 건물이 하나도 없다면 답은 `-1`입니다.

모든 건물에 대해 답을 구하세요.', '첫째 줄에 건물의 수 N이 주어집니다.

둘째 줄에 왼쪽 건물부터 차례대로 N개의 높이가 공백으로 구분되어 주어집니다.', '첫째 줄에 왼쪽 건물부터 차례대로 각 건물의 답 N개를 공백 하나로 구분해 출력합니다.', '- 1 ≤ N ≤ 500,000
- 1 ≤ 건물의 높이 ≤ 1,000,000,000',
   '[{"input":"5\n3 5 2 7 4\n","output":"5 7 7 -1 -1\n","explanation":"3의 오른쪽에서 처음 만나는 더 높은 건물은 5, 5와 2는 7입니다. 7과 4는 오른쪽에 더 높은 건물이 없습니다."},{"input":"4\n4 4 2 4\n","output":"-1 -1 4 -1\n","explanation":"높이가 같은 건물은 \"더 높은\" 건물이 아니므로 4인 건물들의 답은 모두 -1입니다. 2의 오른쪽에서는 4를 처음 만납니다."}]'::jsonb, 3, 35, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '5f210ecd-40fe-5ae0-8b83-9369478b0626';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('5f210ecd-40fe-5ae0-8b83-9369478b0626', 'data_structure', 'stack'),
  ('5f210ecd-40fe-5ae0-8b83-9369478b0626', 'data_structure', 'array');

delete from public.problem_hints where problem_id = '5f210ecd-40fe-5ae0-8b83-9369478b0626';
insert into public.problem_hints (problem_id, level, content) values
  ('5f210ecd-40fe-5ae0-8b83-9369478b0626', 1, '건물마다 오른쪽을 하나씩 살펴보면 최악의 경우(높이가 계속 낮아지는 경우) 몇 번 비교하게 될까요? 아직 "답을 찾지 못한" 건물들이 어떤 순서로 쌓여 있는지 생각해 보세요.'),
  ('5f210ecd-40fe-5ae0-8b83-9369478b0626', 2, '왼쪽부터 건물을 보면서 답을 못 찾은 건물들을 모아 둔다고 해 봅시다. 이 건물들의 높이는 항상 어떤 순서로 정렬되어 있을까요? 새 건물이 나타났을 때 답이 정해지는 건물은 어느 쪽부터일까요?'),
  ('5f210ecd-40fe-5ae0-8b83-9369478b0626', 3, '스택에 "아직 답을 못 찾은 건물의 인덱스"를 저장합니다. 새 건물 i가 나오면, 스택 맨 위 건물이 i보다 낮은 동안 계속 꺼내면서 그 건물의 답을 높이[i]로 정합니다. 그 다음 i를 스택에 넣습니다. 끝까지 스택에 남은 건물의 답은 -1입니다. 각 건물은 한 번 들어가고 한 번 나오므로 전체 O(N)입니다.'),
  ('5f210ecd-40fe-5ae0-8b83-9369478b0626', 4, 'answer 배열을 모두 -1로 초기화
stack = 빈 스택 (인덱스 저장)
for i in 0..N-1:
  while stack이 비어 있지 않고 h[stack.top] < h[i]:
    answer[stack.pop()] = h[i]
  stack.push(i)
answer를 공백으로 구분해 출력');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('5f210ecd-40fe-5ae0-8b83-9369478b0626', '건물마다 오른쪽을 직접 살피면 높이가 계속 낮아지는 입력에서 O(N²) = 약 1,250억 번 비교가 필요합니다.

**스택**으로 "아직 오른쪽에 더 높은 건물을 만나지 못한 건물"의 인덱스를 관리합니다.

1. 왼쪽부터 건물 i를 봅니다.
2. 스택 맨 위 건물이 i보다 **낮으면**, 그 건물이 오른쪽에서 처음 만나는 더 높은 건물이 바로 i입니다. 답을 기록하고 꺼냅니다. 이를 더 이상 꺼낼 수 없을 때까지 반복합니다.
3. i를 스택에 넣습니다.
4. 끝까지 남은 건물의 답은 -1입니다.

스택 안의 높이는 아래에서 위로 갈수록 같거나 낮아지는(단조 감소) 상태가 유지되므로, 맨 위만 확인해도 됩니다. 이런 스택을 **단조 스택(monotonic stack)**이라고 합니다.

**시간복잡도** O(N) — 각 건물은 스택에 한 번 들어가고 최대 한 번 나옵니다.
**공간복잡도** O(N)

**자주 하는 실수**
- `<=`로 비교해 높이가 같은 건물을 답으로 기록 (예제 2)
- 스택에 높이를 저장해서 답을 어느 건물에 기록할지 알 수 없게 됨 → 인덱스를 저장해야 합니다.
- 스택에 남은 건물의 답을 -1로 처리하지 않음

**언어별 팁**
- Java: `Stack` 대신 `ArrayDeque` 또는 `int[]` 배열과 top 변수로 스택을 직접 구현하면 빠릅니다. 출력은 `StringBuilder`로 모아서 한 번에 하세요.
- C: 크기 N인 정적 배열과 top 변수로 스택을 만들면 충분합니다.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(br.readLine().trim());\n        int[] heights = new int[n];\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        for (int i = 0; i < n; i++) {\n            heights[i] = Integer.parseInt(st.nextToken());\n        }\n\n        int[] answer = nextGreater(heights);\n\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < n; i++) {\n            if (i > 0) sb.append('' '');\n            sb.append(answer[i]);\n        }\n        System.out.println(sb);\n    }\n\n    static int[] nextGreater(int[] heights) {\n        int n = heights.length;\n        int[] answer = new int[n];\n        Arrays.fill(answer, -1);\n\n        // 아직 답을 찾지 못한 건물의 인덱스를 담는 스택 (배열로 구현)\n        int[] stack = new int[n];\n        int top = 0;\n        for (int i = 0; i < n; i++) {\n            while (top > 0 && heights[stack[top - 1]] < heights[i]) {\n                answer[stack[--top]] = heights[i];\n            }\n            stack[top++] = i;\n        }\n        return answer;\n    }\n}\n","c":"#include <stdio.h>\n\n#define MAX_N 500000\n\nint heights[MAX_N];\nint answer[MAX_N];\nint stack[MAX_N]; /* 아직 답을 찾지 못한 건물의 인덱스 */\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    for (int i = 0; i < n; i++) {\n        scanf(\"%d\", &heights[i]);\n        answer[i] = -1;\n    }\n\n    int top = 0;\n    for (int i = 0; i < n; i++) {\n        while (top > 0 && heights[stack[top - 1]] < heights[i]) {\n            answer[stack[--top]] = heights[i];\n        }\n        stack[top++] = i;\n    }\n\n    for (int i = 0; i < n; i++) {\n        printf(i == 0 ? \"%d\" : \" %d\", answer[i]);\n    }\n    printf(\"\\n\");\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- pair-sum: 합이 K인 두 수
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('dc381104-c0c5-571f-910a-d95585192de6', 'pair-sum', '합이 K인 두 수', '선물 가게에 가격이 모두 다른 상품 N개가 진열되어 있습니다. 민수는 금액이 K원인 상품권 한 장으로 상품 **두 개**를 사려고 합니다. 이 상품권은 거스름돈을 돌려주지 않기 때문에, 두 상품 가격의 합이 정확히 K원이 되도록 고르고 싶습니다.

- 같은 상품을 두 번 고를 수는 없습니다.
- 고르는 순서는 상관없습니다. 즉 (A, B)와 (B, A)는 같은 방법입니다.

가격의 합이 정확히 K원이 되는 두 상품의 조합은 모두 몇 가지인지 구하세요.', '첫째 줄에 상품의 개수 N과 상품권 금액 K가 공백으로 구분되어 주어집니다.

둘째 줄에 N개 상품의 가격이 공백으로 구분되어 주어집니다. 가격은 정렬되어 있지 않습니다.', '가격의 합이 정확히 K인 두 상품 조합의 개수를 출력합니다. 그런 조합이 없으면 `0`을 출력합니다.', '- 1 ≤ N ≤ 100,000
- 2 ≤ K ≤ 2,000,000
- 1 ≤ 각 상품의 가격 ≤ 1,000,000
- 모든 상품의 가격은 서로 다릅니다.',
   '[{"input":"6 10\n3 7 1 9 5 4\n","output":"2\n","explanation":"(3, 7)과 (1, 9) 두 가지입니다. 5원짜리 상품은 하나뿐이므로 (5, 5)는 만들 수 없습니다."},{"input":"4 100\n10 20 30 40\n","output":"0\n","explanation":"가장 비싼 두 상품을 골라도 70원이라서 100원을 만들 수 없습니다."}]'::jsonb, 2, 25, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = 'dc381104-c0c5-571f-910a-d95585192de6';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('dc381104-c0c5-571f-910a-d95585192de6', 'algorithm', 'two-pointer'),
  ('dc381104-c0c5-571f-910a-d95585192de6', 'algorithm', 'sorting'),
  ('dc381104-c0c5-571f-910a-d95585192de6', 'data_structure', 'array'),
  ('dc381104-c0c5-571f-910a-d95585192de6', 'c', 'pointer');

delete from public.problem_hints where problem_id = 'dc381104-c0c5-571f-910a-d95585192de6';
insert into public.problem_hints (problem_id, level, content) values
  ('dc381104-c0c5-571f-910a-d95585192de6', 1, '가격이 정렬되어 있다면 무엇이 편해질까요? 가장 싼 상품과 가장 비싼 상품의 합을 K와 비교하면 어떤 상품을 후보에서 지울 수 있을지 생각해 보세요.'),
  ('dc381104-c0c5-571f-910a-d95585192de6', 2, '모든 쌍을 확인하면 N(N-1)/2번, N = 100,000일 때 약 50억 번을 비교해야 합니다. 정렬된 상태에서 두 수의 합이 K보다 작다면 작은 쪽을 키워야 하고, 크다면 큰 쪽을 줄여야 합니다.'),
  ('dc381104-c0c5-571f-910a-d95585192de6', 3, '가격을 오름차순으로 정렬한 뒤, 맨 앞을 가리키는 left와 맨 뒤를 가리키는 right 두 포인터를 둡니다. 합을 K와 비교해 포인터 하나를 안쪽으로 옮기는 과정을 두 포인터가 만날 때까지 반복합니다(투 포인터).'),
  ('dc381104-c0c5-571f-910a-d95585192de6', 4, 'prices 정렬
left = 0, right = N - 1, count = 0
while left < right:
  sum = prices[left] + prices[right]
  if sum == K: count++, left++, right--
  else if sum < K: left++
  else: right--
출력 count');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('dc381104-c0c5-571f-910a-d95585192de6', '가격을 **오름차순으로 정렬**한 뒤 양 끝에서 시작하는 **투 포인터**를 사용합니다.

- `prices[left] + prices[right] < K`: 지금의 right는 남은 상품 중 가장 비싼데도 합이 모자랍니다. 따라서 prices[left]는 누구와 짝지어도 K가 될 수 없으므로 left를 오른쪽으로 옮깁니다.
- 합 > K: 같은 논리로 prices[right]는 버리고 right를 왼쪽으로 옮깁니다.
- 합 == K: 개수를 세고, 가격이 모두 다르므로 두 포인터를 모두 안쪽으로 옮깁니다.

각 단계에서 상품 하나가 후보에서 빠지므로 포인터 이동은 최대 N번입니다.

**시간복잡도** O(N log N) (정렬), 투 포인터 자체는 O(N)
**공간복잡도** O(N)

**자주 하는 실수**
- 이중 반복문으로 모든 쌍을 확인해 시간 초과
- 조건을 `left <= right`로 써서 같은 상품을 두 번 고르는 경우까지 세는 실수 (예: K = 10일 때 5 + 5)
- 합이 K일 때 포인터를 움직이지 않아 무한 루프에 빠짐
- 정렬하지 않고 투 포인터를 적용

**언어별 팁**
- Java: `int[]`에 `Arrays.sort`를 쓰면 됩니다.
- C: `qsort`의 비교 함수는 `const void *`를 받으므로 `*(const int *)a`처럼 형 변환한 뒤 값을 비교합니다. `return x - y;`는 값의 범위가 크면 오버플로가 날 수 있으니 `(x > y) - (x < y)` 형태가 안전합니다.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int n = Integer.parseInt(st.nextToken());\n        int k = Integer.parseInt(st.nextToken());\n\n        int[] prices = new int[n];\n        st = new StringTokenizer(br.readLine());\n        for (int i = 0; i < n; i++) {\n            prices[i] = Integer.parseInt(st.nextToken());\n        }\n\n        System.out.println(countPairs(prices, k));\n    }\n\n    static int countPairs(int[] prices, int k) {\n        Arrays.sort(prices);\n        int left = 0;\n        int right = prices.length - 1;\n        int count = 0;\n        while (left < right) {\n            int sum = prices[left] + prices[right];\n            if (sum == k) {\n                count++;\n                left++;\n                right--;\n            } else if (sum < k) {\n                left++;\n            } else {\n                right--;\n            }\n        }\n        return count;\n    }\n}\n","c":"#include <stdio.h>\n#include <stdlib.h>\n\n#define MAX_N 100000\n\nint prices[MAX_N];\n\n/* qsort 비교 함수: void 포인터를 int 포인터로 바꿔 값을 비교한다 */\nint compare_int(const void *a, const void *b) {\n    int x = *(const int *)a;\n    int y = *(const int *)b;\n    return (x > y) - (x < y);\n}\n\nint main(void) {\n    int n, k;\n    if (scanf(\"%d %d\", &n, &k) != 2) return 0;\n    for (int i = 0; i < n; i++) {\n        scanf(\"%d\", &prices[i]);\n    }\n\n    qsort(prices, n, sizeof(int), compare_int);\n\n    int *left = prices;\n    int *right = prices + n - 1;\n    int count = 0;\n    while (left < right) {\n        int sum = *left + *right;\n        if (sum == k) {\n            count++;\n            left++;\n            right--;\n        } else if (sum < k) {\n            left++;\n        } else {\n            right--;\n        }\n    }\n\n    printf(\"%d\\n\", count);\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- palindrome-check: 회문 판별
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('7242fc5c-6ee0-5d60-8195-bb0297033be5', 'palindrome-check', '회문 판별', '앞에서부터 읽어도, 뒤에서부터 읽어도 똑같은 문자열을 **회문**이라고 합니다. 예를 들어 `level`, `noon`은 회문이고 `apple`은 회문이 아닙니다.

영어 소문자로 이루어진 문자열 S가 주어질 때, S가 회문인지 판별하세요.', '첫째 줄에 문자열 S가 주어집니다.', 'S가 회문이면 `YES`, 아니면 `NO`를 출력합니다.', '- 1 ≤ S의 길이 ≤ 100,000
- S는 영어 소문자로만 이루어져 있습니다.',
   '[{"input":"level\n","output":"YES\n","explanation":"뒤에서부터 읽어도 l, e, v, e, l로 같으므로 회문입니다."},{"input":"abca\n","output":"NO\n","explanation":"양 끝의 a끼리는 같지만, 두 번째 글자 b와 끝에서 두 번째 글자 c가 다르므로 회문이 아닙니다."}]'::jsonb, 1, 15, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '7242fc5c-6ee0-5d60-8195-bb0297033be5';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('7242fc5c-6ee0-5d60-8195-bb0297033be5', 'algorithm', 'two-pointer'),
  ('7242fc5c-6ee0-5d60-8195-bb0297033be5', 'data_structure', 'string');

delete from public.problem_hints where problem_id = '7242fc5c-6ee0-5d60-8195-bb0297033be5';
insert into public.problem_hints (problem_id, level, content) values
  ('7242fc5c-6ee0-5d60-8195-bb0297033be5', 1, '회문이라면 첫 글자와 마지막 글자는 어떤 관계일까요? 두 번째 글자와 끝에서 두 번째 글자는요?'),
  ('7242fc5c-6ee0-5d60-8195-bb0297033be5', 2, '문자열 전체를 뒤집어 새로 만들지 않고도 판별할 수 있을까요? 그리고 몇 쌍까지 비교하면 충분할지 생각해보세요.'),
  ('7242fc5c-6ee0-5d60-8195-bb0297033be5', 3, '왼쪽 인덱스는 0, 오른쪽 인덱스는 길이 - 1에서 시작합니다. 두 위치의 글자를 비교해서 다르면 바로 회문이 아니고, 같으면 둘 다 가운데로 한 칸씩 옮깁니다. 두 인덱스가 만나거나 엇갈리면 끝입니다.'),
  ('7242fc5c-6ee0-5d60-8195-bb0297033be5', 4, 'left = 0, right = 길이 - 1
while left < right:
  if S[left] != S[right]: 출력 NO, 종료
  left++, right--
출력 YES');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('7242fc5c-6ee0-5d60-8195-bb0297033be5', '회문은 **i번째 글자와 끝에서 i번째 글자가 모두 같은** 문자열입니다. 양 끝에서 가운데로 모이는 두 포인터로 확인합니다.

1. `left = 0`, `right = 길이 - 1`로 시작합니다.
2. `left < right`인 동안 `S[left]`와 `S[right]`를 비교합니다. 다르면 바로 `NO`입니다.
3. 같으면 `left++`, `right--` 합니다. 끝까지 다른 쌍이 없으면 `YES`입니다.

길이가 홀수이면 가운데 글자는 자기 자신과 짝이므로 비교할 필요가 없습니다.

**시간복잡도** O(L), **공간복잡도** O(L) (입력 문자열 저장. 추가 공간은 O(1))

**자주 하는 실수**
- `right`를 `길이`로 시작해서 범위를 벗어남 (C에서는 널 문자와 비교하게 됨)
- 문자열을 뒤집어 비교하는 방법도 맞지만, Java에서 `String`을 한 글자씩 이어 붙여 뒤집으면 O(L²)이 되어 느립니다. 뒤집을 거라면 `StringBuilder.reverse()`를 쓰세요.
- Java에서 문자열 비교를 `==`로 하면 내용이 아니라 참조를 비교하므로 `equals`를 써야 합니다.', '{"java":"import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine().trim();\n        System.out.println(isPalindrome(s) ? \"YES\" : \"NO\");\n    }\n\n    static boolean isPalindrome(String s) {\n        int left = 0;\n        int right = s.length() - 1;\n        while (left < right) {\n            if (s.charAt(left) != s.charAt(right)) return false;\n            left++;\n            right--;\n        }\n        return true;\n    }\n}\n","c":"#include <stdio.h>\n#include <string.h>\n\n#define MAX_LEN 100000\n\nchar s[MAX_LEN + 1];\n\nint is_palindrome(const char *str) {\n    int left = 0;\n    int right = (int)strlen(str) - 1;\n    while (left < right) {\n        if (str[left] != str[right]) return 0;\n        left++;\n        right--;\n    }\n    return 1;\n}\n\nint main(void) {\n    if (scanf(\"%100000s\", s) != 1) return 0;\n\n    printf(\"%s\\n\", is_palindrome(s) ? \"YES\" : \"NO\");\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- range-sum-queries: 구간 합 구하기
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('4018909d-af61-5964-bd72-60943f987a4b', 'range-sum-queries', '구간 합 구하기', '작은 카페를 운영하는 지은이는 N일 동안 매일의 손익을 장부에 적어 두었습니다. 이익을 본 날은 양수, 손해를 본 날은 음수로 기록했습니다.

세무 상담을 앞두고 지은이는 "l번째 날부터 r번째 날까지의 손익 합계는 얼마인가?"라는 질문 Q개에 답해야 합니다. 날짜는 1번부터 N번까지 번호가 붙어 있고, l일과 r일도 구간에 포함됩니다.

각 질문에 대한 손익 합계를 구하세요.', '첫째 줄에 기록한 날의 수 N과 질문의 수 Q가 공백으로 구분되어 주어집니다.

둘째 줄에 1일부터 N일까지의 손익이 공백으로 구분되어 주어집니다.

셋째 줄부터 Q개의 줄에 걸쳐 질문을 나타내는 두 정수 l, r이 공백으로 구분되어 주어집니다.', '질문이 주어진 순서대로, 한 줄에 하나씩 l일부터 r일까지의 손익 합계를 출력합니다.', '- 1 ≤ N ≤ 100,000
- 1 ≤ Q ≤ 100,000
- -1,000,000 ≤ 각 날의 손익 ≤ 1,000,000
- 1 ≤ l ≤ r ≤ N',
   '[{"input":"5 3\n3 -2 5 1 -4\n1 3\n2 4\n5 5\n","output":"6\n4\n-4\n","explanation":"1~3일은 3 + (-2) + 5 = 6, 2~4일은 (-2) + 5 + 1 = 4, 5일 하루는 -4입니다."},{"input":"4 2\n1000000 1000000 1000000 -1000000\n1 3\n1 4\n","output":"3000000\n2000000\n","explanation":"1~3일은 1,000,000을 세 번 더한 3,000,000이고, 4일까지 포함하면 1,000,000이 줄어 2,000,000입니다."}]'::jsonb, 2, 25, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '4018909d-af61-5964-bd72-60943f987a4b';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('4018909d-af61-5964-bd72-60943f987a4b', 'algorithm', 'prefix-sum'),
  ('4018909d-af61-5964-bd72-60943f987a4b', 'data_structure', 'array');

delete from public.problem_hints where problem_id = '4018909d-af61-5964-bd72-60943f987a4b';
insert into public.problem_hints (problem_id, level, content) values
  ('4018909d-af61-5964-bd72-60943f987a4b', 1, '질문마다 l부터 r까지 직접 더하면 최악의 경우 몇 번 더하게 될까요? 여러 질문이 같은 구간을 반복해서 더하고 있지는 않은지 생각해 보세요.'),
  ('4018909d-af61-5964-bd72-60943f987a4b', 2, '1일부터 i일까지의 합을 미리 알고 있다면, l일부터 r일까지의 합은 그 값들로 어떻게 표현할 수 있을까요? 그리고 합의 최댓값이 int 범위(약 21억) 안에 들어가는지도 확인해 보세요.'),
  ('4018909d-af61-5964-bd72-60943f987a4b', 3, '누적 합 배열 prefix를 만듭니다. prefix[0] = 0, prefix[i] = prefix[i-1] + a[i]로 정의하면 구간 합은 prefix[r] - prefix[l-1]이 되어 질문 하나를 O(1)에 답할 수 있습니다. 합이 최대 10^11이므로 64비트 정수를 써야 합니다.'),
  ('4018909d-af61-5964-bd72-60943f987a4b', 4, 'prefix[0] = 0
for i in 1..N:
  prefix[i] = prefix[i-1] + a[i]   // 64비트 정수
for 각 질문 (l, r):
  출력 prefix[r] - prefix[l-1]');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('4018909d-af61-5964-bd72-60943f987a4b', '질문마다 직접 더하면 질문 하나에 최대 N번, 전체 최대 N × Q = 100억 번의 덧셈이 필요해 시간 초과가 납니다.

**누적 합(prefix sum)**을 한 번만 계산해 두면 모든 질문에 O(1)로 답할 수 있습니다.

- `prefix[0] = 0`, `prefix[i] = a[1] + a[2] + … + a[i]`
- l일부터 r일까지의 합 = `prefix[r] - prefix[l-1]`

`prefix[0]`을 0으로 두면 l = 1인 경우도 따로 처리하지 않아도 됩니다.

**시간복잡도** O(N + Q)
**공간복잡도** O(N)

**자주 하는 실수**
- 합의 범위: 최대 100,000 × 1,000,000 = 10^11로 int 범위(약 2.1 × 10^9)를 넘습니다. 누적 합 배열과 출력 값 모두 Java는 `long`, C는 `long long`(`%lld`)을 써야 합니다.
- `prefix[r] - prefix[l]`로 계산해 l일 값을 빼먹는 경계 실수
- 0번 인덱스부터 저장하면서 l, r은 1번부터라는 점을 놓치는 실수

**언어별 팁**
- Java: 출력이 최대 100,000줄이므로 `System.out.println`을 반복하기보다 `StringBuilder`에 모아 한 번에 출력하세요.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int n = Integer.parseInt(st.nextToken());\n        int q = Integer.parseInt(st.nextToken());\n\n        // prefix[i] = 1일부터 i일까지의 합 (최대 10^11이므로 long)\n        long[] prefix = new long[n + 1];\n        st = new StringTokenizer(br.readLine());\n        for (int i = 1; i <= n; i++) {\n            prefix[i] = prefix[i - 1] + Integer.parseInt(st.nextToken());\n        }\n\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < q; i++) {\n            st = new StringTokenizer(br.readLine());\n            int l = Integer.parseInt(st.nextToken());\n            int r = Integer.parseInt(st.nextToken());\n            sb.append(prefix[r] - prefix[l - 1]).append(''\\n'');\n        }\n        System.out.print(sb);\n    }\n}\n","c":"#include <stdio.h>\n\n#define MAX_N 100000\n\n/* prefix[i] = 1일부터 i일까지의 합 (최대 10^11이므로 long long) */\nlong long prefix[MAX_N + 1];\n\nint main(void) {\n    int n, q;\n    if (scanf(\"%d %d\", &n, &q) != 2) return 0;\n\n    prefix[0] = 0;\n    for (int i = 1; i <= n; i++) {\n        int value;\n        scanf(\"%d\", &value);\n        prefix[i] = prefix[i - 1] + value;\n    }\n\n    for (int i = 0; i < q; i++) {\n        int l, r;\n        scanf(\"%d %d\", &l, &r);\n        printf(\"%lld\\n\", prefix[r] - prefix[l - 1]);\n    }\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- reverse-string: 문자열 뒤집기
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('8162e32c-8b31-5130-bdc1-1953290b2d8b', 'reverse-string', '문자열 뒤집기', '비밀 쪽지를 주고받는 두 친구는 메시지를 거꾸로 써서 보내기로 했습니다. 받은 쪽지를 읽으려면 글자 순서를 다시 뒤집어야 합니다.

문자열 S가 주어질 때, S를 앞뒤로 뒤집은 문자열을 출력하세요.

이 문제는 새 배열을 만들지 않고, **포인터 두 개를 이용해 원래 문자열 안에서 직접 뒤집는 방법**을 연습하는 것이 목표입니다.', '첫째 줄에 문자열 S가 주어집니다.', 'S를 뒤집은 문자열을 출력합니다.', '- 1 ≤ S의 길이 ≤ 100,000
- S는 영어 대소문자와 숫자로만 이루어져 있습니다. (공백 없음)',
   '[{"input":"hello\n","output":"olleh\n","explanation":"h, e, l, l, o의 순서를 거꾸로 하면 o, l, l, e, h가 됩니다."},{"input":"CodeMate2024\n","output":"4202etaMedoC\n","explanation":"대소문자와 숫자도 그대로 유지한 채 순서만 뒤집습니다."}]'::jsonb, 1, 15, array['c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '8162e32c-8b31-5130-bdc1-1953290b2d8b';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('8162e32c-8b31-5130-bdc1-1953290b2d8b', 'algorithm', 'two-pointer'),
  ('8162e32c-8b31-5130-bdc1-1953290b2d8b', 'data_structure', 'string'),
  ('8162e32c-8b31-5130-bdc1-1953290b2d8b', 'c', 'pointer'),
  ('8162e32c-8b31-5130-bdc1-1953290b2d8b', 'c', 'string');

delete from public.problem_hints where problem_id = '8162e32c-8b31-5130-bdc1-1953290b2d8b';
insert into public.problem_hints (problem_id, level, content) values
  ('8162e32c-8b31-5130-bdc1-1953290b2d8b', 1, '문자열을 뒤집으면 첫 글자와 마지막 글자는 서로 어디로 갈까요? 두 번째 글자와 끝에서 두 번째 글자는요?'),
  ('8162e32c-8b31-5130-bdc1-1953290b2d8b', 2, '양 끝에서 한 쌍씩 자리를 바꾸면 됩니다. 그렇다면 언제 멈춰야 할까요? 끝까지 바꾸면 어떤 일이 생길지 생각해보세요.'),
  ('8162e32c-8b31-5130-bdc1-1953290b2d8b', 3, '왼쪽 포인터는 문자열의 시작, 오른쪽 포인터는 마지막 문자(널 문자 바로 앞)를 가리키게 합니다. 두 포인터가 만나거나 엇갈리기 전까지 가리키는 문자를 교환하고, 왼쪽은 오른쪽으로, 오른쪽은 왼쪽으로 한 칸씩 옮깁니다.'),
  ('8162e32c-8b31-5130-bdc1-1953290b2d8b', 4, 'left = s의 첫 문자 주소
right = s의 마지막 문자 주소 (s + 길이 - 1)
while left < right:
  *left와 *right 교환
  left++, right--
출력 s');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('8162e32c-8b31-5130-bdc1-1953290b2d8b', '뒤집힌 문자열에서 i번째 글자는 원래 문자열의 끝에서 i번째 글자입니다. 따라서 **양 끝의 글자를 서로 바꾸면서 가운데로 모이면** 새 배열 없이 뒤집을 수 있습니다.

1. `char *left = s`, `char *right = s + strlen(s) - 1`로 두 포인터를 준비합니다.
2. `left < right`인 동안 `*left`와 `*right`를 교환하고, `left++`, `right--` 합니다.
3. 두 포인터가 만나거나 엇갈리면 뒤집기가 끝난 것입니다. 길이가 홀수이면 가운데 글자는 그대로 둡니다.

**시간복잡도** O(L), **공간복잡도** O(1) (입력 문자열 외 추가 공간 없음)

**자주 하는 실수**
- `right`를 `s + strlen(s)`로 잡아서 널 문자 `''\0''`까지 맨 앞으로 옮기는 바람에 아무것도 출력되지 않음
- 반복 조건을 `left != right`로 써서 길이가 짝수일 때 두 포인터가 엇갈린 뒤에도 계속 진행함
- 끝까지 교환해서 한 번 뒤집은 문자열을 다시 원래대로 되돌림
- 반복문 안에서 `strlen`을 매번 호출하면 O(L²)이 되므로 길이는 한 번만 구하세요.', '{"c":"#include <stdio.h>\n#include <string.h>\n\n#define MAX_LEN 100000\n\nchar s[MAX_LEN + 1];\n\nvoid reverse(char *str) {\n    char *left = str;\n    char *right = str + strlen(str) - 1;\n    while (left < right) {\n        char tmp = *left;\n        *left = *right;\n        *right = tmp;\n        left++;\n        right--;\n    }\n}\n\nint main(void) {\n    if (scanf(\"%100000s\", s) != 1) return 0;\n\n    reverse(s);\n    printf(\"%s\\n\", s);\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- second-largest: 두 번째로 큰 수
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('32a8b8bc-6fcf-5893-91c2-5b9670b56d6c', 'second-largest', '두 번째로 큰 수', '노래 경연 대회에서 참가자 N명이 점수를 받았습니다. 같은 점수를 받은 참가자는 같은 순위로 인정합니다. 예를 들어 최고 점수를 받은 사람이 두 명이면 두 사람 모두 1위이고, 2위는 그다음으로 높은 점수를 받은 사람입니다.

참가자들의 점수가 주어질 때, **2위의 점수**를 구하세요. 즉, 서로 다른 점수 중에서 두 번째로 큰 값을 구해야 합니다.

모든 참가자의 점수가 같아서 2위가 없다면 `-1`을 출력합니다.', '첫째 줄에 참가자 수 N이 주어집니다.
둘째 줄에 N명의 점수가 공백으로 구분되어 주어집니다.', '서로 다른 점수 중 두 번째로 큰 값을 출력합니다. 그런 값이 없으면 `-1`을 출력합니다.', '- 2 ≤ N ≤ 100,000
- 1 ≤ 각 점수 ≤ 1,000,000,000',
   '[{"input":"5\n70 95 80 95 60\n","output":"80\n","explanation":"95점이 두 명이므로 둘 다 1위입니다. 그다음으로 높은 점수는 80점입니다."},{"input":"3\n50 50 50\n","output":"-1\n","explanation":"모두 50점으로 공동 1위이므로 2위가 없습니다."}]'::jsonb, 1, 15, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '32a8b8bc-6fcf-5893-91c2-5b9670b56d6c';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('32a8b8bc-6fcf-5893-91c2-5b9670b56d6c', 'algorithm', 'brute-force'),
  ('32a8b8bc-6fcf-5893-91c2-5b9670b56d6c', 'data_structure', 'array');

delete from public.problem_hints where problem_id = '32a8b8bc-6fcf-5893-91c2-5b9670b56d6c';
insert into public.problem_hints (problem_id, level, content) values
  ('32a8b8bc-6fcf-5893-91c2-5b9670b56d6c', 1, '가장 큰 값을 찾는 방법은 알고 있을 거예요. 그 과정에서 "두 번째로 큰 값"도 함께 기억할 수 있을까요?'),
  ('32a8b8bc-6fcf-5893-91c2-5b9670b56d6c', 2, '가장 큰 값과 같은 값이 또 나왔을 때 두 번째 값이 바뀌면 안 됩니다. 그리고 지금보다 더 큰 최댓값이 새로 나타나면, 원래 최댓값은 어떻게 되어야 할까요?'),
  ('32a8b8bc-6fcf-5893-91c2-5b9670b56d6c', 3, 'first(최댓값)와 second(두 번째 값)를 -1로 시작합니다. 새 값 x가 first보다 크면 기존 first를 second로 내리고 first를 x로 바꿉니다. x가 first보다 작고 second보다 크면 second만 바꿉니다. x가 first와 같으면 아무것도 하지 않습니다.'),
  ('32a8b8bc-6fcf-5893-91c2-5b9670b56d6c', 4, 'first = -1, second = -1
for 점수 x:
  if x > first:
    second = first
    first = x
  else if x < first and x > second:
    second = x
출력 second');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('32a8b8bc-6fcf-5893-91c2-5b9670b56d6c', '배열을 한 번 훑으면서 **최댓값(first)과 두 번째 값(second)**을 함께 관리합니다. 점수는 1 이상이므로 둘 다 `-1`로 시작하면, 끝까지 `second`가 바뀌지 않았을 때 그대로 `-1`을 출력하면 됩니다.

각 점수 `x`에 대해
- `x > first`: 기존 최댓값이 2위로 내려갑니다. `second = first`, `first = x`
- `first > x > second`: `second = x`
- `x == first`: 공동 1위이므로 아무것도 바꾸지 않습니다.

정렬한 뒤 뒤에서부터 최댓값과 다른 값을 찾는 방법도 있지만 O(N log N)이 걸립니다.

**시간복잡도** O(N), **공간복잡도** O(N) (점수를 배열에 저장할 경우. 읽으면서 처리하면 O(1))

**자주 하는 실수**
- 정렬 후 단순히 뒤에서 두 번째 원소를 출력해서, 최댓값이 중복될 때 최댓값을 그대로 출력함
- 새 최댓값이 나왔을 때 기존 최댓값을 `second`로 옮기지 않음 (`5 1 3 8`에서 3을 출력하는 실수)
- `x == first`인 경우를 따로 막지 않아 `second`가 최댓값과 같아짐
- `-1`로 초기화할 수 있는 것은 점수가 1 이상이기 때문입니다. 음수 점수도 가능한 문제라면 `Integer.MIN_VALUE`(C에서는 `INT_MIN`)나 별도의 "값이 있는지" 표시 변수를 써야 합니다.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(br.readLine().trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n\n        int first = -1;\n        int second = -1;\n        for (int i = 0; i < n; i++) {\n            int x = Integer.parseInt(st.nextToken());\n            if (x > first) {\n                second = first;\n                first = x;\n            } else if (x < first && x > second) {\n                second = x;\n            }\n        }\n        System.out.println(second);\n    }\n}\n","c":"#include <stdio.h>\n\n#define MAX_N 100000\n\nint scores[MAX_N];\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    for (int i = 0; i < n; i++) {\n        scanf(\"%d\", &scores[i]);\n    }\n\n    int first = -1;\n    int second = -1;\n    for (int i = 0; i < n; i++) {\n        int x = scores[i];\n        if (x > first) {\n            second = first;\n            first = x;\n        } else if (x < first && x > second) {\n            second = x;\n        }\n    }\n    printf(\"%d\\n\", second);\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- sorted-search: 정렬된 배열에서 찾기
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('1fef1f77-a8bb-5aec-8c16-cdfd980fb841', 'sorted-search', '정렬된 배열에서 찾기', '도서관 서가에 책 N권이 청구 번호 순서대로 꽂혀 있습니다. 왼쪽 끝 책이 1번 위치이고, 오른쪽으로 갈수록 청구 번호가 같거나 커집니다. 같은 책이 여러 권 있는 경우도 있어서 같은 청구 번호가 연달아 나올 수 있습니다.

사서는 청구 번호 M개를 하나씩 찾아보려고 합니다. 각 청구 번호에 대해, 그 번호의 책이 **처음** 나오는 위치를 구하세요. 서가에 그 번호의 책이 없다면 `-1`입니다.', '첫째 줄에 책의 수 N이 주어집니다.

둘째 줄에 N권의 청구 번호가 왼쪽부터 차례대로 공백으로 구분되어 주어집니다. 청구 번호는 오름차순(같은 값이 연속될 수 있음)으로 정렬되어 있습니다.

셋째 줄에 찾을 청구 번호의 수 M이 주어집니다.

넷째 줄에 찾을 청구 번호 M개가 공백으로 구분되어 주어집니다.', '찾을 청구 번호가 주어진 순서대로, 한 줄에 하나씩 그 번호의 책이 처음 나오는 위치(1부터 시작)를 출력합니다. 없으면 `-1`을 출력합니다.', '- 1 ≤ N ≤ 100,000
- 1 ≤ M ≤ 100,000
- -1,000,000,000 ≤ 청구 번호 ≤ 1,000,000,000
- 서가의 청구 번호는 오름차순(비내림차순)으로 정렬되어 있습니다.',
   '[{"input":"6\n1 3 3 3 7 9\n4\n3 7 4 1\n","output":"2\n5\n-1\n1\n","explanation":"3번 책은 2, 3, 4번 위치에 있으므로 처음 위치인 2를 출력합니다. 7은 5번 위치, 1은 1번 위치에 있고, 4는 서가에 없습니다."},{"input":"3\n-5 0 5\n3\n10 -10 0\n","output":"-1\n-1\n2\n","explanation":"10은 가장 큰 값보다 크고 -10은 가장 작은 값보다 작아서 찾을 수 없습니다. 0은 2번 위치에 있습니다."}]'::jsonb, 2, 25, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '1fef1f77-a8bb-5aec-8c16-cdfd980fb841';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('1fef1f77-a8bb-5aec-8c16-cdfd980fb841', 'algorithm', 'binary-search'),
  ('1fef1f77-a8bb-5aec-8c16-cdfd980fb841', 'data_structure', 'array'),
  ('1fef1f77-a8bb-5aec-8c16-cdfd980fb841', 'c', 'function');

delete from public.problem_hints where problem_id = '1fef1f77-a8bb-5aec-8c16-cdfd980fb841';
insert into public.problem_hints (problem_id, level, content) values
  ('1fef1f77-a8bb-5aec-8c16-cdfd980fb841', 1, '배열이 정렬되어 있다는 사실을 어떻게 활용할 수 있을까요? 가운데 책 하나만 보고도 찾는 번호가 왼쪽 절반에 있는지 오른쪽 절반에 있는지 알 수 있지 않을까요?'),
  ('1fef1f77-a8bb-5aec-8c16-cdfd980fb841', 2, '앞에서부터 차례로 찾으면 질문 하나에 최대 N번, 전체 100억 번까지 비교하게 됩니다. 또 같은 번호가 여러 개 있을 때는 그중 하나를 찾는 것이 아니라 가장 왼쪽 위치를 찾아야 합니다.'),
  ('1fef1f77-a8bb-5aec-8c16-cdfd980fb841', 3, '이분 탐색으로 "값이 x 이상인 첫 위치"(lower bound)를 찾습니다. 가운데 값이 x보다 작으면 오른쪽 절반을, 아니면 가운데를 포함한 왼쪽 절반을 남깁니다. 탐색이 끝난 위치의 값이 x와 같으면 그 위치가 답이고, 범위를 벗어났거나 값이 다르면 -1입니다.'),
  ('1fef1f77-a8bb-5aec-8c16-cdfd980fb841', 4, 'lowerBound(arr, x):
  lo = 0, hi = N        // 답은 [lo, hi) 범위 안에 있음
  while lo < hi:
    mid = (lo + hi) / 2
    if arr[mid] < x: lo = mid + 1
    else: hi = mid
  return lo

idx = lowerBound(arr, x)
출력 (idx < N && arr[idx] == x) ? idx + 1 : -1');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('1fef1f77-a8bb-5aec-8c16-cdfd980fb841', '질문마다 순차 탐색하면 O(N × M)이라 최대 100억 번 비교로 시간 초과입니다. 배열이 정렬되어 있으므로 **이분 탐색**을 씁니다.

같은 값이 여러 번 나올 수 있으므로 "x와 같은 값을 아무거나" 찾으면 안 되고, **x 이상인 값이 처음 나오는 위치(lower bound)**를 구해야 합니다.

1. 탐색 범위를 `[lo, hi) = [0, N)`으로 둡니다.
2. `arr[mid] < x`이면 mid까지는 모두 x보다 작으므로 `lo = mid + 1`.
3. 그렇지 않으면 mid가 답일 수도 있으므로 `hi = mid`.
4. 끝나면 lo가 x 이상인 첫 위치입니다. `lo < N`이고 `arr[lo] == x`이면 `lo + 1`(1번부터 세므로), 아니면 `-1`.

**시간복잡도** O(M log N)
**공간복잡도** O(N)

**자주 하는 실수**
- `arr[mid] == x`를 찾자마자 반환해서 중복 중 가장 왼쪽이 아닌 위치를 출력
- x가 모든 값보다 크면 lo = N이 되는데, 이때 `arr[lo]`에 접근해 배열 범위를 벗어남
- 위치를 0부터 출력 (문제는 1부터)
- `lo <= hi`, `hi = mid - 1` 같은 다른 방식의 경계와 섞어 써서 무한 루프 발생

**언어별 팁**
- Java: `Arrays.binarySearch`는 중복이 있을 때 어느 위치를 반환할지 보장하지 않으므로 이 문제에는 맞지 않습니다.
- C: lower bound를 `int lower_bound(const int *arr, int n, int x)` 같은 함수로 분리하면 main이 간결해집니다.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(br.readLine().trim());\n        int[] books = new int[n];\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        for (int i = 0; i < n; i++) {\n            books[i] = Integer.parseInt(st.nextToken());\n        }\n\n        int m = Integer.parseInt(br.readLine().trim());\n        st = new StringTokenizer(br.readLine());\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < m; i++) {\n            int target = Integer.parseInt(st.nextToken());\n            int idx = lowerBound(books, target);\n            sb.append(idx < n && books[idx] == target ? idx + 1 : -1).append(''\\n'');\n        }\n        System.out.print(sb);\n    }\n\n    /** target 이상인 값이 처음 나오는 인덱스. 없으면 arr.length */\n    static int lowerBound(int[] arr, int target) {\n        int lo = 0;\n        int hi = arr.length;\n        while (lo < hi) {\n            int mid = (lo + hi) >>> 1;\n            if (arr[mid] < target) {\n                lo = mid + 1;\n            } else {\n                hi = mid;\n            }\n        }\n        return lo;\n    }\n}\n","c":"#include <stdio.h>\n\n#define MAX_N 100000\n\nint books[MAX_N];\n\n/* target 이상인 값이 처음 나오는 인덱스. 없으면 n */\nint lower_bound(const int *arr, int n, int target) {\n    int lo = 0;\n    int hi = n;\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (arr[mid] < target) {\n            lo = mid + 1;\n        } else {\n            hi = mid;\n        }\n    }\n    return lo;\n}\n\nint main(void) {\n    int n, m;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    for (int i = 0; i < n; i++) {\n        scanf(\"%d\", &books[i]);\n    }\n\n    scanf(\"%d\", &m);\n    for (int i = 0; i < m; i++) {\n        int target;\n        scanf(\"%d\", &target);\n        int idx = lower_bound(books, n, target);\n        printf(\"%d\\n\", (idx < n && books[idx] == target) ? idx + 1 : -1);\n    }\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- stair-climbing: 계단 오르기 경우의 수
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('cbe89928-d943-5936-990e-4a9740b8e9aa', 'stair-climbing', '계단 오르기 경우의 수', '전망대로 올라가는 계단이 N칸 있습니다. 서준이는 한 번에 계단을 **1칸** 또는 **2칸**씩 오를 수 있습니다.

바닥에서 출발해 정확히 N번째 칸에 도착하는 방법은 모두 몇 가지일까요? 오르는 순서가 다르면 다른 방법으로 셉니다. 예를 들어 3칸을 "1칸 → 2칸"으로 오르는 것과 "2칸 → 1칸"으로 오르는 것은 서로 다른 방법입니다.

방법의 수가 매우 커질 수 있으므로 **1,000,000,007로 나눈 나머지**를 구하세요.', '첫째 줄에 계단의 수 N이 주어집니다.', 'N번째 칸에 도착하는 방법의 수를 1,000,000,007로 나눈 나머지를 출력합니다.', '- 1 ≤ N ≤ 1,000,000',
   '[{"input":"3\n","output":"3\n","explanation":"1+1+1, 1+2, 2+1의 세 가지 방법이 있습니다."},{"input":"5\n","output":"8\n","explanation":"2칸을 한 번도 쓰지 않는 방법 1가지, 한 번 쓰는 방법 4가지(1이 세 개, 2가 하나인 순서), 두 번 쓰는 방법 3가지(1이 하나, 2가 두 개인 순서)로 모두 8가지입니다."}]'::jsonb, 2, 20, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = 'cbe89928-d943-5936-990e-4a9740b8e9aa';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('cbe89928-d943-5936-990e-4a9740b8e9aa', 'algorithm', 'dp');

delete from public.problem_hints where problem_id = 'cbe89928-d943-5936-990e-4a9740b8e9aa';
insert into public.problem_hints (problem_id, level, content) values
  ('cbe89928-d943-5936-990e-4a9740b8e9aa', 1, 'N번째 칸에 도착하기 직전에 서준이는 어디에 서 있었을까요? 가능한 위치는 몇 군데뿐입니다.'),
  ('cbe89928-d943-5936-990e-4a9740b8e9aa', 2, 'N번째 칸에 도착하는 방법은 "N-1번째 칸에서 1칸 오르기"와 "N-2번째 칸에서 2칸 오르기"로 겹치지 않게 나눌 수 있습니다. 작은 칸의 답을 알면 큰 칸의 답을 만들 수 있다는 뜻입니다. 시작점(1칸, 2칸)의 답은 직접 세어 보세요.'),
  ('cbe89928-d943-5936-990e-4a9740b8e9aa', 3, 'ways[i] = i번째 칸에 도착하는 방법의 수라고 하면 ways[i] = ways[i-1] + ways[i-2]입니다. ways[1] = 1, ways[2] = 2에서 시작해 N까지 차례로 채우는 동적 계획법(DP)을 사용하고, 더할 때마다 1,000,000,007로 나눈 나머지만 남깁니다.'),
  ('cbe89928-d943-5936-990e-4a9740b8e9aa', 4, 'if N == 1: 출력 1
prev2 = 1   // ways[1]
prev1 = 2   // ways[2]
for i in 3..N:
  cur = (prev1 + prev2) % 1000000007
  prev2 = prev1
  prev1 = cur
출력 ways[N]');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('cbe89928-d943-5936-990e-4a9740b8e9aa', '마지막 한 걸음을 기준으로 경우를 나눕니다. N번째 칸에 도착하기 직전에는 반드시 N-1번째 칸(1칸 오름) 또는 N-2번째 칸(2칸 오름)에 있었고, 이 두 경우는 겹치지 않습니다.

`ways[i] = ways[i-1] + ways[i-2]`, `ways[1] = 1`, `ways[2] = 2`

작은 문제의 답을 저장해 두고 큰 문제를 푸는 **동적 계획법(DP)**입니다. 값은 피보나치 수열과 같습니다. 직전 두 값만 필요하므로 배열 없이 변수 두 개로도 풀 수 있습니다.

**시간복잡도** O(N)
**공간복잡도** O(1) (변수 두 개) 또는 O(N) (배열 사용)

**자주 하는 실수**
- 나머지 연산을 마지막에 한 번만 해서 오버플로 발생 (N = 100만이면 방법의 수는 20만 자리가 넘습니다). 더할 때마다 나머지를 구해야 합니다.
- 나머지를 구하기 전의 합은 최대 약 2 × 10^9으로 int 최댓값(약 2.147 × 10^9)에 아슬아슬하게 가깝습니다. Java는 `long`, C는 `long long`을 쓰면 안전합니다.
- 재귀로 `f(n-1) + f(n-2)`를 메모 없이 호출하면 같은 계산이 기하급수적으로 반복되어 시간 초과가 나고, N이 크면 재귀 깊이 때문에 스택 오버플로도 생깁니다.
- N = 1일 때 ways[2]에 접근하는 경계 실수', '{"java":"import java.io.*;\n\npublic class Main {\n    static final long MOD = 1_000_000_007L;\n\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(br.readLine().trim());\n        System.out.println(countWays(n));\n    }\n\n    /** ways[i] = ways[i-1] + ways[i-2]. 직전 두 값만 변수로 유지한다. */\n    static long countWays(int n) {\n        if (n == 1) return 1;\n        long prev2 = 1; // ways[1]\n        long prev1 = 2; // ways[2]\n        for (int i = 3; i <= n; i++) {\n            long cur = (prev1 + prev2) % MOD;\n            prev2 = prev1;\n            prev1 = cur;\n        }\n        return prev1;\n    }\n}\n","c":"#include <stdio.h>\n\n#define MOD 1000000007LL\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n\n    if (n == 1) {\n        printf(\"1\\n\");\n        return 0;\n    }\n\n    /* ways[i] = ways[i-1] + ways[i-2]. 직전 두 값만 변수로 유지한다. */\n    long long prev2 = 1; /* ways[1] */\n    long long prev1 = 2; /* ways[2] */\n    for (int i = 3; i <= n; i++) {\n        long long cur = (prev1 + prev2) % MOD;\n        prev2 = prev1;\n        prev1 = cur;\n    }\n\n    printf(\"%lld\\n\", prev1);\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- student-average: 학생 평균 점수
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('afc1e1e2-be3c-5621-9b21-c19bb0b28ff1', 'student-average', '학생 평균 점수', '담임 선생님이 이번 시험 결과를 정리하려고 합니다. 반 학생 전체의 평균 점수를 구한 다음, **점수가 평균 이상인 학생**을 칭찬 명단에 올리려고 합니다.

학생 N명의 이름과 점수가 주어질 때, 점수가 평균 이상인 학생의 수와 이름을 출력하세요.

- 평균은 (전체 점수의 합) ÷ N이며, 소수일 수 있습니다.
- 점수가 평균과 정확히 같은 학생도 명단에 포함합니다.', '첫째 줄에 학생 수 N이 주어집니다.
둘째 줄부터 N개의 줄에 걸쳐 학생의 이름과 점수가 공백으로 구분되어 한 줄에 한 명씩 주어집니다.', '첫째 줄에 점수가 평균 이상인 학생의 수 K를 출력합니다.
둘째 줄부터 K개의 줄에 그 학생들의 이름을 **입력된 순서대로** 한 줄에 하나씩 출력합니다.', '- 1 ≤ N ≤ 100
- 이름은 영어 대소문자로만 이루어져 있고, 길이는 1 이상 20 이하입니다.
- 학생들의 이름은 서로 다릅니다.
- 0 ≤ 점수 ≤ 100 (점수는 정수)',
   '[{"input":"3\nAlice 70\nBob 80\nChris 90\n","output":"2\nBob\nChris\n","explanation":"평균은 (70 + 80 + 90) ÷ 3 = 80점입니다. 평균과 같은 Bob과 평균보다 높은 Chris가 명단에 오릅니다."},{"input":"4\nMina 60\nJun 85\nSora 72\nHyun 95\n","output":"2\nJun\nHyun\n","explanation":"평균은 312 ÷ 4 = 78점입니다. 78점 이상인 Jun과 Hyun을 입력된 순서대로 출력합니다."}]'::jsonb, 1, 20, array['c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = 'afc1e1e2-be3c-5621-9b21-c19bb0b28ff1';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('afc1e1e2-be3c-5621-9b21-c19bb0b28ff1', 'data_structure', 'array'),
  ('afc1e1e2-be3c-5621-9b21-c19bb0b28ff1', 'c', 'struct'),
  ('afc1e1e2-be3c-5621-9b21-c19bb0b28ff1', 'c', 'function');

delete from public.problem_hints where problem_id = 'afc1e1e2-be3c-5621-9b21-c19bb0b28ff1';
insert into public.problem_hints (problem_id, level, content) values
  ('afc1e1e2-be3c-5621-9b21-c19bb0b28ff1', 1, '학생 한 명은 이름과 점수라는 두 가지 정보를 가집니다. 이 둘을 하나로 묶어서 다룰 수 있는 C의 문법은 무엇일까요?'),
  ('afc1e1e2-be3c-5621-9b21-c19bb0b28ff1', 2, '평균은 모든 점수를 다 읽어야 알 수 있습니다. 그렇다면 학생 정보를 읽으면서 바로 출력할 수 있을까요? 또, 평균이 소수일 때 비교는 어떻게 하면 안전할까요?'),
  ('afc1e1e2-be3c-5621-9b21-c19bb0b28ff1', 3, '이름과 점수를 담는 구조체를 만들고, 구조체 배열에 모든 학생을 저장합니다. 총점을 구하는 함수를 따로 만든 뒤, 배열을 다시 처음부터 훑으며 평균 이상인 학생을 고릅니다. 실수 대신 "점수 × N ≥ 총점"으로 비교하면 소수 오차가 없습니다.'),
  ('afc1e1e2-be3c-5621-9b21-c19bb0b28ff1', 4, 'struct Student { 이름, 점수 }
students[N]에 모두 읽기
sum = 총점(students, N)
count = 점수 × N ≥ sum 인 학생 수
출력 count
for 학생 s in students:
  if s.점수 × N ≥ sum: 출력 s.이름');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('afc1e1e2-be3c-5621-9b21-c19bb0b28ff1', '평균을 알아야 비교할 수 있으므로 **학생 정보를 먼저 모두 저장**해야 합니다. 이름과 점수를 함께 다루기 위해 구조체를 사용합니다.

```
struct Student {
    char name[21];   // 최대 20글자 + 널 문자
    int score;
};
```

1. `struct Student` 배열에 N명의 정보를 읽어 둡니다.
2. 총점을 구하는 함수를 만들어 `sum`을 계산합니다.
3. 평균 이상인지는 `score >= sum / N` 대신 양변에 N을 곱한 **`score * N >= sum`**으로 비교합니다. 정수끼리 비교하므로 소수 오차나 정수 나눗셈의 버림 문제가 없습니다.
4. 조건을 만족하는 학생 수를 먼저 출력하고, 배열을 앞에서부터 다시 훑으며 이름을 출력합니다.

최고 점수를 받은 학생은 항상 평균 이상이므로 K는 1 이상입니다.

**시간복잡도** O(N), **공간복잡도** O(N)

**자주 하는 실수**
- `sum / N`을 정수 나눗셈으로 계산해서 평균이 78.5일 때 78로 버려짐 (78점 학생이 잘못 포함됨)
- 이름 배열을 `char name[20]`으로 잡아 20글자 이름에서 널 문자 자리가 없음
- 구조체 배열을 함수에 넘길 때는 배열의 시작 주소가 전달되므로, 값을 바꾸지 않는 함수라면 `const struct Student *`로 받으면 의도가 분명해집니다.', '{"c":"#include <stdio.h>\n\n#define MAX_N 100\n#define MAX_NAME 20\n\nstruct Student {\n    char name[MAX_NAME + 1];\n    int score;\n};\n\nint total_score(const struct Student *students, int n) {\n    int sum = 0;\n    for (int i = 0; i < n; i++) {\n        sum += students[i].score;\n    }\n    return sum;\n}\n\n/* 평균 이상인지 정수로 비교한다: score >= sum / n  <=>  score * n >= sum */\nint is_above_average(const struct Student *s, int sum, int n) {\n    return s->score * n >= sum;\n}\n\nint main(void) {\n    struct Student students[MAX_N];\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    for (int i = 0; i < n; i++) {\n        scanf(\"%20s %d\", students[i].name, &students[i].score);\n    }\n\n    int sum = total_score(students, n);\n\n    int count = 0;\n    for (int i = 0; i < n; i++) {\n        if (is_above_average(&students[i], sum, n)) count++;\n    }\n\n    printf(\"%d\\n\", count);\n    for (int i = 0; i < n; i++) {\n        if (is_above_average(&students[i], sum, n)) {\n            printf(\"%s\\n\", students[i].name);\n        }\n    }\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- student-ranking: 성적순 정렬
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('8297ad0e-7725-5343-a443-ce3208e0b881', 'student-ranking', '성적순 정렬', '코딩 동아리에서 모의 코딩테스트를 치렀습니다. 운영진은 N명의 이름과 점수를 모아 순위표를 만들려고 합니다. 순위표는 다음 규칙에 따라 위에서부터 정렬합니다.

1. 점수가 **높은** 학생이 먼저 옵니다.
2. 점수가 같다면 이름이 **사전순으로 앞서는** 학생이 먼저 옵니다.

사전순은 알파벳을 앞 글자부터 차례로 비교하며, 한 이름이 다른 이름의 앞부분과 완전히 같다면 더 짧은 이름이 앞섭니다. 예를 들어 `kim`은 `kimi`보다 앞섭니다.

규칙에 맞게 정렬한 순위표를 출력하세요.', '첫째 줄에 학생 수 N이 주어집니다.

둘째 줄부터 N개의 줄에 걸쳐 학생의 이름과 점수가 공백으로 구분되어 한 줄에 한 명씩 주어집니다.', '정렬한 순서대로 N개의 줄에 걸쳐 각 학생의 이름과 점수를 공백 하나로 구분해 출력합니다.', '- 1 ≤ N ≤ 100,000
- 이름은 알파벳 소문자로만 이루어져 있고, 길이는 1 이상 10 이하입니다.
- 모든 학생의 이름은 서로 다릅니다.
- 0 ≤ 점수 ≤ 100 (정수)',
   '[{"input":"5\njiho 90\nminsu 85\nara 90\nyuna 100\nbora 85\n","output":"yuna 100\nara 90\njiho 90\nbora 85\nminsu 85\n","explanation":"100점인 yuna가 맨 위에 옵니다. 90점인 ara와 jiho는 이름 사전순으로 ara가 먼저, 85점인 bora와 minsu도 bora가 먼저 옵니다."},{"input":"3\nkimi 70\nkim 70\nki 70\n","output":"ki 70\nkim 70\nkimi 70\n","explanation":"세 명의 점수가 모두 같습니다. ki가 kim의 앞부분과 같고 kim이 kimi의 앞부분과 같으므로 짧은 이름부터 옵니다."}]'::jsonb, 2, 25, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '8297ad0e-7725-5343-a443-ce3208e0b881';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('8297ad0e-7725-5343-a443-ce3208e0b881', 'algorithm', 'sorting'),
  ('8297ad0e-7725-5343-a443-ce3208e0b881', 'java', 'comparator'),
  ('8297ad0e-7725-5343-a443-ce3208e0b881', 'java', 'oop'),
  ('8297ad0e-7725-5343-a443-ce3208e0b881', 'c', 'struct');

delete from public.problem_hints where problem_id = '8297ad0e-7725-5343-a443-ce3208e0b881';
insert into public.problem_hints (problem_id, level, content) values
  ('8297ad0e-7725-5343-a443-ce3208e0b881', 1, '정렬 함수는 "두 학생 중 누가 먼저 와야 하는가"만 알려 주면 나머지를 알아서 해 줍니다. 두 학생을 비교하는 규칙을 어떻게 표현할 수 있을까요?'),
  ('8297ad0e-7725-5343-a443-ce3208e0b881', 2, '기준이 두 개입니다. 첫 번째 기준(점수)으로 순서가 정해지면 두 번째 기준은 볼 필요가 없고, 첫 번째 기준이 같을 때만 두 번째 기준(이름)을 봅니다. 점수는 내림차순, 이름은 오름차순이라는 점도 주의하세요.'),
  ('8297ad0e-7725-5343-a443-ce3208e0b881', 3, '이름과 점수를 하나로 묶는 클래스(Java) 또는 구조체(C)를 만들고, 비교 함수에서 점수가 다르면 점수가 큰 쪽을 앞으로, 같으면 문자열 비교 결과로 순서를 정합니다. 그 다음 언어가 제공하는 정렬 함수에 비교 함수를 넘깁니다.'),
  ('8297ad0e-7725-5343-a443-ce3208e0b881', 4, 'compare(a, b):
  if a.score != b.score:
    return b.score - a.score   // 점수 내림차순
  return a.name과 b.name의 사전순 비교 결과   // 이름 오름차순

students를 compare 기준으로 정렬
각 학생에 대해 "이름 점수" 출력');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('8297ad0e-7725-5343-a443-ce3208e0b881', '학생 한 명의 정보(이름, 점수)를 하나로 묶고, **다중 기준 비교 함수**를 정의해 정렬합니다.

비교 규칙
1. 점수가 다르면 점수가 큰 학생이 앞 → `b.score - a.score`
2. 점수가 같으면 이름 사전순 → Java는 `a.name.compareTo(b.name)`, C는 `strcmp(a->name, b->name)`

두 메서드 모두 "한쪽이 다른 쪽의 앞부분이면 짧은 쪽이 작다"는 규칙을 이미 따르므로 따로 처리할 필요가 없습니다.

**시간복잡도** O(N log N × L) (L은 이름 길이, 최대 10)
**공간복잡도** O(N)

**자주 하는 실수**
- 점수와 이름을 각각 다른 배열에 저장한 뒤 한쪽만 정렬해서 짝이 어긋남
- 점수를 오름차순으로 정렬하거나, 동점일 때 이름을 내림차순으로 정렬
- C에서 `==`로 문자열을 비교 (주소를 비교하게 됨) → `strcmp`를 써야 합니다.
- 출력이 최대 100,000줄인데 매 줄 출력 함수를 따로 호출해 느려짐

**언어별 팁**
- Java: `Comparator.comparingInt((Student s) -> s.score).reversed().thenComparing(s -> s.name)`처럼 조합할 수도 있고, 람다 하나로 직접 비교해도 됩니다. 출력은 `StringBuilder`로 모아서 하세요.
- C: `struct`에 `char name[11]`(널 문자 포함)과 `int score`를 두고 `qsort`의 비교 함수에서 `const struct Student *`로 형 변환해 비교합니다.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    static class Student {\n        final String name;\n        final int score;\n\n        Student(String name, int score) {\n            this.name = name;\n            this.score = score;\n        }\n    }\n\n    /** 점수 내림차순, 점수가 같으면 이름 사전순 */\n    static final Comparator<Student> RANKING = (a, b) -> {\n        if (a.score != b.score) {\n            return Integer.compare(b.score, a.score);\n        }\n        return a.name.compareTo(b.name);\n    };\n\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(br.readLine().trim());\n\n        List<Student> students = new ArrayList<>(n);\n        for (int i = 0; i < n; i++) {\n            StringTokenizer st = new StringTokenizer(br.readLine());\n            String name = st.nextToken();\n            int score = Integer.parseInt(st.nextToken());\n            students.add(new Student(name, score));\n        }\n\n        students.sort(RANKING);\n\n        StringBuilder sb = new StringBuilder();\n        for (Student s : students) {\n            sb.append(s.name).append('' '').append(s.score).append(''\\n'');\n        }\n        System.out.print(sb);\n    }\n}\n","c":"#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n#define MAX_N 100000\n\nstruct Student {\n    char name[11]; /* 최대 10글자 + 널 문자 */\n    int score;\n};\n\nstruct Student students[MAX_N];\n\n/* 점수 내림차순, 점수가 같으면 이름 사전순 */\nint compare_student(const void *a, const void *b) {\n    const struct Student *x = (const struct Student *)a;\n    const struct Student *y = (const struct Student *)b;\n    if (x->score != y->score) {\n        return y->score - x->score;\n    }\n    return strcmp(x->name, y->name);\n}\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    for (int i = 0; i < n; i++) {\n        scanf(\"%10s %d\", students[i].name, &students[i].score);\n    }\n\n    qsort(students, n, sizeof(struct Student), compare_student);\n\n    for (int i = 0; i < n; i++) {\n        printf(\"%s %d\\n\", students[i].name, students[i].score);\n    }\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- subset-sum-count: 합이 S인 부분수열의 개수
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('f3bf2ada-3448-5d11-9cb3-1522e3110da8', 'subset-sum-count', '합이 S인 부분수열의 개수', '정수 N개로 이루어진 수열이 있습니다. 이 수열에서 원소를 **하나 이상** 골라 만든 부분수열 중, 고른 원소의 합이 정확히 S인 것은 몇 개인지 구하세요.

- 부분수열은 원래 수열에서 몇 개의 원소를 골라 순서를 유지한 채 나열한 것입니다. 연속하지 않아도 됩니다.
- 아무것도 고르지 않은 경우(공집합)는 **세지 않습니다**. 따라서 S = 0이어도 공집합은 답에 포함되지 않습니다.
- 값이 같더라도 **위치가 다른 원소를 고르면 다른 부분수열**입니다.', '첫째 줄에 수열의 길이 N과 목표 합 S가 공백으로 구분되어 주어집니다.

둘째 줄에 수열의 원소 N개가 공백으로 구분되어 주어집니다.', '합이 S인, 공집합이 아닌 부분수열의 개수를 출력합니다. 그런 부분수열이 없으면 `0`을 출력합니다.', '- 1 ≤ N ≤ 20
- -100,000 ≤ 각 원소 ≤ 100,000
- -2,000,000 ≤ S ≤ 2,000,000',
   '[{"input":"5 0\n-7 -3 -2 5 8\n","output":"1\n","explanation":"(-3, -2, 5)를 고르면 합이 0이 되고, 다른 방법은 없습니다. 공집합도 합이 0이지만 세지 않습니다."},{"input":"3 2\n1 1 1\n","output":"3\n","explanation":"세 개의 1 중 두 개를 고르는 방법은 (1번, 2번), (1번, 3번), (2번, 3번)의 세 가지입니다. 값이 같아도 고른 위치가 다르면 다른 부분수열입니다."}]'::jsonb, 3, 35, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = 'f3bf2ada-3448-5d11-9cb3-1522e3110da8';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('f3bf2ada-3448-5d11-9cb3-1522e3110da8', 'algorithm', 'backtracking'),
  ('f3bf2ada-3448-5d11-9cb3-1522e3110da8', 'algorithm', 'recursion'),
  ('f3bf2ada-3448-5d11-9cb3-1522e3110da8', 'c', 'recursion');

delete from public.problem_hints where problem_id = 'f3bf2ada-3448-5d11-9cb3-1522e3110da8';
insert into public.problem_hints (problem_id, level, content) values
  ('f3bf2ada-3448-5d11-9cb3-1522e3110da8', 1, '각 원소는 "고른다"와 "고르지 않는다" 두 가지 선택만 있습니다. N개의 원소에 대해 이 선택을 모두 해 보면 경우의 수는 몇 가지일까요? N ≤ 20이라는 제한이 무엇을 말해 주는지 생각해 보세요.'),
  ('f3bf2ada-3448-5d11-9cb3-1522e3110da8', 2, '앞에서부터 원소를 하나씩 보며 선택을 내려 가면, 선택을 마친 원소의 개수와 지금까지의 합만 알면 다음 단계를 진행할 수 있습니다. 그리고 S = 0일 때 아무것도 고르지 않은 경우가 섞이지 않도록 어떻게 처리할지 정해야 합니다.'),
  ('f3bf2ada-3448-5d11-9cb3-1522e3110da8', 3, '재귀 함수 dfs(index, sum)을 만듭니다. index번째 원소를 더한 경우와 더하지 않은 경우로 나누어 dfs(index + 1, ...)을 두 번 호출하고, index가 N에 도달하면 sum이 S인지 확인합니다. 이렇게 세면 공집합이 포함되므로, S = 0이면 마지막에 1을 빼야 합니다.'),
  ('f3bf2ada-3448-5d11-9cb3-1522e3110da8', 4, 'count = 0
dfs(index, sum):
  if index == N:
    if sum == S: count++
    return
  dfs(index + 1, sum + a[index])   // 고른다
  dfs(index + 1, sum)              // 고르지 않는다

dfs(0, 0)
if S == 0: count--   // 공집합 제외
출력 count');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('f3bf2ada-3448-5d11-9cb3-1522e3110da8', '원소마다 "고른다 / 고르지 않는다"를 결정하면 가능한 부분수열은 2^N가지이고, N ≤ 20이면 최대 약 100만 가지라서 모두 확인할 수 있습니다.

**재귀(백트래킹)**로 모든 선택을 탐색합니다.

- `dfs(index, sum)`: 0 ~ index-1번째 원소까지 선택을 마쳤고, 고른 원소의 합이 sum인 상태
- index번째 원소를 고르는 경우 `dfs(index + 1, sum + a[index])`, 고르지 않는 경우 `dfs(index + 1, sum)`
- index == N이면 sum == S인지 확인해 개수를 셉니다.

이 방식은 아무것도 고르지 않은 경우(공집합, 합 0)도 한 번 세므로 **S = 0이면 답에서 1을 뺍니다.** 또는 "지금까지 고른 개수"를 함께 넘겨 1개 이상일 때만 세어도 됩니다.

원소에 음수가 있어서 "합이 S를 넘으면 중단" 같은 가지치기는 쓸 수 없습니다.

**시간복잡도** O(2^N)
**공간복잡도** O(N) (재귀 깊이)

**자주 하는 실수**
- S = 0일 때 공집합을 빼지 않아 답이 1 크게 나옴
- 음수가 있는데 `sum > S`이면 중단하는 가지치기를 넣어 답을 놓침
- 값이 같은 원소를 중복 제거해서 위치가 다른 부분수열을 하나로 셈
- index == N이 되기 전에 sum == S를 만나자마자 세고 return해서, 뒤의 원소를 더 고르는 경우(0을 더하는 경우 등)를 놓침

**언어별 팁**
- 개수는 최대 2^20 - 1 = 1,048,575이고 합은 최대 ±2,000,000이므로 int로 충분합니다.
- C: 전역 변수 count와 배열을 두고 `void dfs(int index, int sum)`처럼 작성하면 간단합니다.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    static int n;\n    static int target;\n    static int[] values;\n    static int count = 0;\n\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        n = Integer.parseInt(st.nextToken());\n        target = Integer.parseInt(st.nextToken());\n\n        values = new int[n];\n        st = new StringTokenizer(br.readLine());\n        for (int i = 0; i < n; i++) {\n            values[i] = Integer.parseInt(st.nextToken());\n        }\n\n        dfs(0, 0);\n        if (target == 0) {\n            count--; // 아무것도 고르지 않은 경우(공집합)는 제외\n        }\n        System.out.println(count);\n    }\n\n    /** index번째 원소부터 고를지 말지 결정한다. sum은 지금까지 고른 원소의 합 */\n    static void dfs(int index, int sum) {\n        if (index == n) {\n            if (sum == target) count++;\n            return;\n        }\n        dfs(index + 1, sum + values[index]); // 고른다\n        dfs(index + 1, sum);                 // 고르지 않는다\n    }\n}\n","c":"#include <stdio.h>\n\n#define MAX_N 20\n\nint n, target;\nint values[MAX_N];\nint count = 0;\n\n/* index번째 원소부터 고를지 말지 결정한다. sum은 지금까지 고른 원소의 합 */\nvoid dfs(int index, int sum) {\n    if (index == n) {\n        if (sum == target) count++;\n        return;\n    }\n    dfs(index + 1, sum + values[index]); /* 고른다 */\n    dfs(index + 1, sum);                 /* 고르지 않는다 */\n}\n\nint main(void) {\n    if (scanf(\"%d %d\", &n, &target) != 2) return 0;\n    for (int i = 0; i < n; i++) {\n        scanf(\"%d\", &values[i]);\n    }\n\n    dfs(0, 0);\n    if (target == 0) {\n        count--; /* 아무것도 고르지 않은 경우(공집합)는 제외 */\n    }\n    printf(\"%d\\n\", count);\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- sum-of-digits: 자릿수의 합
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('ada9b760-c85b-59a0-ae29-7cb068b69b90', 'sum-of-digits', '자릿수의 합', '도서관의 책에는 아주 긴 관리 번호가 붙어 있습니다. 사서는 번호를 잘못 옮겨 적었는지 확인하려고, 번호의 각 자리 숫자를 모두 더한 값을 함께 적어 둡니다.

자연수 N이 주어질 때, N의 각 자리 숫자를 모두 더한 값을 구하세요.

N은 최대 100,000자리까지 길어질 수 있어서 일반적인 정수 자료형에는 담기지 않을 수 있습니다.', '첫째 줄에 자연수 N이 주어집니다.', 'N의 각 자리 숫자의 합을 출력합니다.', '- 1 ≤ N의 자릿수 ≤ 100,000
- N은 숫자(`0`~`9`)로만 이루어져 있고, 0으로 시작하지 않습니다.',
   '[{"input":"12345\n","output":"15\n","explanation":"1 + 2 + 3 + 4 + 5 = 15입니다."},{"input":"9081726354\n","output":"45\n","explanation":"0부터 9까지의 숫자가 한 번씩 등장하므로 합은 0 + 1 + ... + 9 = 45입니다."}]'::jsonb, 1, 10, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = 'ada9b760-c85b-59a0-ae29-7cb068b69b90';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('ada9b760-c85b-59a0-ae29-7cb068b69b90', 'algorithm', 'brute-force'),
  ('ada9b760-c85b-59a0-ae29-7cb068b69b90', 'data_structure', 'string'),
  ('ada9b760-c85b-59a0-ae29-7cb068b69b90', 'java', 'basic-syntax'),
  ('ada9b760-c85b-59a0-ae29-7cb068b69b90', 'c', 'string');

delete from public.problem_hints where problem_id = 'ada9b760-c85b-59a0-ae29-7cb068b69b90';
insert into public.problem_hints (problem_id, level, content) values
  ('ada9b760-c85b-59a0-ae29-7cb068b69b90', 1, 'N이 100,000자리라면 int나 long에 담을 수 있을까요? 숫자를 어떤 형태로 읽어야 할지 먼저 생각해보세요.'),
  ('ada9b760-c85b-59a0-ae29-7cb068b69b90', 2, 'N을 문자열로 읽으면 각 자리는 문자 하나입니다. 문자 ''7''을 숫자 7로 바꾸려면 어떻게 해야 할까요? 문자 코드의 차이를 떠올려보세요.'),
  ('ada9b760-c85b-59a0-ae29-7cb068b69b90', 3, '문자열을 처음부터 끝까지 한 글자씩 보면서, 그 문자가 나타내는 숫자를 합계에 더하면 됩니다. 문자 c의 숫자 값은 c - ''0''입니다.'),
  ('ada9b760-c85b-59a0-ae29-7cb068b69b90', 4, 's = N을 문자열로 읽기
sum = 0
for 문자 c in s:
  sum += c - ''0''
출력 sum');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('ada9b760-c85b-59a0-ae29-7cb068b69b90', 'N이 최대 100,000자리이므로 `long`(약 19자리)으로도 담을 수 없습니다. 따라서 **문자열로 읽어서 한 글자씩 처리**합니다.

1. N을 문자열로 읽습니다.
2. 각 문자 `c`에 대해 `c - ''0''`을 합계에 더합니다. 문자 `''0''`~`''9''`는 코드 값이 연속되어 있으므로 이 계산으로 숫자 값을 얻을 수 있습니다.
3. 합계를 출력합니다. 최댓값은 9 × 100,000 = 900,000이므로 `int`로 충분합니다.

**시간복잡도** O(L), **공간복잡도** O(L) (L은 N의 자릿수)

**자주 하는 실수**
- `Long.parseLong`이나 `scanf("%lld")`로 읽어서 큰 입력에서 오류가 나거나 값이 잘림
- 문자를 그대로 더해서 `''1''`의 코드 값 49가 더해짐
- C에서 문자열 버퍼를 100,000 + 1(널 문자) 크기보다 작게 잡음', '{"java":"import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String n = br.readLine().trim();\n\n        int sum = 0;\n        for (int i = 0; i < n.length(); i++) {\n            sum += n.charAt(i) - ''0'';\n        }\n        System.out.println(sum);\n    }\n}\n","c":"#include <stdio.h>\n\n#define MAX_LEN 100000\n\nchar n[MAX_LEN + 1];\n\nint main(void) {\n    if (scanf(\"%100000s\", n) != 1) return 0;\n\n    int sum = 0;\n    for (int i = 0; n[i] != ''\\0''; i++) {\n        sum += n[i] - ''0'';\n    }\n    printf(\"%d\\n\", sum);\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- task-order: 작업 순서 정하기
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('0714c598-f62a-544d-83a2-d82fb6729141', 'task-order', '작업 순서 정하기', '게임 개발팀이 출시 전에 처리해야 할 작업 N개를 정리했습니다. 작업에는 1번부터 N번까지 번호가 붙어 있습니다.

일부 작업 사이에는 선후 관계가 있습니다. "A B"는 **A번 작업을 끝내야 B번 작업을 시작할 수 있다**는 뜻입니다. 팀은 한 번에 작업 하나씩만 처리합니다.

모든 선후 관계를 지키면서 N개의 작업을 모두 처리하는 순서를 구하세요. 가능한 순서가 여러 가지라면, **매 순간 시작할 수 있는 작업 중 번호가 가장 작은 작업을 먼저** 처리하는 순서를 출력합니다.

선후 관계가 서로 꼬여 있어(예: 1번 다음에 2번, 2번 다음에 1번) 모든 작업을 처리할 수 없다면 `-1`을 출력합니다.', '첫째 줄에 작업의 수 N과 선후 관계의 수 M이 공백으로 구분되어 주어집니다.

둘째 줄부터 M개의 줄에 걸쳐 선후 관계 A B가 주어집니다. A번 작업을 B번 작업보다 먼저 끝내야 한다는 뜻입니다.', '작업을 처리하는 순서를 한 줄에 공백으로 구분하여 출력합니다.

- 시작할 수 있는 작업이 여러 개이면 그중 번호가 가장 작은 작업을 먼저 처리합니다. 이 규칙에 따라 답은 하나로 정해집니다.
- 모든 작업을 처리할 수 없으면 `-1`만 출력합니다.', '- 1 ≤ N ≤ 32,000
- 0 ≤ M ≤ 100,000
- 1 ≤ A, B ≤ N, A ≠ B
- 같은 선후 관계가 여러 번 주어질 수 있습니다.',
   '[{"input":"5 3\n3 1\n5 2\n1 2\n","output":"3 1 4 5 2\n","explanation":"처음 시작할 수 있는 작업은 3, 4, 5번이고 가장 작은 3번을 처리합니다. 그러면 1번을 시작할 수 있게 되어 후보는 1, 4, 5번이 되고 1번을 처리합니다. 이어서 4번, 5번을 처리하면 마지막으로 2번을 시작할 수 있습니다."},{"input":"3 3\n1 2\n2 3\n3 1\n","output":"-1\n","explanation":"1 → 2 → 3 → 1로 선후 관계가 순환하므로 어떤 작업도 먼저 시작할 수 없습니다."}]'::jsonb, 4, 50, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '0714c598-f62a-544d-83a2-d82fb6729141';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('0714c598-f62a-544d-83a2-d82fb6729141', 'algorithm', 'topological-sort'),
  ('0714c598-f62a-544d-83a2-d82fb6729141', 'data_structure', 'graph'),
  ('0714c598-f62a-544d-83a2-d82fb6729141', 'data_structure', 'queue'),
  ('0714c598-f62a-544d-83a2-d82fb6729141', 'data_structure', 'priority-queue');

delete from public.problem_hints where problem_id = '0714c598-f62a-544d-83a2-d82fb6729141';
insert into public.problem_hints (problem_id, level, content) values
  ('0714c598-f62a-544d-83a2-d82fb6729141', 1, '가장 먼저 처리할 수 있는 작업은 어떤 작업일까요? "먼저 끝내야 하는 작업이 하나도 남지 않은" 작업이라는 조건을 숫자 하나로 관리할 수 있을지 생각해보세요.'),
  ('0714c598-f62a-544d-83a2-d82fb6729141', 2, '작업 하나를 처리하면, 그 작업 뒤에 와야 하는 작업들의 "남은 선행 작업 수"가 줄어듭니다. 순환이 있으면 이 과정이 어디서 멈추게 될까요? 또 후보 중 번호가 가장 작은 작업을 매번 빠르게 꺼내려면 일반 큐로 충분할까요?'),
  ('0714c598-f62a-544d-83a2-d82fb6729141', 3, '위상 정렬(Kahn 알고리즘)을 사용합니다. 각 작업의 진입 차수(남은 선행 작업 수)를 세고, 진입 차수가 0인 작업을 후보에 넣습니다. 후보를 꺼낼 때마다 결과에 추가하고 이웃의 진입 차수를 줄여 0이 되면 후보에 넣습니다. 번호가 작은 것부터 꺼내야 하므로 후보는 최소 힙(우선순위 큐)으로 관리합니다. 처리한 작업 수가 N보다 적으면 순환이 있는 것입니다.'),
  ('0714c598-f62a-544d-83a2-d82fb6729141', 4, 'indeg[], adj[] 구성 (A -> B 간선, indeg[B]++)
pq = 최소 힙
for i = 1..N: if indeg[i] == 0: pq.add(i)
order = []
while pq가 비어 있지 않음:
  u = pq.poll()
  order.add(u)
  for v in adj[u]:
    indeg[v]--
    if indeg[v] == 0: pq.add(v)
if order의 길이 < N: 출력 -1
else: order 출력');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('0714c598-f62a-544d-83a2-d82fb6729141', '선후 관계를 방향 그래프(A → B)로 보면, 모든 간선 방향을 지키는 정점 나열이 **위상 정렬**입니다. 여기에 "번호가 작은 작업 먼저"라는 조건이 붙어 답이 하나로 정해집니다.

**Kahn 알고리즘 + 최소 힙**
1. 각 작업의 **진입 차수**(아직 끝나지 않은 선행 작업 수)를 셉니다. 같은 관계가 여러 번 주어지면 그만큼 세고, 그만큼 줄이므로 따로 처리하지 않아도 됩니다.
2. 진입 차수가 0인 작업을 모두 최소 힙에 넣습니다.
3. 힙에서 가장 작은 번호를 꺼내 결과에 추가하고, 그 작업 뒤에 오는 작업들의 진입 차수를 1씩 줄입니다. 0이 된 작업은 힙에 넣습니다.
4. 힙이 비었는데 처리한 작업이 N개보다 적다면, 남은 작업들은 서로를 기다리는 순환에 걸려 있으므로 `-1`을 출력합니다.

**왜 일반 큐가 아니라 힙일까요?** 일반 큐(FIFO)를 쓰면 "먼저 후보가 된 작업"이 먼저 나옵니다. 예를 들어 4번이 처음부터 후보였고 1번이 나중에 후보가 되었다면, 큐는 4번을 먼저 꺼내지만 문제의 규칙은 1번을 먼저 처리하라고 합니다.

**시간복잡도** O((N + M) log N)
**공간복잡도** O(N + M)

**자주 하는 실수**
- 우선순위 큐 대신 일반 큐를 써서 순서가 달라지는 실수
- 순환 판정을 하지 않아 일부 작업만 출력하는 실수
- 간선 방향을 반대로(B → A) 저장하는 실수

**언어별 팁**
- Java: `PriorityQueue<Integer>`는 기본이 최소 힙입니다. 인접 리스트는 `List<List<Integer>>`로, 출력은 `StringBuilder`로 모읍니다.
- C: 최소 힙을 배열로 직접 구현합니다. 넣을 때는 맨 끝에 두고 부모와 비교하며 올리고(sift-up), 꺼낼 때는 맨 끝 원소를 루트로 옮긴 뒤 더 작은 자식과 비교하며 내립니다(sift-down). 인접 리스트는 `head[]`, `next[]`, `to[]` 배열로 만들면 malloc 없이 구현할 수 있습니다.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int n = Integer.parseInt(st.nextToken());\n        int m = Integer.parseInt(st.nextToken());\n\n        List<List<Integer>> adj = new ArrayList<>(n + 1);\n        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());\n        int[] indegree = new int[n + 1];\n        for (int i = 0; i < m; i++) {\n            st = new StringTokenizer(br.readLine());\n            int a = Integer.parseInt(st.nextToken());\n            int b = Integer.parseInt(st.nextToken());\n            adj.get(a).add(b); // a를 끝내야 b를 시작할 수 있다\n            indegree[b]++;\n        }\n\n        // 시작할 수 있는 작업 중 번호가 가장 작은 것을 꺼내기 위해 최소 힙을 쓴다\n        PriorityQueue<Integer> ready = new PriorityQueue<>();\n        for (int i = 1; i <= n; i++) {\n            if (indegree[i] == 0) ready.add(i);\n        }\n\n        StringBuilder sb = new StringBuilder();\n        int processed = 0;\n        while (!ready.isEmpty()) {\n            int u = ready.poll();\n            if (processed > 0) sb.append('' '');\n            sb.append(u);\n            processed++;\n            for (int v : adj.get(u)) {\n                if (--indegree[v] == 0) ready.add(v);\n            }\n        }\n\n        // 처리하지 못한 작업이 남았다면 순환이 있다\n        System.out.println(processed == n ? sb.toString() : \"-1\");\n    }\n}\n","c":"#include <stdio.h>\n\n#define MAX_N 32000\n#define MAX_M 100000\n\n/* 인접 리스트: head[u]에서 시작해 next[]를 따라가며 to[]를 읽는다 */\nint head[MAX_N + 1];\nint next_edge[MAX_M];\nint to[MAX_M];\nint indegree[MAX_N + 1];\n\n/* 최소 힙 */\nint heap[MAX_N + 1];\nint heap_size = 0;\n\nint order[MAX_N];\n\nvoid swap(int *a, int *b) {\n    int t = *a;\n    *a = *b;\n    *b = t;\n}\n\nvoid heap_push(int value) {\n    int i = heap_size++;\n    heap[i] = value;\n    while (i > 0) { /* sift-up: 부모보다 작으면 올린다 */\n        int parent = (i - 1) / 2;\n        if (heap[parent] <= heap[i]) break;\n        swap(&heap[parent], &heap[i]);\n        i = parent;\n    }\n}\n\nint heap_pop(void) {\n    int top = heap[0];\n    heap[0] = heap[--heap_size];\n    int i = 0;\n    for (;;) { /* sift-down: 더 작은 자식과 비교하며 내린다 */\n        int left = 2 * i + 1, right = 2 * i + 2, smallest = i;\n        if (left < heap_size && heap[left] < heap[smallest]) smallest = left;\n        if (right < heap_size && heap[right] < heap[smallest]) smallest = right;\n        if (smallest == i) break;\n        swap(&heap[smallest], &heap[i]);\n        i = smallest;\n    }\n    return top;\n}\n\nint main(void) {\n    int n, m;\n    if (scanf(\"%d %d\", &n, &m) != 2) return 0;\n\n    for (int i = 1; i <= n; i++) head[i] = -1;\n    for (int e = 0; e < m; e++) {\n        int a, b;\n        scanf(\"%d %d\", &a, &b);\n        to[e] = b; /* a를 끝내야 b를 시작할 수 있다 */\n        next_edge[e] = head[a];\n        head[a] = e;\n        indegree[b]++;\n    }\n\n    for (int i = 1; i <= n; i++) {\n        if (indegree[i] == 0) heap_push(i);\n    }\n\n    int processed = 0;\n    while (heap_size > 0) {\n        int u = heap_pop();\n        order[processed++] = u;\n        for (int e = head[u]; e != -1; e = next_edge[e]) {\n            if (--indegree[to[e]] == 0) heap_push(to[e]);\n        }\n    }\n\n    if (processed < n) { /* 처리하지 못한 작업이 남았다면 순환이 있다 */\n        printf(\"-1\\n\");\n        return 0;\n    }\n    for (int i = 0; i < n; i++) {\n        printf(\"%d%c\", order[i], i + 1 < n ? '' '' : ''\\n'');\n    }\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- valid-brackets: 올바른 괄호
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('3943351e-c318-5d25-a9d8-a32a9a94b315', 'valid-brackets', '올바른 괄호', '소괄호 `()`, 중괄호 `{}`, 대괄호 `[]`로만 이루어진 문자열이 주어집니다.

다음 조건을 모두 만족하면 "올바른 괄호 문자열"입니다.

- 여는 괄호는 같은 종류의 닫는 괄호로 닫혀야 합니다.
- 나중에 연 괄호가 먼저 닫혀야 합니다. 예를 들어 `([)]`는 올바르지 않습니다.
- 짝이 맞지 않는 괄호가 남으면 안 됩니다.

주어진 문자열이 올바른 괄호 문자열인지 판별하세요.', '첫째 줄에 괄호 문자열 S가 주어집니다.', 'S가 올바른 괄호 문자열이면 `YES`, 아니면 `NO`를 출력합니다.', '- 1 ≤ S의 길이 ≤ 100,000
- S는 `(`, `)`, `{`, `}`, `[`, `]`로만 이루어져 있습니다.',
   '[{"input":"({[]})\n","output":"YES\n","explanation":"가장 안쪽의 `[]`부터 차례로 짝이 맞게 닫힙니다."},{"input":"([)]\n","output":"NO\n","explanation":"`[`가 닫히기 전에 `)`가 먼저 나와서, 나중에 연 괄호가 먼저 닫히지 않았습니다."}]'::jsonb, 1, 15, array['java', 'c'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '3943351e-c318-5d25-a9d8-a32a9a94b315';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('3943351e-c318-5d25-a9d8-a32a9a94b315', 'data_structure', 'stack'),
  ('3943351e-c318-5d25-a9d8-a32a9a94b315', 'data_structure', 'string'),
  ('3943351e-c318-5d25-a9d8-a32a9a94b315', 'java', 'collection'),
  ('3943351e-c318-5d25-a9d8-a32a9a94b315', 'c', 'array'),
  ('3943351e-c318-5d25-a9d8-a32a9a94b315', 'c', 'string');

delete from public.problem_hints where problem_id = '3943351e-c318-5d25-a9d8-a32a9a94b315';
insert into public.problem_hints (problem_id, level, content) values
  ('3943351e-c318-5d25-a9d8-a32a9a94b315', 1, '괄호를 처리하는 순서를 생각해보세요. 가장 나중에 열린 괄호가 가장 먼저 닫혀야 합니다. 이런 "나중에 들어온 것이 먼저 나가는" 구조를 무엇이라고 할까요?'),
  ('3943351e-c318-5d25-a9d8-a32a9a94b315', 2, '닫는 괄호를 만났을 때 확인해야 할 것은 "직전에 열렸지만 아직 닫히지 않은 괄호"입니다. 문자열을 다 읽은 뒤에도 확인할 것이 하나 더 있습니다.'),
  ('3943351e-c318-5d25-a9d8-a32a9a94b315', 3, '스택을 사용합니다. 여는 괄호는 push하고, 닫는 괄호를 만나면 스택이 비었는지 확인한 뒤 pop한 괄호와 종류가 맞는지 비교합니다. 마지막에 스택이 비어 있어야 합니다.'),
  ('3943351e-c318-5d25-a9d8-a32a9a94b315', 4, 'for 문자 c in S:
  if c가 여는 괄호: stack.push(c)
  else:
    if stack이 비었음: return NO
    top = stack.pop()
    if top과 c가 짝이 아님: return NO
return stack이 비었으면 YES, 아니면 NO');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('3943351e-c318-5d25-a9d8-a32a9a94b315', '가장 나중에 열린 괄호가 가장 먼저 닫혀야 하므로 **스택(LIFO)**이 딱 맞는 자료구조입니다.

1. 여는 괄호를 만나면 스택에 넣습니다.
2. 닫는 괄호를 만나면
   - 스택이 비어 있으면 짝이 없는 닫는 괄호이므로 `NO`
   - 스택에서 꺼낸 괄호와 종류가 다르면 `NO`
3. 끝까지 읽은 뒤 스택이 비어 있어야 `YES`입니다. 남아 있으면 닫히지 않은 괄호가 있다는 뜻입니다.

**시간복잡도** O(N), **공간복잡도** O(N) (모두 여는 괄호인 경우)

**자주 하는 실수**
- 마지막에 스택이 비었는지 확인하지 않아 `((`를 `YES`로 판단
- 스택이 빈 상태에서 pop해서 오류 발생 (`)`로 시작하는 경우)
- Java에서 `Stack` 대신 `ArrayDeque`를 쓰면 더 빠르고 권장되는 방식입니다.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine().trim();\n        System.out.println(isValid(s) ? \"YES\" : \"NO\");\n    }\n\n    static boolean isValid(String s) {\n        Deque<Character> stack = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c == ''('' || c == ''{'' || c == ''['') {\n                stack.push(c);\n                continue;\n            }\n            if (stack.isEmpty()) return false;\n            char open = stack.pop();\n            if (!matches(open, c)) return false;\n        }\n        return stack.isEmpty();\n    }\n\n    static boolean matches(char open, char close) {\n        return (open == ''('' && close == '')'')\n            || (open == ''{'' && close == ''}'')\n            || (open == ''['' && close == '']'');\n    }\n}\n","c":"#include <stdio.h>\n#include <string.h>\n\n#define MAX_LEN 100001\n\nchar s[MAX_LEN + 1];\nchar stack[MAX_LEN];\n\nint matches(char open, char close) {\n    return (open == ''('' && close == '')'')\n        || (open == ''{'' && close == ''}'')\n        || (open == ''['' && close == '']'');\n}\n\nint main(void) {\n    if (scanf(\"%100001s\", s) != 1) return 0;\n\n    int top = 0;\n    int ok = 1;\n    for (int i = 0; s[i] != ''\\0''; i++) {\n        char c = s[i];\n        if (c == ''('' || c == ''{'' || c == ''['') {\n            stack[top++] = c;\n        } else if (top == 0 || !matches(stack[--top], c)) {\n            ok = 0;\n            break;\n        }\n    }\n    if (top != 0) ok = 0;\n\n    printf(\"%s\\n\", ok ? \"YES\" : \"NO\");\n    return 0;\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- vowel-count: 모음 개수 세기
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('bbaff1f6-1f0b-5c63-9d29-d8e356b0b1ac', 'vowel-count', '모음 개수 세기', '영어 발음 연습 앱을 만들고 있습니다. 문장마다 모음이 얼마나 들어 있는지 보여주는 기능이 필요합니다.

영어 문장 하나가 주어질 때, 문장에 들어 있는 모음의 개수를 세어 출력하세요.

- 모음은 `a`, `e`, `i`, `o`, `u` 다섯 글자이며, 대문자 `A`, `E`, `I`, `O`, `U`도 모음으로 셉니다.
- `y`는 모음으로 세지 않습니다.
- 공백과 문장 부호는 세지 않습니다.', '첫째 줄에 영어 문장이 주어집니다. 문장에는 공백이 들어 있을 수 있습니다.', '문장에 들어 있는 모음의 개수를 출력합니다.', '- 1 ≤ 문장의 길이 ≤ 100,000
- 문장은 영어 대소문자, 공백, 문장 부호(`.`, `,`, `!`, `?`)로만 이루어져 있습니다.
- 문장은 공백으로 시작하거나 끝나지 않습니다.',
   '[{"input":"Hello World\n","output":"3\n","explanation":"Hello의 e, o와 World의 o로 모음은 3개입니다."},{"input":"I love Java!\n","output":"5\n","explanation":"대문자 I, love의 o와 e, Java의 a 두 개로 모음은 5개입니다. 대문자도 모음으로 셉니다."}]'::jsonb, 1, 10, array['java'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = 'bbaff1f6-1f0b-5c63-9d29-d8e356b0b1ac';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('bbaff1f6-1f0b-5c63-9d29-d8e356b0b1ac', 'algorithm', 'frequency-count'),
  ('bbaff1f6-1f0b-5c63-9d29-d8e356b0b1ac', 'data_structure', 'string'),
  ('bbaff1f6-1f0b-5c63-9d29-d8e356b0b1ac', 'java', 'basic-syntax');

delete from public.problem_hints where problem_id = 'bbaff1f6-1f0b-5c63-9d29-d8e356b0b1ac';
insert into public.problem_hints (problem_id, level, content) values
  ('bbaff1f6-1f0b-5c63-9d29-d8e356b0b1ac', 1, '문장에 공백이 들어 있습니다. 문장 전체를 한 번에 읽으려면 어떤 방법을 써야 할까요?'),
  ('bbaff1f6-1f0b-5c63-9d29-d8e356b0b1ac', 2, '어떤 문자가 모음인지 판단하는 기준을 정리해보세요. 대문자와 소문자를 각각 비교해야 할까요, 아니면 한쪽으로 맞춘 뒤 비교할 수 있을까요?'),
  ('bbaff1f6-1f0b-5c63-9d29-d8e356b0b1ac', 3, '문장을 한 줄 통째로 읽은 뒤 문자를 하나씩 보면서, 모음이면 개수를 1 늘립니다. 소문자로 바꾼 뒤 a, e, i, o, u 중 하나인지 확인하면 비교가 간단해집니다.'),
  ('bbaff1f6-1f0b-5c63-9d29-d8e356b0b1ac', 4, 'line = 한 줄 읽기
count = 0
for 문자 c in line:
  lower = c를 소문자로
  if lower가 a, e, i, o, u 중 하나: count++
출력 count');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('bbaff1f6-1f0b-5c63-9d29-d8e356b0b1ac', '문장을 **한 줄 통째로 읽고**, 문자를 하나씩 확인하며 모음이면 개수를 셉니다.

1. `BufferedReader.readLine()`으로 공백을 포함한 문장 전체를 읽습니다.
2. 각 문자를 `Character.toLowerCase`로 소문자로 바꾼 뒤 `a`, `e`, `i`, `o`, `u` 중 하나인지 확인합니다.
3. 모음이면 개수를 1 늘리고, 끝까지 확인한 뒤 출력합니다.

모음 판단은 `switch` 문이나 `"aeiou".indexOf(c) >= 0`처럼 써도 됩니다.

**시간복잡도** O(L), **공간복잡도** O(L) (L은 문장의 길이)

**자주 하는 실수**
- `Scanner.next()`나 `StringTokenizer`로 첫 단어만 읽어서 나머지 단어를 놓침
- 대문자 모음(`A`, `E` 등)을 세지 않음
- `y`를 모음으로 셈
- 반복문 안에서 `line = line + ...`처럼 문자열을 새로 만들면 느려지므로, 문자는 `charAt`으로 읽기만 하세요.', '{"java":"import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n\n        int count = 0;\n        for (int i = 0; i < line.length(); i++) {\n            if (isVowel(line.charAt(i))) count++;\n        }\n        System.out.println(count);\n    }\n\n    static boolean isVowel(char c) {\n        char lower = Character.toLowerCase(c);\n        return lower == ''a'' || lower == ''e'' || lower == ''i'' || lower == ''o'' || lower == ''u'';\n    }\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

-- word-frequency: 단어 빈도 세기
insert into public.problems
  (id, slug, title, description, input, output, constraints, examples, difficulty, estimated_minutes, languages, is_published)
values
  ('280d4e04-4056-5ce0-be91-c916c8b01ec1', 'word-frequency', '단어 빈도 세기', '인터넷 서점이 독자 리뷰에서 가장 많이 언급된 단어를 찾아 "오늘의 키워드"로 보여주려고 합니다.

N개의 단어가 주어질 때, **가장 많이 등장한 단어**와 그 단어의 등장 횟수를 구하세요.

가장 많이 등장한 단어가 여러 개라면, 그중 **사전 순으로 가장 앞서는 단어**를 출력합니다. 사전 순은 앞 글자부터 차례로 알파벳 순서를 비교하며, 한 단어가 다른 단어의 앞부분과 같다면 더 짧은 단어가 앞섭니다. (예: `ab`는 `abc`보다 앞섭니다.)', '첫째 줄에 단어의 개수 N이 주어집니다.
둘째 줄에 N개의 단어가 공백 하나로 구분되어 주어집니다.', '가장 많이 등장한 단어와 그 등장 횟수를 공백 하나로 구분하여 출력합니다.', '- 1 ≤ N ≤ 100,000
- 각 단어는 영어 소문자로만 이루어져 있고, 길이는 1 이상 10 이하입니다.',
   '[{"input":"7\napple banana apple cherry banana apple kiwi\n","output":"apple 3\n","explanation":"apple이 3번, banana가 2번, cherry와 kiwi가 1번씩 나옵니다. 가장 많이 나온 단어는 apple입니다."},{"input":"6\ndog cat bird cat dog fish\n","output":"cat 2\n","explanation":"dog와 cat이 2번씩으로 가장 많습니다. 사전 순으로 cat이 dog보다 앞서므로 cat을 출력합니다."}]'::jsonb, 2, 25, array['java'], true)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, description = excluded.description,
  input = excluded.input, output = excluded.output, constraints = excluded.constraints,
  examples = excluded.examples, difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes, languages = excluded.languages, is_published = excluded.is_published;

delete from public.problem_tags where problem_id = '280d4e04-4056-5ce0-be91-c916c8b01ec1';
insert into public.problem_tags (problem_id, tag_type, tag) values
  ('280d4e04-4056-5ce0-be91-c916c8b01ec1', 'algorithm', 'frequency-count'),
  ('280d4e04-4056-5ce0-be91-c916c8b01ec1', 'data_structure', 'hashmap'),
  ('280d4e04-4056-5ce0-be91-c916c8b01ec1', 'java', 'collection');

delete from public.problem_hints where problem_id = '280d4e04-4056-5ce0-be91-c916c8b01ec1';
insert into public.problem_hints (problem_id, level, content) values
  ('280d4e04-4056-5ce0-be91-c916c8b01ec1', 1, '단어마다 "몇 번 나왔는지"를 기록해야 합니다. 단어를 열쇠로, 횟수를 값으로 저장할 수 있는 자료구조는 무엇일까요?'),
  ('280d4e04-4056-5ce0-be91-c916c8b01ec1', 2, '횟수를 다 센 다음 답을 고를 때, 횟수가 같은 단어가 여러 개라면 어떻게 비교해야 할까요? 먼저 나온 단어가 답이 아니라는 점에 주의하세요.'),
  ('280d4e04-4056-5ce0-be91-c916c8b01ec1', 3, 'HashMap<String, Integer>에 단어별 등장 횟수를 셉니다. 그다음 모든 항목을 훑으면서 "횟수가 더 크거나, 횟수가 같고 단어가 사전 순으로 더 앞서면" 답을 갱신합니다. 문자열의 사전 순 비교는 compareTo로 할 수 있습니다.'),
  ('280d4e04-4056-5ce0-be91-c916c8b01ec1', 4, 'counts = 빈 HashMap
for 단어 w:
  counts[w] = counts[w] + 1 (없으면 1)
bestWord = 없음, bestCount = 0
for (w, c) in counts:
  if c > bestCount 또는 (c == bestCount 이고 w < bestWord):
    bestWord = w, bestCount = c
출력 bestWord, bestCount');

insert into public.problem_solutions (problem_id, explanation, reference_code)
values ('280d4e04-4056-5ce0-be91-c916c8b01ec1', '단어별 등장 횟수를 **HashMap**으로 센 뒤, 조건에 맞는 단어를 하나 고릅니다.

1. `HashMap<String, Integer>`에 단어마다 횟수를 셉니다. `counts.merge(word, 1, Integer::sum)` 또는 `counts.put(word, counts.getOrDefault(word, 0) + 1)`을 사용할 수 있습니다.
2. 모든 항목을 훑으며 다음 중 하나이면 답을 바꿉니다.
   - 횟수가 지금까지의 최댓값보다 큼
   - 횟수가 같고 `word.compareTo(bestWord) < 0` (사전 순으로 더 앞섬)
3. 답 단어와 횟수를 출력합니다.

**HashMap은 순서를 보장하지 않으므로**, 동률일 때 "먼저 꺼낸 단어"를 답으로 하면 실행할 때마다 결과가 달라질 수 있습니다. 반드시 사전 순 비교로 동률을 처리하세요. (`TreeMap`을 쓰면 키가 사전 순으로 정렬되므로 횟수가 "더 클 때만" 갱신해도 됩니다. 대신 연산마다 O(log K)가 듭니다.)

**시간복잡도** O(N × L) (L은 단어 길이, 최대 10), **공간복잡도** O(N × L)

**자주 하는 실수**
- 동률일 때 입력에서 먼저 나온 단어나 HashMap에서 먼저 꺼낸 단어를 출력함
- 문자열을 `==`로 비교함 (Java에서는 `equals`, 순서 비교는 `compareTo`)
- `Scanner`로 10만 개 단어를 읽으면 느리므로 `BufferedReader`와 `StringTokenizer`를 사용하세요.', '{"java":"import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(br.readLine().trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n\n        Map<String, Integer> counts = new HashMap<>();\n        for (int i = 0; i < n; i++) {\n            counts.merge(st.nextToken(), 1, Integer::sum);\n        }\n\n        String bestWord = null;\n        int bestCount = 0;\n        for (Map.Entry<String, Integer> entry : counts.entrySet()) {\n            String word = entry.getKey();\n            int count = entry.getValue();\n            if (count > bestCount || (count == bestCount && word.compareTo(bestWord) < 0)) {\n                bestWord = word;\n                bestCount = count;\n            }\n        }\n        System.out.println(bestWord + \" \" + bestCount);\n    }\n}\n"}'::jsonb)
on conflict (problem_id) do update set explanation = excluded.explanation, reference_code = excluded.reference_code;

commit;
