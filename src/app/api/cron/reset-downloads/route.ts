import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * POST /api/cron/reset-downloads
 *
 * Resets monthly_download_count to 0 for all users whose download_reset_at
 * is before the start of the current month, then sets download_reset_at
 * to the current month start.
 *
 * Designed to run on the 1st of each month at 00:00 UTC.
 *
 * Requires: Authorization: Bearer {CRON_SECRET}
 */
export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = new Date().toISOString()

  try {
    const supabase = createServiceRoleClient()

    // Compute the start of the current month in UTC
    const now = new Date()
    const currentMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    ).toISOString()

    // Find users whose download_reset_at is before the current month start
    // This means their counter hasn't been reset for this month yet
    const { data: usersToReset, error: selectError } = await supabase
      .from('users')
      .select('id')
      .lt('download_reset_at', currentMonthStart)

    if (selectError) {
      console.error('[cron/reset-downloads] Select error:', selectError)
      return NextResponse.json(
        {
          success: false,
          error: selectError.message,
          started_at: startedAt,
          completed_at: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    const userIds = (usersToReset ?? []).map((u) => u.id)

    if (userIds.length === 0) {
      console.log('[cron/reset-downloads] No users to reset')
      return NextResponse.json({
        success: true,
        reset_count: 0,
        current_month_start: currentMonthStart,
        started_at: startedAt,
        completed_at: new Date().toISOString(),
      })
    }

    // Reset monthly_download_count and update download_reset_at
    const { error: updateError } = await supabase
      .from('users')
      .update({
        monthly_download_count: 0,
        download_reset_at: currentMonthStart,
      })
      .in('id', userIds)

    if (updateError) {
      console.error('[cron/reset-downloads] Update error:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: updateError.message,
          started_at: startedAt,
          completed_at: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    const completedAt = new Date().toISOString()
    console.log(
      `[cron/reset-downloads] Reset ${userIds.length} user(s) at ${completedAt}`
    )

    return NextResponse.json({
      success: true,
      reset_count: userIds.length,
      current_month_start: currentMonthStart,
      started_at: startedAt,
      completed_at: completedAt,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[cron/reset-downloads] Fatal error:', message)

    return NextResponse.json(
      {
        success: false,
        error: message,
        started_at: startedAt,
        completed_at: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
