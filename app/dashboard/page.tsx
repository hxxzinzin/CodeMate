import type { Metadata } from "next";

export const metadata: Metadata = { title: "대시보드 | CodeMate" };

export default function DashboardPage() {
  return <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>;
}
