import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "料金プラン",
  description:
    "企業リストの料金プラン。無料プランから始めて、Starter・Proプランでより多くの企業データをダウンロード。",
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
