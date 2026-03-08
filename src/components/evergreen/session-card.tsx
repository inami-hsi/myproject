'use client'

import type { SessionWithCount } from '@/types/evergreen'
import { formatSessionDate } from '@/lib/evergreen/sessions'
import { cn } from '@/lib/utils'

interface SessionCardProps {
  session: SessionWithCount
  timezone?: string
  selected: boolean
  onSelect: (sessionId: string) => void
}

export function SessionCard({
  session,
  timezone = 'Asia/Tokyo',
  selected,
  onSelect,
}: SessionCardProps) {
  const { date, time, dayOfWeek } = formatSessionDate(session.starts_at, timezone)
  const isFull = session.remaining_seats <= 0

  return (
    <button
      type="button"
      disabled={isFull}
      onClick={() => onSelect(session.id)}
      className={cn(
        'relative flex flex-col items-center rounded-xl border-2 px-6 py-5 transition-all duration-200',
        'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eg-accent',
        selected
          ? 'border-eg-accent bg-eg-accent/5 shadow-md'
          : 'border-gray-200 bg-white hover:border-eg-accent/50',
        isFull && 'cursor-not-allowed opacity-50'
      )}
    >
      <span className="font-eg-heading text-lg font-semibold text-eg-primary">
        {date}({dayOfWeek})
      </span>
      <span className="mt-1 font-eg-heading text-2xl font-bold text-eg-primary">
        {time}
      </span>
      <span
        className={cn(
          'mt-2 text-sm font-medium',
          isFull
            ? 'text-eg-error'
            : session.remaining_seats <= 10
              ? 'text-eg-accent'
              : 'text-eg-text-secondary'
        )}
      >
        {isFull ? '満席' : `残り${session.remaining_seats}席`}
      </span>
      {selected && (
        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-eg-accent text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  )
}
