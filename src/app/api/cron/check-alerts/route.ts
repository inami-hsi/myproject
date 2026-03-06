import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'


export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchParams {
  industries?: string[]
  prefectures?: string[]
  cities?: string[]
  capital_min?: number
  capital_max?: number
  employee_min?: number
  employee_max?: number
  keyword?: string
  has_website?: boolean
  status?: 'active' | 'closed' | 'merged'
}

interface AlertResult {
  savedSearchId: string
  userId: string
  name: string
  previousCount: number | null
  currentCount: number
  newCompanies: number
  notificationCreated: boolean
}

// ---------------------------------------------------------------------------
// POST /api/cron/check-alerts — Check alerts and create notifications
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // Auth via CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const now = new Date()
  const results: AlertResult[] = []

  try {
    // Fetch all enabled alerts
    const { data: alerts, error: alertError } = await supabase
      .from('saved_searches')
      .select('id, user_id, name, search_params, result_count, notify_frequency, last_notified_at')
      .eq('notify_enabled', true)

    if (alertError) {
      console.error('[check-alerts] Query error:', alertError)
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 500 },
      )
    }

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No alerts to check',
        checked: 0,
        notifications_created: 0,
      })
    }

    let notificationsCreated = 0

    for (const alert of alerts) {
      // Check if it's time to notify based on frequency
      if (alert.last_notified_at) {
        const lastNotified = new Date(alert.last_notified_at)
        const hoursSinceNotified = (now.getTime() - lastNotified.getTime()) / (1000 * 60 * 60)

        if (alert.notify_frequency === 'daily' && hoursSinceNotified < 23) continue
        if (alert.notify_frequency === 'weekly' && hoursSinceNotified < 167) continue
        if (alert.notify_frequency === 'monthly' && hoursSinceNotified < 719) continue
      }

      const searchParams = alert.search_params as unknown as SearchParams
      const previousCount = alert.result_count ?? 0

      // Run the count query using the same logic as the search API
      const currentCount = await getSearchCount(supabase, searchParams)

      const result: AlertResult = {
        savedSearchId: alert.id,
        userId: alert.user_id,
        name: alert.name,
        previousCount,
        currentCount,
        newCompanies: Math.max(0, currentCount - previousCount),
        notificationCreated: false,
      }

      // If there are new companies, create a notification
      if (currentCount > previousCount) {
        const newCount = currentCount - previousCount

        const { error: insertError } = await supabase
          .from('notifications')
          .insert({
            user_id: alert.user_id,
            type: 'new_companies' as const,
            title: `「${alert.name}」に新着企業`,
            message: `検索条件「${alert.name}」に ${newCount.toLocaleString('ja-JP')} 件の新しい企業が見つかりました。`,
            saved_search_id: alert.id,
            new_count: newCount,
            is_read: false,
          })

        if (insertError) {
          console.error(`[check-alerts] Notification insert error for ${alert.id}:`, insertError)
        } else {
          result.notificationCreated = true
          notificationsCreated++
        }
      }

      // Update the saved search with current count and last notified time
      const { error: updateError } = await supabase
        .from('saved_searches')
        .update({
          result_count: currentCount,
          last_notified_at: now.toISOString(),
        })
        .eq('id', alert.id)

      if (updateError) {
        console.error(`[check-alerts] Update error for ${alert.id}:`, updateError)
      }

      results.push(result)
    }

    return NextResponse.json({
      success: true,
      checked: alerts.length,
      notifications_created: notificationsCreated,
      details: results,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[check-alerts] Fatal error: ${message}`)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// Helper: get search count for given filters
// ---------------------------------------------------------------------------

async function getSearchCount(
  supabase: ReturnType<typeof createServiceRoleClient>,
  params: SearchParams,
): Promise<number> {
  let query = supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })

  // Apply filters (mirrors the search API logic)
  if (params.keyword) {
    query = query.textSearch('search_vector', params.keyword, {
      type: 'websearch',
      config: 'japanese',
    })
  }

  if (params.prefectures && params.prefectures.length > 0) {
    query = query.in('prefecture_code', params.prefectures)
  }

  if (params.capital_min !== undefined) {
    query = query.gte('capital', params.capital_min)
  }
  if (params.capital_max !== undefined) {
    query = query.lte('capital', params.capital_max)
  }

  if (params.employee_min !== undefined) {
    query = query.gte('employee_count', params.employee_min)
  }
  if (params.employee_max !== undefined) {
    query = query.lte('employee_count', params.employee_max)
  }

  if (params.has_website !== undefined) {
    if (params.has_website) {
      query = query.not('website_url', 'is', null)
    } else {
      query = query.is('website_url', null)
    }
  }

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { count, error } = await query

  if (error) {
    console.error('[check-alerts] Count query error:', error)
    return 0
  }

  return count ?? 0
}
