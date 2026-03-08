'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface VideoPlayerProps {
  src: string
  registrationId: string
  onComplete?: () => void
}

export function VideoPlayer({ src, registrationId, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const lastReportedProgress = useRef(0)

  const trackEvent = useCallback(async (eventType: string, progressPercent: number) => {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: registrationId,
          event_type: eventType,
          progress_percent: Math.round(progressPercent),
        }),
      })
    } catch {
      // Silently fail - don't interrupt viewing
    }
  }, [registrationId])

  useEffect(() => {
    trackEvent('page_view', 0)
  }, [trackEvent])

  function handleTimeUpdate() {
    const video = videoRef.current
    if (!video) return

    const current = video.currentTime
    const dur = video.duration || 1
    const prog = (current / dur) * 100

    setCurrentTime(current)
    setProgress(prog)

    // Report progress every 10%
    const milestone = Math.floor(prog / 10) * 10
    if (milestone > lastReportedProgress.current) {
      lastReportedProgress.current = milestone
      trackEvent('play', milestone)
    }
  }

  function handlePlay() {
    setIsPlaying(true)
    if (lastReportedProgress.current === 0) {
      trackEvent('play', 0)
    }
  }

  function handlePause() {
    setIsPlaying(false)
    trackEvent('pause', progress)
  }

  function handleEnded() {
    setIsPlaying(false)
    trackEvent('complete', 100)
    onComplete?.()
  }

  function handleSeek() {
    trackEvent('seek', progress)
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const video = videoRef.current
    if (!video) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    video.currentTime = percent * video.duration
  }

  return (
    <div className="group relative overflow-hidden rounded-xl bg-black shadow-2xl">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="aspect-video w-full"
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onSeeked={handleSeek}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        playsInline
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Custom Controls */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {/* Progress Bar */}
        <div
          className="mb-3 h-1.5 cursor-pointer rounded-full bg-white/30"
          onClick={handleProgressClick}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="動画の再生位置"
        >
          <div
            className="h-full rounded-full bg-eg-accent transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
            aria-label={isPlaying ? '一時停止' : '再生'}
          >
            {isPlaying ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Time */}
          <span className="font-eg-heading text-sm tabular-nums text-white/80">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Fullscreen */}
          <button
            onClick={() => videoRef.current?.requestFullscreen?.()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
            aria-label="フルスクリーン"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Big play button overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20"
          aria-label="再生"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-eg-accent/90 text-white shadow-lg transition-transform duration-200 hover:scale-110">
            <svg className="h-8 w-8 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}
    </div>
  )
}
