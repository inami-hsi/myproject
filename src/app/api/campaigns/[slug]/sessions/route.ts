import { NextRequest, NextResponse } from 'next/server'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createServiceRoleClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, registrations(count)')
    .eq('campaign_id', campaign.id)
    .gt('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(6)

  return NextResponse.json(sessions ?? [])
}
