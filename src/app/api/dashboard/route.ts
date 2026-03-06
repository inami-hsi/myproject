import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPlanLimits } from '@/lib/plan-limits'

/**
 * GET /api/dashboard
 *
 * Returns the authenticated user's dashboard data:
 * - user profile with plan and download usage
 * - recent downloads (last 10)
 * - saved searches with result counts
 * - aggregate stats
 */
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    // ── Fetch user ────────────────────────────────────────
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, plan, monthly_download_count, download_reset_at')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // ── Fetch recent downloads (last 10) ──────────────────
    const { data: recentDownloads } = await supabase
      .from('download_logs')
      .select('id, format, encoding, record_count, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // ── Fetch saved searches ──────────────────────────────
    const { data: savedSearches } = await supabase
      .from('saved_searches')
      .select('id, name, search_params, result_count, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    // ── Compute stats ─────────────────────────────────────
    const limits = getPlanLimits(user.plan)

    const totalSavedSearches = savedSearches?.length ?? 0
    const totalDownloadsThisMonth = user.monthly_download_count

    return NextResponse.json({
      user: {
        email: user.email,
        plan: user.plan,
        monthly_download_count: user.monthly_download_count,
        download_reset_at: user.download_reset_at,
        download_limit: limits.monthlyDownloadRecords,
      },
      recent_downloads: recentDownloads ?? [],
      saved_searches: savedSearches ?? [],
      stats: {
        total_downloads_this_month: totalDownloadsThisMonth,
        total_saved_searches: totalSavedSearches,
      },
    })
  } catch (error) {
    console.error('[dashboard] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
