import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ダッシュボード",
  description: "ダウンロード履歴やプラン情報を管理。",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
