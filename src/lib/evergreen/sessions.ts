import type { SessionRules } from '@/types/evergreen'

/**
 * Generate upcoming session dates based on campaign rules.
 * Sessions are generated relative to "now" so visitors always see
 * future dates (evergreen behavior).
 */
export function generateUpcomingSessions(
  rules: SessionRules,
  now: Date = new Date()
): Date[] {
  const { days_offsets, times, timezone } = rules
  const sessions: Date[] = []

  for (const dayOffset of days_offsets) {
    for (const time of times) {
      const [hours, minutes] = time.split(':').map(Number)
      const sessionDate = new Date(now)
      sessionDate.setDate(sessionDate.getDate() + dayOffset)

      // Set time in the campaign's timezone
      const dateStr = sessionDate.toLocaleDateString('en-CA', { timeZone: timezone })
      const sessionDateTime = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`)

      // Convert from campaign timezone to UTC
      const tzOffset = getTimezoneOffset(timezone, sessionDateTime)
      const utcDate = new Date(sessionDateTime.getTime() - tzOffset)

      // Only include future sessions
      if (utcDate > now) {
        sessions.push(utcDate)
      }
    }
  }

  return sessions.sort((a, b) => a.getTime() - b.getTime())
}

/**
 * Get timezone offset in milliseconds for a given timezone and date.
 */
function getTimezoneOffset(timezone: string, date: Date): number {
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' })
  const tzStr = date.toLocaleString('en-US', { timeZone: timezone })
  const utcDate = new Date(utcStr)
  const tzDate = new Date(tzStr)
  return tzDate.getTime() - utcDate.getTime()
}

/**
 * Format a session date for display in the user's locale.
 */
export function formatSessionDate(
  dateStr: string,
  timezone: string = 'Asia/Tokyo'
): { date: string; time: string; dayOfWeek: string } {
  const date = new Date(dateStr)

  const dateFormatted = date.toLocaleDateString('ja-JP', {
    timeZone: timezone,
    month: 'numeric',
    day: 'numeric',
  })

  const dayOfWeek = date.toLocaleDateString('ja-JP', {
    timeZone: timezone,
    weekday: 'short',
  })

  const time = date.toLocaleTimeString('ja-JP', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return { date: dateFormatted, time, dayOfWeek }
}

/**
 * Calculate remaining time until a session starts.
 */
export function getTimeRemaining(targetDate: string | Date): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
  isStarted: boolean
} {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  const total = target.getTime() - Date.now()

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isStarted: true }
  }

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
    isStarted: false,
  }
}
