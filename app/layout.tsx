import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { themeInitScript } from "@/components/layout/theme";
import "./globals.css";

// 한글 글리프는 Geist에 없으므로 OS 기본 한글 폰트로 자연스럽게 대체된다.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeMate",
  description: "스스로 생각하는 힘을 기르는 코딩테스트 학습 플랫폼",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // 테마 스크립트가 hydration 전에 class를 바꾸므로 html의 불일치 경고를 억제한다.
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:ring-2 focus:ring-ring"
        >
          본문으로 건너뛰기
        </a>
        <SiteHeader />
        <main id="main" className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
