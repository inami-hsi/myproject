import { NextRequest, NextResponse } from 'next/server'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'
import { generateUpcomingSessions } from '@/lib/evergreen/sessions'
import type { SessionRules } from '@/types/evergreen'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceRoleClient()
    let created = 0

    // Get all active campaigns
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, session_rules')
      .eq('is_active', true)

    if (!campaigns) {
      return NextResponse.json({ success: true, created: 0 })
    }

    for (const campaign of campaigns) {
      const rules = campaign.session_rules as SessionRules
      const upcomingDates = generateUpcomingSessions(rules)

      // Check ALL existing sessions for this campaign (not just future)
      // to prevent duplicates even across cron runs
      const { data: existing } = await supabase
        .from('sessions')
        .select('starts_at')
        .eq('campaign_id', campaign.id)

      // Use date string truncated to minute for dedup key
      // Round to nearest minute to handle millisecond differences
      const existingKeys = new Set(
        (existing ?? []).map((s) => {
          const d = new Date(s.starts_at)
          d.setSeconds(0, 0)
          return `${campaign.id}_${d.toISOString()}`
        })
      )

      const toInsert = upcomingDates
        .filter((d) => {
          const rounded = new Date(d)
          rounded.setSeconds(0, 0)
          return !existingKeys.has(`${campaign.id}_${rounded.toISOString()}`)
        })
        .map((d) => {
          const rounded = new Date(d)
          rounded.setSeconds(0, 0)
          return {
            campaign_id: campaign.id,
            starts_at: rounded.toISOString(),
            max_seats: rules.max_seats,
            is_generated: true,
          }
        })

      if (toInsert.length > 0) {
        // Insert one by one to skip duplicates gracefully
        for (const session of toInsert) {
          const { error } = await supabase.from('sessions').insert(session)
          if (!error) created++
        }
      }
    }

    return NextResponse.json({
      success: true,
      created,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Cron generate-sessions error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
