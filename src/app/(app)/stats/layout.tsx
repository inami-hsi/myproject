import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "統計",
  description: "企業データの統計情報。業種別・地域別の企業数を可視化。",
}

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children
}
