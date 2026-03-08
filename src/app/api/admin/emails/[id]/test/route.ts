import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'

const testSchema = z.object({
  to: z.string().email(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = testSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

  const { data: template } = await supabase
    .from('email_templates')
    .select('subject, body_html, campaign_id')
    .eq('id', id)
    .single()

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('name')
    .eq('id', template.campaign_id)
    .single()

  // Replace placeholders with sample data
  const html = template.body_html
    .replace(/\{\{name\}\}/g, '山田 太郎')
    .replace(/\{\{session_date\}\}/g, '2026年3月15日(日) 20:00')
    .replace(/\{\{watch_url\}\}/g, '#')
    .replace(/\{\{campaign_name\}\}/g, campaign?.name ?? 'サンプルキャンペーン')

  const subject = `[テスト] ${template.subject
    .replace(/\{\{name\}\}/g, '山田 太郎')
    .replace(/\{\{campaign_name\}\}/g, campaign?.name ?? 'サンプルキャンペーン')}`

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: 'Evergreen <noreply@resend.dev>',
    to: parsed.data.to,
    subject,
    html,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
