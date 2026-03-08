'use client'

import { useState, useEffect } from 'react'
import { getTimeRemaining } from '@/lib/evergreen/sessions'

interface CountdownTimerProps {
  targetDate: string
  onComplete?: () => void
  size?: 'sm' | 'lg'
}

export function CountdownTimer({ targetDate, onComplete, size = 'lg' }: CountdownTimerProps) {
  const [time, setTime] = useState<ReturnType<typeof getTimeRemaining> | null>(null)

  useEffect(() => {
    setTime(getTimeRemaining(targetDate))
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(targetDate)
      setTime(remaining)
      if (remaining.isStarted) {
        clearInterval(interval)
        onComplete?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate, onComplete])

  if (!time || time.isStarted) return null

  const units = time.days > 0
    ? [
        { value: time.days, label: '日' },
        { value: time.hours, label: '時' },
        { value: time.minutes, label: '分' },
        { value: time.seconds, label: '秒' },
      ]
    : [
        { value: time.hours, label: '時' },
        { value: time.minutes, label: '分' },
        { value: time.seconds, label: '秒' },
      ]

  const isLarge = size === 'lg'

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-2 sm:gap-4">
          <div className="text-center">
            <div
              className={`font-eg-heading font-bold tabular-nums ${
                isLarge
                  ? 'text-4xl sm:text-6xl text-eg-primary'
                  : 'text-2xl sm:text-3xl text-eg-primary'
              }`}
            >
              {String(unit.value).padStart(2, '0')}
            </div>
            <div
              className={`font-eg-body text-eg-text-secondary ${
                isLarge ? 'text-sm' : 'text-xs'
              }`}
            >
              {unit.label}
            </div>
          </div>
          {i < units.length - 1 && (
            <span
              className={`font-eg-heading font-bold text-eg-text-secondary ${
                isLarge ? 'text-3xl sm:text-5xl' : 'text-xl sm:text-2xl'
              } -mt-4`}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
