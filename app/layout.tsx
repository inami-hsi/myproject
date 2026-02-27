import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "保険商品推奨システム",
  description: "あなたにぴったりの保険を見つける",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
