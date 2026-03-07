import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "企業リスト - 企業情報検索・リスト作成ツール",
    template: "%s | 企業リスト",
  },
  description:
    "企業情報を簡単に検索・リスト化。業種・地域・従業員数などの条件で企業を絞り込み、CSV/Excelでダウンロード。",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-dvh font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
