import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { LanguageRatioForm } from "@/components/settings/language-ratio-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPreferences } from "@/lib/mock-data";

export const metadata: Metadata = { title: "설정 | CodeMate" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="설정" />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>언어 비율</CardTitle>
          <CardDescription>오늘의 문제에서 Java와 C가 출제되는 비율</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageRatioForm initialJavaRatio={mockPreferences.javaRatio} />
        </CardContent>
      </Card>
    </>
  );
}
