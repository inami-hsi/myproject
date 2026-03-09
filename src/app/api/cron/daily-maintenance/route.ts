import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Unified daily maintenance cron (Vercel Hobby: max 2 crons)
 * Runs at 03:00 UTC (12:00 JST)
 * Calls all maintenance endpoints internally.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://company-list-builder.vercel.app'
  const secret = process.env.CRON_SECRET!
  const results: Record<string, unknown> = {}

  const endpoints = [
    '/api/cron/generate-sessions',
    '/api/cron/sync-gbizinfo',
    '/api/cron/refresh-views',
    '/api/cron/cleanup-downloads',
    '/api/cron/check-alerts',
  ]

  // Check if it's the 1st of the month for reset-downloads
  const now = new Date()
  if (now.getUTCDate() === 1) {
    endpoints.push('/api/cron/reset-downloads')
  }

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${secret}` },
      })
      const data = await res.json()
      results[endpoint] = { status: res.status, ...data }
    } catch (err) {
      results[endpoint] = { status: 'error', message: err instanceof Error ? err.message : 'Unknown' }
    }
  }

  return NextResponse.json({
    success: true,
    results,
    timestamp: new Date().toISOString(),
  })
}
