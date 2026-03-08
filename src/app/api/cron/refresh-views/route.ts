import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/cron/refresh-views
 *
 * Refreshes all materialized views via the `refresh_all_materialized_views` RPC.
 * Designed to run daily at JST 04:00 (UTC 19:00).
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

    const { error } = await supabase.rpc('refresh_all_materialized_views')

    if (error) {
      console.error('[cron/refresh-views] RPC error:', error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          started_at: startedAt,
          completed_at: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    const completedAt = new Date().toISOString()
    console.log(`[cron/refresh-views] Materialized views refreshed successfully at ${completedAt}`)

    return NextResponse.json({
      success: true,
      message: 'All materialized views refreshed successfully',
      started_at: startedAt,
      completed_at: completedAt,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[cron/refresh-views] Fatal error:', message)

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
