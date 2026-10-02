import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { LanguageRatioForm } from "@/components/settings/language-ratio-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getPreferences } from "@/lib/db/preferences";
import type { UserPreferences } from "@/types/user";

export const metadata: Metadata = { title: "설정 | CodeMate" };

export default async function SettingsPage() {
  // 설정은 proxy가 로그인 사용자만 들여보낸다.
  const user = await getCurrentUser();
  let preferences: UserPreferences | null = null;
  if (user) {
    try {
      preferences = await getPreferences(user.id);
    } catch (error) {
      console.error("[settings] load failed", error);
    }
  }

  return (
    <>
      <PageHeader title="설정" />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>언어 비율</CardTitle>
          <CardDescription>오늘의 문제에서 Java와 C가 출제되는 비율</CardDescription>
        </CardHeader>
        <CardContent>
          {preferences ? (
            <LanguageRatioForm initialJavaRatio={preferences.javaRatio} />
          ) : (
            <p role="alert" className="text-sm text-muted-foreground">
              설정을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
