/**
 * Gemini 연결 확인: npm run ai:smoke
 * .env.local의 GEMINI_API_KEY, GEMINI_MODEL로 짧은 힌트를 한 번 요청한다. (무료 한도를 1회 사용)
 * 키 값은 출력하지 않는다.
 */
import { AiError, aiErrorMessage, generateText, modelChain } from "../../lib/ai/gemini.ts";
import { COACH_SYSTEM_PROMPT, problemContext, userCodeBlock } from "../../lib/ai/prompts.ts";

process.loadEnvFile?.(".env.local");

const prompt = [
  problemContext({
    title: "올바른 괄호",
    description: "괄호 문자열이 올바른지 판별하세요.",
    input: "괄호 문자열 S",
    output: "YES 또는 NO",
    constraints: "1 ≤ |S| ≤ 100,000",
  }),
  "요청: 힌트 2단계(생각해야 할 부분)를 2~3문장으로 주세요.",
  userCodeBlock(
    "java",
    "int open = 0;\nfor (char c : s.toCharArray()) { if (c == '(') open++; else open--; }\nSystem.out.println(open == 0 ? \"YES\" : \"NO\");",
  ),
].join("\n\n");

console.log(
  `모델 순서: ${modelChain({ GEMINI_MODEL: process.env.GEMINI_MODEL, GEMINI_FALLBACK_MODEL: process.env.GEMINI_FALLBACK_MODEL }).join(" → ")}`,
);
const started = Date.now();
try {
  const r = await generateText({ system: COACH_SYSTEM_PROMPT, prompt, maxOutputTokens: 300 });
  console.log(`응답 모델: ${r.model} (${((Date.now() - started) / 1000).toFixed(1)}초, 입력 ${r.tokensIn} / 출력 ${r.tokensOut} 토큰${r.truncated ? ", 잘림" : ""})`);
  console.log("---");
  console.log(r.text);
} catch (error) {
  if (error instanceof AiError) {
    console.error(`실패: ${error.code} — ${aiErrorMessage(error.code)} (${error.message})`);
  } else {
    console.error("실패:", error);
  }
  // process.exit()로 강제 종료하면 Windows에서 네트워크 핸들 정리 중 assertion 오류가 날 수 있어 종료 코드만 설정한다.
  process.exitCode = 1;
}
