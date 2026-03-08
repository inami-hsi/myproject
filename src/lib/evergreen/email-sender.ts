import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import type { EmailTriggerType } from '@/types/evergreen'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

interface PendingEmail {
  registration: {
    id: string
    name: string
    email: string
    token: string
  }
  template: {
    id: string
    subject: string
    body_html: string
    trigger_type: EmailTriggerType
  }
  session: {
    starts_at: string
  }
  campaign: {
    slug: string
    name: string
  }
}

/**
 * Process and send pending emails based on session timing.
 * Called by the cron job every 5 minutes.
 */
export async function processPendingEmails(): Promise<{
  sent: number
  failed: number
  errors: string[]
}> {
  const supabase = createServiceRoleClient()
  const now = new Date()
  const result = { sent: 0, failed: 0, errors: [] as string[] }

  // Get all active campaigns with email templates
  const { data: templates } = await supabase
    .from('email_templates')
    .select(`
      id, subject, body_html, trigger_type, delay_minutes, campaign_id,
      campaigns(id, slug, name, is_active)
    `)
    .eq('is_active', true)

  if (!templates) return result

  for (const template of templates) {
    const campaignArr = template.campaigns as unknown as { id: string; slug: string; name: string; is_active: boolean }[] | null
    const campaign = campaignArr?.[0] ?? null
    if (!campaign?.is_active) continue

    // Find registrations that need this email
    const pendingEmails = await findPendingRecipients(
      campaign.id,
      template.id,
      template.trigger_type as EmailTriggerType,
      template.delay_minutes,
      now
    )

    for (const pending of pendingEmails) {
      try {
        const sessionDate = new Date(pending.session.starts_at).toLocaleString('ja-JP', {
          timeZone: 'Asia/Tokyo',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
        })

        const watchUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${pending.campaign.slug}/watch/${pending.registration.token}`

        const subject = template.subject
          .replace(/\{\{name\}\}/g, pending.registration.name)
          .replace(/\{\{session_date\}\}/g, sessionDate)

        const html = template.body_html
          .replace(/\{\{name\}\}/g, pending.registration.name)
          .replace(/\{\{session_date\}\}/g, sessionDate)
          .replace(/\{\{watch_url\}\}/g, watchUrl)
          .replace(/\{\{campaign_name\}\}/g, pending.campaign.name)

        const { data, error } = await getResend().emails.send({
          from: FROM_EMAIL,
          to: pending.registration.email,
          subject,
          html,
        })

        await supabase.from('email_logs').insert({
          registration_id: pending.registration.id,
          template_id: template.id,
          status: error ? 'failed' : 'sent',
          resend_id: data?.id ?? null,
          error_message: error?.message ?? null,
        })

        if (error) {
          result.failed++
          result.errors.push(`${pending.registration.email}: ${error.message}`)
        } else {
          result.sent++
        }
      } catch (err) {
        result.failed++
        result.errors.push(`${pending.registration.email}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
  }

  return result
}

async function findPendingRecipients(
  campaignId: string,
  templateId: string,
  triggerType: EmailTriggerType,
  delayMinutes: number,
  now: Date
): Promise<PendingEmail[]> {
  const supabase = createServiceRoleClient()

  // Get all registrations for this campaign
  const { data: registrations } = await supabase
    .from('registrations')
    .select('id, name, email, token, session_id, sessions(starts_at), campaigns(slug, name)')
    .eq('campaign_id', campaignId)

  if (!registrations) return []

  // Get already sent emails for this template
  const { data: sentLogs } = await supabase
    .from('email_logs')
    .select('registration_id')
    .eq('template_id', templateId)
    .in('status', ['sent', 'pending'])

  const sentSet = new Set((sentLogs ?? []).map((l) => l.registration_id))

  const pending: PendingEmail[] = []

  for (const reg of registrations) {
    // Skip if already sent
    if (sentSet.has(reg.id)) continue

    const sessionArr = reg.sessions as unknown as { starts_at: string }[] | null
    const session = sessionArr?.[0] ?? null
    const campaignArr2 = reg.campaigns as unknown as { slug: string; name: string }[] | null
    const campaign = campaignArr2?.[0] ?? null
    if (!session || !campaign) continue

    const sessionStart = new Date(session.starts_at)
    const sendTime = new Date(sessionStart.getTime() + delayMinutes * 60 * 1000)

    // Check if it's time to send
    if (triggerType === 'confirmation') {
      // Confirmation is sent immediately by the registration API, skip here
      continue
    }

    // For followup, check if user has completed the video
    if (triggerType === 'followup') {
      const { count } = await supabase
        .from('view_events')
        .select('id', { count: 'exact', head: true })
        .eq('registration_id', reg.id)
        .eq('event_type', 'complete')

      if (!count || count === 0) continue
    }

    // For replay, check if user has NOT viewed the video
    if (triggerType === 'replay') {
      const { count } = await supabase
        .from('view_events')
        .select('id', { count: 'exact', head: true })
        .eq('registration_id', reg.id)
        .eq('event_type', 'play')

      if (count && count > 0) continue
    }

    // Check timing window (send within 10 minutes of target time)
    const diff = now.getTime() - sendTime.getTime()
    if (diff >= 0 && diff < 10 * 60 * 1000) {
      pending.push({
        registration: { id: reg.id, name: reg.name, email: reg.email, token: reg.token },
        template: {
          id: templateId,
          subject: '',
          body_html: '',
          trigger_type: triggerType,
        },
        session,
        campaign,
      })
    }
  }

  return pending
}
