/**
 * AI 초안 승인 (ADR-015)
 *   npm run content:approve -- <slug>
 *
 * content/drafts/<slug>/preview.md를 사람이 읽고 문제가 없다고 판단했을 때만 실행한다.
 * 1. problem.ts, Main.java, main.c를 content/problems/<slug>/로 옮긴다. (brute.c, preview.md는 옮기지 않음)
 * 2. 기존 문제와 같은 검증(npm run content:verify)을 실행한다. 실패하면 되돌린다.
 * 3. supabase/seed.sql을 다시 만든다.
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { PROBLEMS_DIR } from "./load.ts";

const DRAFTS_DIR = path.resolve(import.meta.dirname, "../../content/drafts");
const FILES = ["problem.ts", "Main.java", "main.c"];

const slug = process.argv[2];
const from = slug ? path.join(DRAFTS_DIR, slug) : "";
const to = slug ? path.join(PROBLEMS_DIR, slug) : "";

if (!slug) {
  console.error("사용법: npm run content:approve -- <slug>");
  process.exitCode = 1;
} else if (!existsSync(path.join(from, "problem.ts"))) {
  console.error(`초안이 없어요: content/drafts/${slug}/`);
  process.exitCode = 1;
} else if (existsSync(to)) {
  console.error(`이미 같은 이름의 문제가 있어요: content/problems/${slug}/`);
  process.exitCode = 1;
} else {
  mkdirSync(to, { recursive: true });
  for (const file of FILES) copyFileSync(path.join(from, file), path.join(to, file));

  const run = (script: string, ...args: string[]) =>
    spawnSync(process.execPath, [path.resolve(import.meta.dirname, script), ...args], { stdio: "inherit" }).status === 0;

  if (!run("verify.ts", slug)) {
    rmSync(to, { recursive: true, force: true });
    console.error("\n✗ 검증에 실패해서 승인을 취소했어요. 초안은 그대로 남아 있어요.");
    process.exitCode = 1;
  } else if (!run("build-seed.ts")) {
    console.error("\n✗ seed 생성에 실패했어요.");
    process.exitCode = 1;
  } else {
    rmSync(from, { recursive: true, force: true });
    console.log(`\n✓ 승인 완료: content/problems/${slug}/`);
    console.log("  로컬 DB 반영: npm run db:reset");
    console.log("  클라우드 반영: npm run content:sync -- --yes");
  }
}
