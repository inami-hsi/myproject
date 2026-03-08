'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface EmailTemplate {
  id: string
  trigger_type: string
  subject: string
  body_html: string
  delay_minutes: number
  is_active: boolean
}

const TRIGGER_LABELS: Record<string, { label: string; description: string; timing: string }> = {
  confirmation: {
    label: '登録確認メール',
    description: '登録直後に送信される確認メール',
    timing: '即時',
  },
  reminder_24h: {
    label: '24時間前リマインダー',
    description: 'セッション開始24時間前に送信',
    timing: 'セッション24時間前',
  },
  reminder_1h: {
    label: '1時間前リマインダー',
    description: 'セッション開始1時間前に送信',
    timing: 'セッション1時間前',
  },
  start: {
    label: '開始通知',
    description: 'セッション開始時に送信',
    timing: 'セッション開始時',
  },
  followup: {
    label: 'フォローアップ',
    description: '動画視聴完了者に送信',
    timing: 'セッション終了1時間後',
  },
  replay: {
    label: 'リプレイ案内',
    description: '未視聴者に送信',
    timing: 'セッション終了24時間後',
  },
}

export function EmailTemplateEditor({ template }: { template: EmailTemplate }) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [subject, setSubject] = useState(template.subject)
  const [bodyHtml, setBodyHtml] = useState(template.body_html)
  const [isActive, setIsActive] = useState(template.is_active)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [testEmail, setTestEmail] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'sent' | 'error'>('idle')

  const meta = TRIGGER_LABELS[template.trigger_type] ?? {
    label: template.trigger_type,
    description: '',
    timing: '',
  }

  async function handleSave() {
    setIsSaving(true)
    setStatus('idle')

    try {
      const res = await fetch(`/api/admin/emails/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body_html: bodyHtml, is_active: isActive }),
      })

      if (!res.ok) throw new Error('保存に失敗しました')

      setStatus('saved')
      router.refresh()
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-eg-success' : 'bg-gray-300'}`}
            title={isActive ? '有効' : '無効'}
          />
          <div>
            <p className="font-eg-heading font-semibold text-eg-primary">{meta.label}</p>
            <p className="text-xs text-eg-text-secondary">{meta.timing}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-eg-text-secondary truncate max-w-60 hidden sm:inline">
            {subject}
          </span>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded editor */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-6 pb-6 pt-4">
          <p className="mb-4 text-sm text-eg-text-secondary">{meta.description}</p>

          {/* Active toggle */}
          <label className="mb-4 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-eg-accent focus:ring-eg-accent"
            />
            <span className="text-sm font-medium text-eg-text-primary">このメールを有効にする</span>
          </label>

          {/* Subject */}
          <div className="mb-4">
            <label htmlFor={`subject-${template.id}`} className="mb-1 block text-sm font-medium text-eg-text-primary">
              件名
            </label>
            <input
              id={`subject-${template.id}`}
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            />
          </div>

          {/* Body HTML */}
          <div className="mb-4">
            <label htmlFor={`body-${template.id}`} className="mb-1 block text-sm font-medium text-eg-text-primary">
              本文 (HTML)
            </label>
            <textarea
              id={`body-${template.id}`}
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            />
          </div>

          {/* Preview */}
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-medium text-eg-accent hover:text-eg-accent/80">
              プレビュー
            </summary>
            <div
              className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4"
              dangerouslySetInnerHTML={{
                __html: bodyHtml
                  .replace(/\{\{name\}\}/g, '山田 太郎')
                  .replace(/\{\{session_date\}\}/g, '2026年3月15日(日) 20:00')
                  .replace(/\{\{watch_url\}\}/g, '#')
                  .replace(/\{\{campaign_name\}\}/g, 'サンプルキャンペーン'),
              }}
            />
          </details>

          {/* Test send */}
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-sm font-medium text-eg-text-primary">テスト送信</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="送信先メールアドレス"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!testEmail) return
                  setIsSendingTest(true)
                  setTestStatus('idle')
                  try {
                    const res = await fetch(`/api/admin/emails/${template.id}/test`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ to: testEmail }),
                    })
                    if (!res.ok) throw new Error()
                    setTestStatus('sent')
                    setTimeout(() => setTestStatus('idle'), 3000)
                  } catch {
                    setTestStatus('error')
                  } finally {
                    setIsSendingTest(false)
                  }
                }}
                disabled={isSendingTest || !testEmail}
                className="rounded-lg border border-eg-accent px-4 py-2 text-sm font-medium text-eg-accent hover:bg-eg-accent/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSendingTest ? '送信中...' : '送信'}
              </button>
            </div>
            {testStatus === 'sent' && (
              <p className="mt-2 text-xs text-eg-success">テストメールを送信しました</p>
            )}
            {testStatus === 'error' && (
              <p className="mt-2 text-xs text-eg-error">送信に失敗しました</p>
            )}
          </div>

          {/* Save button */}
          <div className="flex items-center justify-end gap-3">
            {status === 'saved' && (
              <span className="text-sm text-eg-success">保存しました</span>
            )}
            {status === 'error' && (
              <span className="text-sm text-eg-error">保存に失敗しました</span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-eg-accent px-5 py-2 font-eg-heading text-sm font-semibold text-white hover:bg-eg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
