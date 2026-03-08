import { NextRequest, NextResponse } from 'next/server'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'
import { generateUpcomingSessions } from '@/lib/evergreen/sessions'
import type { SessionRules } from '@/types/evergreen'

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

      // Check existing future sessions
      const { data: existing } = await supabase
        .from('sessions')
        .select('starts_at')
        .eq('campaign_id', campaign.id)
        .gt('starts_at', new Date().toISOString())

      const existingTimes = new Set(
        (existing ?? []).map((s) => new Date(s.starts_at).getTime())
      )

      const toInsert = upcomingDates
        .filter((d) => !existingTimes.has(d.getTime()))
        .map((d) => ({
          campaign_id: campaign.id,
          starts_at: d.toISOString(),
          max_seats: rules.max_seats,
          is_generated: true,
        }))

      if (toInsert.length > 0) {
        await supabase.from('sessions').insert(toInsert)
        created += toInsert.length
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
