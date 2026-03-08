'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function VideoUploadForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!videoFile || !title) return

    setIsUploading(true)
    setError('')

    try {
      // Step 1: Get presigned URL
      setProgress('アップロードURL取得中...')
      const presignRes = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'presign',
          filename: videoFile.name,
          contentType: videoFile.type,
        }),
      })

      if (!presignRes.ok) {
        const data = await presignRes.json()
        throw new Error(data.error ?? 'プリサインURL取得に失敗しました')
      }

      const { uploadUrl, storageKey } = await presignRes.json()

      // Step 2: Upload directly to R2
      setProgress(`アップロード中... (${formatFileSize(videoFile.size)})`)
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': videoFile.type },
        body: videoFile,
      })

      if (!uploadRes.ok) {
        throw new Error('R2へのアップロードに失敗しました')
      }

      // Step 3: Register in DB
      setProgress('登録中...')
      const registerRes = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          title,
          description: description || undefined,
          storageKey,
        }),
      })

      if (!registerRes.ok) {
        const data = await registerRes.json()
        throw new Error(data.error ?? 'DB登録に失敗しました')
      }

      setProgress('完了!')
      setTitle('')
      setDescription('')
      setVideoFile(null)
      setIsExpanded(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました')
    } finally {
      setIsUploading(false)
      setTimeout(() => setProgress(''), 3000)
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-8 text-eg-text-secondary transition-colors hover:border-eg-accent hover:text-eg-accent"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="font-eg-heading font-medium">新しい動画をアップロード</span>
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-eg-heading text-lg font-semibold text-eg-primary">
          動画アップロード
        </h2>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="text-eg-text-secondary hover:text-eg-primary"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Title */}
        <div className="sm:col-span-2">
          <label htmlFor="video-title" className="mb-1 block text-sm font-medium text-eg-text-primary">
            タイトル *
          </label>
          <input
            id="video-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="セッション動画 - 第1回"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="video-desc" className="mb-1 block text-sm font-medium text-eg-text-primary">
            説明
          </label>
          <textarea
            id="video-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="動画の説明（任意）"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
          />
        </div>

        {/* Video File */}
        <div className="sm:col-span-2">
          <label htmlFor="video-file" className="mb-1 block text-sm font-medium text-eg-text-primary">
            動画ファイル * (MP4/WebM, 500MB以下)
          </label>
          <input
            ref={fileInputRef}
            id="video-file"
            type="file"
            required
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-eg-accent/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-eg-accent"
          />
          {videoFile && (
            <p className="mt-1 text-xs text-eg-text-secondary">
              {videoFile.name} ({formatFileSize(videoFile.size)})
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-eg-error" role="alert">{error}</p>
      )}

      {progress && (
        <p className="mt-3 text-sm text-eg-success">{progress}</p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isUploading || !videoFile || !title}
          className="rounded-lg bg-eg-accent px-6 py-2 font-eg-heading text-sm font-semibold text-white hover:bg-eg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? 'アップロード中...' : 'アップロード'}
        </button>
      </div>
    </form>
  )
}
