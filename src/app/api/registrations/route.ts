import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'
import { createRegistration } from '@/lib/evergreen/queries'
import { Resend } from 'resend'

const registerSchema = z.object({
  campaign_slug: z.string().min(1),
  session_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容に不備があります', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { campaign_slug, session_id, name, email, utm_source, utm_medium, utm_campaign } = parsed.data
    const supabase = createServiceRoleClient()

    // Verify campaign exists and is active
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .eq('slug', campaign_slug)
      .eq('is_active', true)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: 'キャンペーンが見つかりません' }, { status: 404 })
    }

    // Verify session exists and belongs to campaign
    const { data: session } = await supabase
      .from('sessions')
      .select('id, starts_at, max_seats')
      .eq('id', session_id)
      .eq('campaign_id', campaign.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'セッションが見つかりません' }, { status: 404 })
    }

    // Check seat availability
    const { count } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session_id)

    if (count !== null && session.max_seats !== null && count >= session.max_seats) {
      return NextResponse.json({ error: 'このセッションは満席です' }, { status: 409 })
    }

    // Create registration
    const registration = await createRegistration({
      campaign_id: campaign.id,
      session_id,
      name,
      email,
      utm_source,
      utm_medium,
      utm_campaign,
    })

    if (!registration) {
      return NextResponse.json({ error: '登録に失敗しました' }, { status: 500 })
    }

    // Send confirmation email (async, don't block response)
    sendConfirmationEmail({
      campaignId: campaign.id,
      campaignSlug: campaign_slug,
      registrationId: registration.id,
      token: registration.token,
      sessionId: session_id,
      email,
      name,
      startsAt: session.starts_at,
    }).catch((err) => console.error('Confirmation email error:', err))

    return NextResponse.json({
      success: true,
      registration_id: registration.id,
      token: registration.token,
    })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: '内部エラーが発生しました' }, { status: 500 })
  }
}

async function sendConfirmationEmail(params: {
  campaignId: string
  campaignSlug: string
  registrationId: string
  token: string
  sessionId: string
  email: string
  name: string
  startsAt: string
}) {
  const { campaignId, campaignSlug, registrationId, token, sessionId, email, name, startsAt } = params
  const supabase = createServiceRoleClient()

  // Get confirmation template
  const { data: template } = await supabase
    .from('email_templates')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('trigger_type', 'confirmation')
    .eq('is_active', true)
    .single()

  if (!template) return

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const watchUrl = `${baseUrl}/c/${campaignSlug}/watch/${sessionId}?token=${token}`

  const sessionDate = new Date(startsAt).toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Replace placeholders in template
  const subject = template.subject
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{session_date\}\}/g, sessionDate)

  const html = template.body_html
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{session_date\}\}/g, sessionDate)
    .replace(/\{\{watch_url\}\}/g, watchUrl)

  const { data: sendResult, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@heartline-inc.com',
    to: email,
    subject,
    html,
  })

  // Log the email
  await supabase.from('email_logs').insert({
    registration_id: registrationId,
    template_id: template.id,
    status: error ? 'failed' : 'sent',
    resend_id: sendResult?.id ?? null,
    error_message: error?.message ?? null,
  })
}
