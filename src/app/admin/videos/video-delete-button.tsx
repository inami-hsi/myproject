'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function VideoDeleteButton({ videoId, videoTitle }: { videoId: string; videoTitle: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`「${videoTitle}」を削除しますか？この操作は取り消せません。`)) return

    setDeleting(true)
    const res = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', videoId }),
    })

    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(`削除に失敗しました: ${data.error}`)
    }
    setDeleting(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      {deleting ? '削除中...' : '削除'}
    </button>
  )
}
