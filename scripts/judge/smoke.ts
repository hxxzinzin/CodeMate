/**
 * 자동 채점 연결 확인: npm run judge:smoke
 * .env.local의 ONLINECOMPILER_API_KEY로 실제 실행 서비스를 호출한다. (호출 약 30회, 무한 루프 확인 때문에 1분 정도 걸림)
 * 키 값은 출력하지 않는다. 저장소의 정답 코드와 일부러 틀리게 만든 코드만 보낸다.
 *
 * 1부: 응답 형태 확인 — 컴파일 에러·런타임 에러·시간 초과를 서비스가 어떻게 알려주는지 원본을 출력한다.
 * 2부: 실제 문제 채점 — 정답 코드는 AC, 틀린 코드는 WA·CE가 나오는지 확인한다.
 */
import { loadProblems } from "../content/load.ts";
import { COMPILERS, createOnlineCompilerRunner } from "../../lib/judge/online-compiler.ts";
import { judgeCases, type TestCase } from "../../lib/judge/run-cases.ts";

process.loadEnvFile?.(".env.local");
const apiKey = process.env.ONLINECOMPILER_API_KEY;
if (!apiKey) {
  console.error(".env.local에 ONLINECOMPILER_API_KEY가 없어요.");
  process.exitCode = 1;
} else {
  await main(apiKey);
}

async function raw(language: "java" | "c", code: string, input = "") {
  const res = await fetch("https://api.onlinecompiler.io/api/run-code-sync/", {
    method: "POST",
    headers: { Authorization: apiKey!, "Content-Type": "application/json" },
    body: JSON.stringify({ compiler: COMPILERS[language], code, input }),
    signal: AbortSignal.timeout(45_000),
  });
  const text = await res.text();
  return `${res.status} ${text.length > 400 ? `${text.slice(0, 400)}…` : text}`;
}

async function main(key: string) {
  console.log("== 1부: 응답 형태 ==");
  const samples: [string, "java" | "c", string, string?][] = [
    ["C 정상 (입력 사용)", "c", '#include <stdio.h>\nint main(){int a,b;scanf("%d %d",&a,&b);printf("%d\\n",a+b);return 0;}', "1 2\n"],
    ["Java 정상 (public class Main)", "java", 'import java.util.*;\npublic class Main{public static void main(String[] a){Scanner s=new Scanner(System.in);System.out.println(s.nextInt()+s.nextInt());}}', "1 2\n"],
    ["C 컴파일 에러", "c", "int main(){ return 0 }"],
    ["Java 컴파일 에러", "java", "public class Main{public static void main(String[] a){ int x = ; }}"],
    ["Java 런타임 에러", "java", "public class Main{public static void main(String[] a){ int[] x = new int[1]; x[2] = 1; }}"],
    ["C 런타임 에러 (0으로 나누기)", "c", '#include <stdio.h>\nint main(){int z=0; printf("%d", 1/z); return 0;}'],
    ["C 무한 루프", "c", "int main(){ volatile int i=0; while(1){ i++; } }"],
  ];
  for (const [label, lang, code, input] of samples) {
    const started = Date.now();
    console.log(`- ${label}: ${await raw(lang, code, input)}  (${((Date.now() - started) / 1000).toFixed(1)}초)`);
  }

  console.log("\n== 2부: 실제 문제 채점 ==");
  const runner = createOnlineCompilerRunner({ apiKey: key });
  for (const { problem, code } of await loadProblems(["pair-sum", "student-average"])) {
    const cases: TestCase[] = [
      ...problem.examples.map((t) => ({ input: t.input, expectedOutput: t.output, isSample: true })),
      ...problem.tests.map((t) => ({ input: t.input, expectedOutput: t.output, isSample: false })),
    ];
    for (const lang of problem.languages) {
      const solution = code[lang]!;
      const started = Date.now();
      const good = await judgeCases(runner, lang, solution, cases);
      const sec = ((Date.now() - started) / 1000).toFixed(1);
      console.log(`- ${problem.slug} ${lang} 정답 코드: ${good.result} ${good.summary.passed}/${good.summary.total} (${sec}초, 최대 ${good.summary.maxTimeSec}초)`);
    }
    // 틀린 코드: 출력 끝에 1을 더 붙인다 → WA
    const wrong = await judgeCases(runner, "c", '#include <stdio.h>\nint main(){printf("-1\\n");return 0;}', cases);
    console.log(`- ${problem.slug} c 틀린 코드: ${wrong.result} ${JSON.stringify(wrong.summary.failed)}`);
  }
  const ce = await judgeCases(runner, "java", "public class Main { oops }", [{ input: "", expectedOutput: "", isSample: true }]);
  console.log(`- 컴파일 에러 코드: ${ce.result} / 메시지 ${JSON.stringify(ce.summary.message?.slice(0, 120))}`);
}
