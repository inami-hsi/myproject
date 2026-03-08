'use client'

import { useState } from 'react'
import type { SessionWithCount } from '@/types/evergreen'
import { SessionCard } from './session-card'

interface RegistrationFormProps {
  campaignSlug: string
  sessions: SessionWithCount[]
  ctaText: string
}

export function RegistrationForm({
  campaignSlug,
  sessions,
  ctaText,
}: RegistrationFormProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSessionId) {
      setError('セッションを選択してください')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Get UTM params from URL
      const params = new URLSearchParams(window.location.search)

      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_slug: campaignSlug,
          session_id: selectedSessionId,
          name,
          email,
          utm_source: params.get('utm_source') ?? undefined,
          utm_medium: params.get('utm_medium') ?? undefined,
          utm_campaign: params.get('utm_campaign') ?? undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '登録に失敗しました')
      }

      const data = await res.json()
      // Redirect to thanks page with token
      window.location.href = `/c/${campaignSlug}/thanks?token=${data.token}`
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Session Selection */}
      <div>
        <h3 className="mb-4 text-center font-eg-heading text-xl font-semibold text-eg-primary">
          ご都合の良い日程を選択してください
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              selected={selectedSessionId === session.id}
              onSelect={setSelectedSessionId}
            />
          ))}
        </div>
      </div>

      {/* Registration Fields */}
      <div className="mx-auto max-w-md space-y-4">
        <div>
          <label
            htmlFor="reg-name"
            className="mb-1 block font-eg-body text-sm font-medium text-eg-text-primary"
          >
            お名前
          </label>
          <input
            id="reg-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田 太郎"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-eg-body text-eg-text-primary
              transition-shadow focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
          />
        </div>
        <div>
          <label
            htmlFor="reg-email"
            className="mb-1 block font-eg-body text-sm font-medium text-eg-text-primary"
          >
            メールアドレス
          </label>
          <input
            id="reg-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-eg-body text-eg-text-primary
              transition-shadow focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
          />
        </div>

        {error && (
          <p className="text-center text-sm text-eg-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !selectedSessionId}
          className="w-full rounded-lg bg-eg-accent px-8 py-4 font-eg-heading text-lg font-bold text-white
            shadow-md transition-all duration-200 hover:bg-eg-accent/90 hover:shadow-lg
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eg-accent focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? '登録中...' : ctaText}
        </button>

        <p className="text-center text-xs text-eg-text-secondary">
          ご登録いただいたメールアドレスにセッション情報をお送りします。
        </p>
      </div>
    </form>
  )
}
