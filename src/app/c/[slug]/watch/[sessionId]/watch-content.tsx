'use client'

import { useState, useCallback } from 'react'
import { CountdownTimer } from '@/components/evergreen/countdown-timer'
import { VideoPlayer } from '@/components/evergreen/video-player'
import { motion, AnimatePresence } from 'motion/react'
import type { Registration, Session, Campaign, Video } from '@/types/evergreen'

type WatchPhase = 'countdown' | 'video' | 'offer'

interface WatchContentProps {
  registration: Registration
  session: Session
  campaign: Campaign
  video: Video | null
}

export function WatchContent({
  registration,
  session,
  campaign,
  video,
}: WatchContentProps) {
  const isSessionStarted = new Date(session.starts_at) <= new Date()
  const [phase, setPhase] = useState<WatchPhase>(isSessionStarted ? 'video' : 'countdown')
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCountdownComplete = useCallback(() => {
    setPhase('video')
  }, [])

  const handleVideoComplete = useCallback(() => {
    if (campaign.offer_url || campaign.offer_price) {
      setPhase('offer')
    }
  }, [campaign.offer_url, campaign.offer_price])

  const handleCheckout = useCallback(async () => {
    if (!campaign.offer_price) {
      // No price = external link
      if (campaign.offer_url) window.location.href = campaign.offer_url
      return
    }

    setIsCheckingOut(true)
    try {
      const res = await fetch('/api/checkout/evergreen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: registration.id,
          token: registration.token,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || '購入処理に失敗しました')
        return
      }

      const { checkout_url } = await res.json()
      window.location.href = checkout_url
    } catch {
      alert('購入処理に失敗しました')
    } finally {
      setIsCheckingOut(false)
    }
  }, [campaign.offer_price, campaign.offer_url, registration.id, registration.token])

  return (
    <AnimatePresence mode="wait">
      {phase === 'countdown' && (
        <motion.div
          key="countdown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex min-h-dvh flex-col items-center justify-center px-4 py-16"
        >
          <div className="mx-auto max-w-lg text-center">
            <p className="font-eg-heading text-sm font-medium uppercase tracking-widest text-eg-text-secondary">
              あなたのセッションまで
            </p>
            <div className="mt-8">
              <CountdownTimer
                targetDate={session.starts_at}
                onComplete={handleCountdownComplete}
                size="lg"
              />
            </div>
            <p className="mt-8 text-lg text-eg-text-secondary">
              準備はよろしいですか？
            </p>
            <p className="mt-2 text-sm text-eg-text-secondary">
              開始時にメールでもお知らせします。
            </p>
          </div>
        </motion.div>
      )}

      {phase === 'video' && (
        <motion.div
          key="video"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4 py-8 sm:py-16"
        >
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-center font-eg-display text-2xl font-bold text-eg-primary sm:text-3xl">
              {campaign.name}
            </h1>

            {video ? (
              <VideoPlayer
                src={video.storage_url}
                registrationId={registration.id}
                onComplete={handleVideoComplete}
              />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-xl bg-gray-100">
                <p className="text-eg-text-secondary">動画を準備中です</p>
              </div>
            )}

            {video?.description && (
              <p className="mt-6 text-center text-eg-text-secondary">
                {video.description}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {phase === 'offer' && (
        <motion.div
          key="offer"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex min-h-dvh flex-col items-center justify-center px-4 py-16"
        >
          <div className="mx-auto max-w-lg text-center">
            <p className="font-eg-heading text-sm font-medium text-eg-gold">
              期間限定特別オファー
            </p>
            <h2 className="mt-4 font-eg-display text-3xl font-bold text-eg-primary sm:text-4xl">
              {campaign.name}
            </h2>
            {campaign.offer_price && (
              <p className="mt-4 font-eg-heading text-4xl font-bold text-eg-accent">
                ¥{campaign.offer_price.toLocaleString()}
              </p>
            )}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="mt-8 inline-block rounded-lg bg-eg-accent px-10 py-5 font-eg-heading text-xl font-bold text-white
                shadow-lg transition-all duration-200 hover:bg-eg-accent/90 hover:shadow-xl
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eg-accent focus-visible:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCheckingOut ? '処理中...' : '今すぐ特別価格で申し込む'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
