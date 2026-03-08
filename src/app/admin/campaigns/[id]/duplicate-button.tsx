'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DuplicateButton({ campaignId }: { campaignId: string }) {
  const router = useRouter()
  const [isDuplicating, setIsDuplicating] = useState(false)

  async function handleDuplicate() {
    if (!confirm('このキャンペーンを複製しますか？')) return

    setIsDuplicating(true)
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/duplicate`, {
        method: 'POST',
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || '複製に失敗しました')
        return
      }

      const { id } = await res.json()
      router.push(`/admin/campaigns/${id}`)
    } catch {
      alert('複製に失敗しました')
    } finally {
      setIsDuplicating(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDuplicate}
      disabled={isDuplicating}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-eg-text-secondary hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isDuplicating ? '複製中...' : '複製'}
    </button>
  )
}
