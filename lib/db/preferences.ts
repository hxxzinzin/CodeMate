import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { UserPreferences } from "@/types/user";

/** 사용자 설정. 행은 가입 트리거가 만들고, RLS로 본인 행만 읽고 고칠 수 있다. */
export async function getPreferences(userId: string): Promise<UserPreferences> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_preferences")
    .select("java_ratio, preferred_difficulty, timezone")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return { javaRatio: data.java_ratio, preferredDifficulty: data.preferred_difficulty, timezone: data.timezone };
}

export async function saveJavaRatio(userId: string, javaRatio: number): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_preferences")
    .update({ java_ratio: javaRatio })
    .eq("user_id", userId)
    .select("java_ratio")
    .single();
  if (error) throw error;
  return data.java_ratio;
}
