'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CleanupButton({ campaignId }: { campaignId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleCleanup() {
    if (!confirm('テストデータ（登録者・決済・メールログ・視聴データ）を全て削除しますか？\nこの操作は取り消せません。')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/cleanup`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok) {
        alert(`削除完了:\n登録者: ${data.deleted.registrations ?? 0}件\n決済: ${data.deleted.payments ?? 0}件\nメールログ: ${data.deleted.email_logs ?? 0}件\n視聴データ: ${data.deleted.view_events ?? 0}件`)
        router.refresh()
      } else {
        alert(`エラー: ${data.error}`)
      }
    } catch {
      alert('削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleCleanup}
      disabled={isDeleting}
      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
    >
      {isDeleting ? '削除中...' : 'テストデータ削除'}
    </button>
  )
}
