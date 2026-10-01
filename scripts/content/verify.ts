/**
 * 문제 형식 검사 + 정답 코드 실행 검증.
 *   node scripts/content/verify.ts            모든 문제
 *   node scripts/content/verify.ts slug1 ...  일부 문제만
 *
 * Java: 로컬 JDK(javac, java)로 실행
 * C: Docker 컨테이너(alpine + gcc)에서 컴파일·실행 — 로컬에 C 컴파일러가 없어도 된다.
 * 이 스크립트는 저장소에 있는 정답 코드만 실행한다. 사용자 코드는 절대 실행하지 않는다.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { ContentTestCase } from "../../content/types.ts";
import { loadProblems, PROBLEMS_DIR, SOLUTION_FILES, validate, type LoadedProblem } from "./load.ts";

const C_IMAGE = "codemate-c-runner";
// 여러 검증을 동시에 실행해도 충돌하지 않도록 프로세스마다 다른 컨테이너를 쓴다.
const C_CONTAINER = `codemate-c-verify-${process.pid}`;
const TIMEOUT_MS = 5000;

/** 줄 끝 공백과 마지막 빈 줄을 무시하고 비교한다. */
function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").replace(/\n+$/, "");
}

type RunResult = { ok: true } | { ok: false; reason: string };

function run(command: string, args: string[], input: string): { stdout: string; error?: string } {
  const r = spawnSync(command, args, { input, encoding: "utf8", timeout: TIMEOUT_MS, maxBuffer: 64 * 1024 * 1024 });
  if (r.error) return { stdout: "", error: r.error.message.includes("ETIMEDOUT") ? "시간 초과" : r.error.message };
  if (r.status !== 0) return { stdout: r.stdout, error: `종료 코드 ${r.status}: ${r.stderr.trim().slice(0, 300)}` };
  return { stdout: r.stdout };
}

function check(cases: ContentTestCase[], exec: (input: string) => { stdout: string; error?: string }): RunResult[] {
  return cases.map((tc) => {
    const { stdout, error } = exec(tc.input);
    if (error) return { ok: false, reason: error };
    if (normalize(stdout) !== normalize(tc.output)) {
      return { ok: false, reason: `출력 불일치\n      기대: ${JSON.stringify(normalize(tc.output))}\n      실제: ${JSON.stringify(normalize(stdout))}` };
    }
    return { ok: true };
  });
}

function verifyJava({ dir, problem }: LoadedProblem, cases: ContentTestCase[]): RunResult[] {
  const out = mkdtempSync(path.join(tmpdir(), `cm-java-${problem.slug}-`));
  try {
    const compile = spawnSync("javac", ["-encoding", "UTF-8", "-d", out, path.join(dir, SOLUTION_FILES.java)], { encoding: "utf8" });
    if (compile.status !== 0) return [{ ok: false, reason: `컴파일 실패: ${compile.stderr.trim().slice(0, 500)}` }];
    return check(cases, (input) => run("java", ["-Xss64m", "-cp", out, "Main"], input));
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

function startCContainer() {
  const hasImage = spawnSync("docker", ["image", "inspect", C_IMAGE], { encoding: "utf8" }).status === 0;
  if (!hasImage) {
    console.log("C 실행 환경 이미지를 빌드합니다 (최초 1회)...");
    const b = spawnSync("docker", ["build", "-t", C_IMAGE, "-f", path.resolve(import.meta.dirname, "c-runner.Dockerfile"), import.meta.dirname], { stdio: "inherit" });
    if (b.status !== 0) throw new Error("C 실행 환경 이미지 빌드 실패 (Docker Desktop이 실행 중인지 확인하세요)");
  }
  spawnSync("docker", ["rm", "-f", C_CONTAINER], { encoding: "utf8" });
  const r = spawnSync("docker", [
    "run", "-d", "--name", C_CONTAINER, "--network", "none",
    "--mount", `type=bind,source=${PROBLEMS_DIR},target=/work,readonly`,
    C_IMAGE, "sleep", "infinity",
  ], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`C 검증 컨테이너 시작 실패: ${r.stderr}`);
}

function verifyC({ problem }: LoadedProblem, cases: ContentTestCase[]): RunResult[] {
  const bin = `/tmp/${problem.slug}`;
  const compile = spawnSync("docker", ["exec", C_CONTAINER, "gcc", "-O2", "-std=c11", "-Wall", "-o", bin, `/work/${problem.slug}/${SOLUTION_FILES.c}`, "-lm"], { encoding: "utf8" });
  if (compile.status !== 0) return [{ ok: false, reason: `컴파일 실패: ${compile.stderr.trim().slice(0, 500)}` }];
  if (compile.stderr.trim()) console.log(`    ⚠ ${problem.slug} C 컴파일 경고:\n${compile.stderr.trim().slice(0, 500)}`);
  return check(cases, (input) => run("docker", ["exec", "-i", C_CONTAINER, bin], input));
}

const problems = await loadProblems(process.argv.slice(2));
let failed = 0;
const usesC = problems.some((p) => p.problem.languages.includes("c"));
if (usesC) startCContainer();

try {
  for (const loaded of problems) {
    const { problem } = loaded;
    const errors = validate(loaded);
    if (errors.length > 0) {
      failed++;
      console.log(`✗ ${problem.slug}\n    ${errors.join("\n    ")}`);
      continue;
    }

    const cases = [...problem.examples, ...problem.tests];
    const lines: string[] = [];
    let problemOk = true;
    for (const lang of problem.languages) {
      const results = lang === "java" ? verifyJava(loaded, cases) : verifyC(loaded, cases);
      const fails = results.map((r, i) => ({ r, i })).filter(({ r }) => !r.ok);
      if (fails.length > 0) problemOk = false;
      lines.push(`${lang} ${results.length - fails.length}/${cases.length}`);
      for (const { r, i } of fails) {
        const note = cases[i]?.note ? ` (${cases[i].note})` : i < problem.examples.length ? " (예제)" : "";
        lines.push(`  - 케이스 ${i + 1}${note}: ${r.ok ? "" : r.reason}`);
      }
    }
    if (!problemOk) failed++;
    console.log(`${problemOk ? "✓" : "✗"} ${problem.slug} [Lv.${problem.difficulty}] ${lines.join(" | ").replace(/\| {2}- /g, "\n    - ")}`);
  }
} finally {
  if (usesC) spawnSync("docker", ["rm", "-f", C_CONTAINER], { encoding: "utf8" });
}

console.log(`\n${problems.length - failed}/${problems.length}개 문제 통과`);
if (failed > 0) process.exit(1);
