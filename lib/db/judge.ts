import "server-only";
import type { TestCase } from "@/lib/judge/run-cases";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 채점 테스트케이스(예제 + 숨김 테스트). 사용자 권한으로는 읽을 수 없어서
 * service_role(admin) 클라이언트로만 조회한다. (힌트·해설과 같은 방식, ADR-002)
 */
export async function getTestCases(problemId: string): Promise<TestCase[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("problem_test_cases")
    .select("input, expected_output, is_sample")
    .eq("problem_id", problemId)
    .order("ord", { ascending: true });
  if (error) throw error;
  return data.map((t) => ({ input: t.input, expectedOutput: t.expected_output, isSample: t.is_sample }));
}
