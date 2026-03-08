import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/cron/cleanup-downloads
 *
 * Marks download_logs with status 'completed' that are older than 7 days as 'expired',
 * and clears their file_url so the files can be garbage-collected from storage.
 *
 * Designed to run daily at UTC 20:00 (JST 05:00).
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

    // 7 days ago
    const cutoff = new Date()
    cutoff.setUTCDate(cutoff.getUTCDate() - 7)
    const cutoffISO = cutoff.toISOString()

    // Find completed downloads older than 7 days
    const { data: expiredLogs, error: selectError } = await supabase
      .from('download_logs')
      .select('id')
      .eq('status', 'completed')
      .lt('created_at', cutoffISO)

    if (selectError) {
      console.error('[cron/cleanup-downloads] Select error:', selectError)
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

    const ids = (expiredLogs ?? []).map((r) => r.id)

    if (ids.length === 0) {
      console.log('[cron/cleanup-downloads] No downloads to clean up')
      return NextResponse.json({
        success: true,
        cleanup_count: 0,
        cutoff: cutoffISO,
        started_at: startedAt,
        completed_at: new Date().toISOString(),
      })
    }

    // Mark as expired and clear file_url
    const { error: updateError } = await supabase
      .from('download_logs')
      .update({
        status: 'expired',
        file_url: null,
      })
      .in('id', ids)

    if (updateError) {
      console.error('[cron/cleanup-downloads] Update error:', updateError)
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
      `[cron/cleanup-downloads] Cleaned up ${ids.length} expired download(s) at ${completedAt}`
    )

    return NextResponse.json({
      success: true,
      cleanup_count: ids.length,
      cutoff: cutoffISO,
      started_at: startedAt,
      completed_at: completedAt,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[cron/cleanup-downloads] Fatal error:', message)

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
