import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://company-list-builder.vercel.app"

export const metadata: Metadata = {
  title: {
    default: "企業リスト - 企業情報検索・リスト作成ツール",
    template: "%s | 企業リスト",
  },
  description:
    "企業情報を簡単に検索・リスト化。業種・地域・従業員数などの条件で企業を絞り込み、CSV/Excelでダウンロード。",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "企業リスト - 企業情報検索・リスト作成ツール",
    description:
      "企業情報を簡単に検索・リスト化。業種・地域・従業員数などの条件で企業を絞り込み、CSV/Excelでダウンロード。",
    url: siteUrl,
    siteName: "企業リスト",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "企業リスト - 企業情報検索・リスト作成ツール",
    description:
      "企業情報を簡単に検索・リスト化。業種・地域・従業員数などの条件で企業を絞り込み、CSV/Excelでダウンロード。",
  },
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
