'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Campaign } from '@/types/evergreen'

interface CampaignFormProps {
  videos: { id: string; title: string }[]
  campaign?: Campaign
}

export function CampaignForm({ videos, campaign }: CampaignFormProps) {
  const router = useRouter()
  const isEditing = !!campaign

  const [name, setName] = useState(campaign?.name ?? '')
  const [slug, setSlug] = useState(campaign?.slug ?? '')
  const [description, setDescription] = useState(campaign?.description ?? '')
  const [videoId, setVideoId] = useState(campaign?.video_id ?? '')
  const [isActive, setIsActive] = useState(campaign?.is_active ?? false)
  const [offerUrl, setOfferUrl] = useState(campaign?.offer_url ?? '')
  const [offerPrice, setOfferPrice] = useState(campaign?.offer_price?.toString() ?? '')

  // Session rules
  const [daysOffsets, setDaysOffsets] = useState(
    campaign?.session_rules.days_offsets.join(', ') ?? '3, 5, 7'
  )
  const [times, setTimes] = useState(
    campaign?.session_rules.times.join(', ') ?? '20:00'
  )
  const [maxSeats, setMaxSeats] = useState(
    campaign?.session_rules.max_seats?.toString() ?? '50'
  )

  // LP settings
  const [headline, setHeadline] = useState(campaign?.lp_settings.headline ?? '')
  const [subheadline, setSubheadline] = useState(campaign?.lp_settings.subheadline ?? '')
  const [benefits, setBenefits] = useState(
    campaign?.lp_settings.benefits.join('\n') ?? ''
  )
  const [ctaText, setCtaText] = useState(campaign?.lp_settings.cta_text ?? '無料で参加する')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const body = {
        name,
        slug,
        description: description || undefined,
        video_id: videoId || undefined,
        is_active: isActive,
        offer_url: offerUrl || undefined,
        offer_price: offerPrice ? parseInt(offerPrice) : undefined,
        session_rules: {
          days_offsets: daysOffsets.split(',').map((d) => parseInt(d.trim())).filter((n) => !isNaN(n)),
          times: times.split(',').map((t) => t.trim()).filter(Boolean),
          timezone: 'Asia/Tokyo',
          max_seats: parseInt(maxSeats) || 50,
        },
        lp_settings: {
          headline,
          subheadline,
          benefits: benefits.split('\n').map((b) => b.trim()).filter(Boolean),
          testimonials: campaign?.lp_settings.testimonials ?? [],
          cta_text: ctaText,
        },
      }

      const url = isEditing
        ? `/api/admin/campaigns/${campaign.id}`
        : '/api/admin/campaigns'

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '保存に失敗しました')
      }

      const data = await res.json()
      router.push(`/admin/campaigns/${data.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-eg-heading text-lg font-semibold text-eg-primary">基本情報</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="c-name" className="mb-1 block text-sm font-medium text-eg-text-primary">
              キャンペーン名 *
            </label>
            <input
              id="c-name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!isEditing) setSlug(generateSlug(e.target.value))
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            />
          </div>
          <div>
            <label htmlFor="c-slug" className="mb-1 block text-sm font-medium text-eg-text-primary">
              スラッグ * (URL: /c/{slug || '...'})
            </label>
            <input
              id="c-slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              pattern="^[a-z0-9-]+$"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="c-desc" className="mb-1 block text-sm font-medium text-eg-text-primary">
              説明
            </label>
            <textarea
              id="c-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            />
          </div>
          <div>
            <label htmlFor="c-video" className="mb-1 block text-sm font-medium text-eg-text-primary">
              動画
            </label>
            <select
              id="c-video"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            >
              <option value="">-- 動画を選択 --</option>
              {videos.map((v) => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-eg-accent focus:ring-eg-accent"
              />
              <span className="text-sm font-medium text-eg-text-primary">キャンペーンを有効にする</span>
            </label>
          </div>
        </div>
      </section>

      {/* Session Rules */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-eg-heading text-lg font-semibold text-eg-primary">セッション設定</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="c-days" className="mb-1 block text-sm font-medium text-eg-text-primary">
              日数オフセット (カンマ区切り)
            </label>
            <input
              id="c-days"
              type="text"
              value={daysOffsets}
              onChange={(e) => setDaysOffsets(e.target.value)}
              placeholder="3, 5, 7"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            />
            <p className="mt-1 text-xs text-eg-text-secondary">訪問日から何日後にセッションを設定するか</p>
          </div>
          <div>
            <label htmlFor="c-times" className="mb-1 block text-sm font-medium text-eg-text-primary">
              開始時刻 (カンマ区切り)
            </label>
            <input
              id="c-times"
              type="text"
              value={times}
              onChange={(e) => setTimes(e.target.value)}
              placeholder="20:00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            />
          </div>
          <div>
            <label htmlFor="c-seats" className="mb-1 block text-sm font-medium text-eg-text-primary">
              最大席数
            </label>
            <input
              id="c-seats"
              type="number"
              value={maxSeats}
              onChange={(e) => setMaxSeats(e.target.value)}
              min="1"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            />
          </div>
        </div>
      </section>

      {/* LP Settings */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-eg-heading text-lg font-semibold text-eg-primary">ランディングページ設定</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="c-headline" className="mb-1 block text-sm font-medium text-eg-text-primary">
              ヘッドライン
            </label>
            <input
              id="c-headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="あなたのビジネスを次のステージへ"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            />
          </div>
          <div>
            <label htmlFor="c-sub" className="mb-1 block text-sm font-medium text-eg-text-primary">
              サブヘッドライン
            </label>
            <input
              id="c-sub"
              type="text"
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            />
          </div>
          <div>
            <label htmlFor="c-benefits" className="mb-1 block text-sm font-medium text-eg-text-primary">
              特典・メリット (1行に1つ)
            </label>
            <textarea
              id="c-benefits"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              rows={4}
              placeholder="即実践できるノウハウを公開&#10;参加者限定の特別資料をプレゼント&#10;質疑応答の時間あり"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            />
          </div>
          <div className="sm:w-1/2">
            <label htmlFor="c-cta" className="mb-1 block text-sm font-medium text-eg-text-primary">
              CTAボタンテキスト
            </label>
            <input
              id="c-cta"
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            />
          </div>
        </div>
      </section>

      {/* Offer Settings */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-eg-heading text-lg font-semibold text-eg-primary">オファー設定</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="c-offer-url" className="mb-1 block text-sm font-medium text-eg-text-primary">
              オファーページURL
            </label>
            <input
              id="c-offer-url"
              type="url"
              value={offerUrl}
              onChange={(e) => setOfferUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            />
          </div>
          <div>
            <label htmlFor="c-offer-price" className="mb-1 block text-sm font-medium text-eg-text-primary">
              オファー価格 (円)
            </label>
            <input
              id="c-offer-price"
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              min="0"
              placeholder="49800"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-eg-accent focus:outline-none focus:ring-2 focus:ring-eg-accent/20"
            />
          </div>
        </div>
      </section>

      {error && (
        <p className="text-sm text-eg-error" role="alert">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-2 font-eg-heading text-sm font-medium text-eg-text-secondary hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-eg-accent px-6 py-2 font-eg-heading text-sm font-semibold text-white hover:bg-eg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : isEditing ? '更新' : '作成'}
        </button>
      </div>
    </form>
  )
}
