import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  video_id: z.string().uuid().optional(),
  offer_url: z.string().url().optional(),
  offer_price: z.number().int().positive().optional(),
  session_rules: z.object({
    days_offsets: z.array(z.number().int().positive()),
    times: z.array(z.string().regex(/^\d{2}:\d{2}$/)),
    timezone: z.string(),
    max_seats: z.number().int().positive(),
  }).optional(),
  lp_settings: z.object({
    headline: z.string(),
    subheadline: z.string(),
    benefits: z.array(z.string()),
    testimonials: z.array(z.object({
      name: z.string(),
      text: z.string(),
      role: z.string().optional(),
    })),
    cta_text: z.string(),
  }).optional(),
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, registrations(count)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createCampaignSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createServiceRoleClient()

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from('campaigns')
    .select('id')
    .eq('slug', parsed.data.slug)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'このスラッグは既に使用されています' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Create default email templates
  const defaultTemplates = [
    {
      campaign_id: data.id,
      trigger_type: 'confirmation',
      subject: '【{{session_date}}】セッション登録完了のお知らせ',
      body_html: '<h1>{{name}}様</h1><p>セッションへのご登録ありがとうございます。</p><p>セッション日時: {{session_date}}</p>',
      delay_minutes: 0,
    },
    {
      campaign_id: data.id,
      trigger_type: 'reminder_24h',
      subject: '【明日開催】セッションのリマインダー',
      body_html: '<h1>{{name}}様</h1><p>明日のセッションをお忘れなく！</p><p>セッション日時: {{session_date}}</p>',
      delay_minutes: -1440,
    },
    {
      campaign_id: data.id,
      trigger_type: 'reminder_1h',
      subject: '【まもなく開始】セッション開始1時間前です',
      body_html: '<h1>{{name}}様</h1><p>セッションがまもなく始まります。</p>',
      delay_minutes: -60,
    },
    {
      campaign_id: data.id,
      trigger_type: 'start',
      subject: '【今すぐ視聴】セッションが始まりました！',
      body_html: '<h1>{{name}}様</h1><p>セッションが始まりました。今すぐご視聴ください。</p>',
      delay_minutes: 0,
    },
    {
      campaign_id: data.id,
      trigger_type: 'followup',
      subject: 'セッションのご視聴ありがとうございました',
      body_html: '<h1>{{name}}様</h1><p>セッションをご視聴いただきありがとうございました。</p>',
      delay_minutes: 60,
    },
    {
      campaign_id: data.id,
      trigger_type: 'replay',
      subject: 'セッションのリプレイをご覧いただけます',
      body_html: '<h1>{{name}}様</h1><p>セッションを見逃された方へ、リプレイをご用意しました。</p>',
      delay_minutes: 1440,
    },
  ]

  await supabase.from('email_templates').insert(defaultTemplates)

  return NextResponse.json(data, { status: 201 })
}
