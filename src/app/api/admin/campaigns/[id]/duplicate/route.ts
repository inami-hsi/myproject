import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createServiceRoleClient()

  // Fetch source campaign
  const { data: source, error: fetchError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !source) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  // Generate unique slug
  const baseSlug = source.slug.replace(/-copy(-\d+)?$/, '')
  const { data: existing } = await supabase
    .from('campaigns')
    .select('slug')
    .like('slug', `${baseSlug}-copy%`)

  const copyNum = (existing?.length ?? 0) + 1
  const newSlug = copyNum === 1 ? `${baseSlug}-copy` : `${baseSlug}-copy-${copyNum}`

  // Create duplicated campaign (inactive by default)
  const { data: newCampaign, error: insertError } = await supabase
    .from('campaigns')
    .insert({
      name: `${source.name}（コピー）`,
      slug: newSlug,
      description: source.description,
      video_id: source.video_id,
      is_active: false,
      offer_url: source.offer_url,
      offer_price: source.offer_price,
      offer_currency: source.offer_currency,
      session_rules: source.session_rules,
      lp_settings: source.lp_settings,
    })
    .select()
    .single()

  if (insertError || !newCampaign) {
    return NextResponse.json({ error: insertError?.message ?? 'Failed to duplicate' }, { status: 500 })
  }

  // Duplicate email templates
  const { data: templates } = await supabase
    .from('email_templates')
    .select('trigger_type, subject, body_html, delay_minutes, is_active')
    .eq('campaign_id', id)

  if (templates && templates.length > 0) {
    await supabase.from('email_templates').insert(
      templates.map((t) => ({
        campaign_id: newCampaign.id,
        trigger_type: t.trigger_type,
        subject: t.subject,
        body_html: t.body_html,
        delay_minutes: t.delay_minutes,
        is_active: t.is_active,
      }))
    )
  }

  return NextResponse.json({ id: newCampaign.id, slug: newSlug })
}
