"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Props = {
  /** 로그인 후 돌아갈 내부 경로 (서버에서 검증된 값) */
  next: string;
};

export function GoogleSignInButton({ next }: Props) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function signIn() {
    setPending(true);
    setFailed(false);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    // 성공하면 Google 로그인 화면으로 이동하므로 여기 도달하는 것은 실패한 경우뿐이다.
    if (error) {
      console.error("[login]", error.message);
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" onClick={signIn} disabled={pending} aria-busy={pending}>
        {pending ? "Google로 이동 중…" : "Google로 로그인"}
      </Button>
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          로그인을 시작하지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      )}
    </div>
  );
}
