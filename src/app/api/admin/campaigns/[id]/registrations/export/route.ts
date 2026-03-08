import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('name')
    .eq('id', id)
    .single()

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const { data: registrations } = await supabase
    .from('registrations')
    .select('name, email, registered_at, utm_source, utm_medium, utm_campaign, sessions(starts_at)')
    .eq('campaign_id', id)
    .order('registered_at', { ascending: false })

  // Get view completion status
  const { data: allRegs } = await supabase
    .from('registrations')
    .select('id, email')
    .eq('campaign_id', id)

  const regMap = new Map((allRegs ?? []).map((r) => [r.id, r.email]))
  const regIds = Array.from(regMap.keys())

  let completedEmails = new Set<string>()
  if (regIds.length > 0) {
    const { data: completions } = await supabase
      .from('view_events')
      .select('registration_id')
      .in('registration_id', regIds)
      .eq('event_type', 'complete')

    completedEmails = new Set(
      (completions ?? []).map((c) => regMap.get(c.registration_id)).filter(Boolean) as string[]
    )
  }

  // Build CSV
  const header = '名前,メール,セッション日時,視聴状況,UTM Source,UTM Medium,UTM Campaign,登録日時'
  const rows = (registrations ?? []).map((reg) => {
    const sessionArr = reg.sessions as unknown as { starts_at: string }[] | null
    const session = sessionArr?.[0]
    const sessionDate = session
      ? new Date(session.starts_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
      : ''
    const viewStatus = completedEmails.has(reg.email) ? '完了' : '未視聴'
    const registeredAt = new Date(reg.registered_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })

    return [
      csvEscape(reg.name),
      csvEscape(reg.email),
      csvEscape(sessionDate),
      viewStatus,
      csvEscape(reg.utm_source ?? ''),
      csvEscape(reg.utm_medium ?? ''),
      csvEscape(reg.utm_campaign ?? ''),
      csvEscape(registeredAt),
    ].join(',')
  })

  const bom = '\uFEFF'
  const csv = bom + [header, ...rows].join('\n')
  const filename = `registrations_${campaign.name}_${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  })
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
