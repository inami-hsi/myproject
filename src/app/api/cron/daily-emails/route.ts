import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Unified daily email cron (Vercel Hobby: max 2 crons)
 * Runs at 10:00 UTC (19:00 JST) - optimal for 1h-before reminders
 * for sessions at 20:00 JST.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://company-list-builder.vercel.app'
  const secret = process.env.CRON_SECRET!

  try {
    const res = await fetch(`${baseUrl}/api/cron/send-emails`, {
      headers: { Authorization: `Bearer ${secret}` },
    })
    const data = await res.json()

    return NextResponse.json({
      success: true,
      email_results: data,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Daily emails cron error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
