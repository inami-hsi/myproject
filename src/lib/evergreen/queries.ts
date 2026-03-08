import { createUntypedServiceRoleClient as createServiceRoleClient } from '@/lib/supabase/server'
import type {
  Campaign,
  CampaignWithSessions,
  Registration,
  SessionWithCount,
  WatchPageData,
} from '@/types/evergreen'
import { generateUpcomingSessions } from './sessions'
import { getVideoSignedUrl } from './storage'

/**
 * Get a campaign by slug with upcoming sessions.
 */
export async function getCampaignBySlug(
  slug: string
): Promise<CampaignWithSessions | null> {
  const supabase = createServiceRoleClient()

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !campaign) return null

  // Ensure sessions exist for upcoming dates
  await ensureUpcomingSessions(campaign as Campaign)

  // Fetch sessions with registration counts
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, registrations(count)')
    .eq('campaign_id', campaign.id)
    .gt('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(6)

  const sessionsWithCounts: SessionWithCount[] = (sessions ?? []).map((s) => {
    const count = (s as Record<string, unknown>).registrations as { count: number }[] | undefined
    const registrationCount = count?.[0]?.count ?? 0
    const maxSeats = s.max_seats ?? (campaign.session_rules as { max_seats?: number }).max_seats ?? 50
    return {
      ...s,
      registration_count: registrationCount,
      remaining_seats: Math.max(0, maxSeats - registrationCount),
    }
  })

  // Fetch video if linked
  let video = null
  if (campaign.video_id) {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('id', campaign.video_id)
      .single()
    video = data
  }

  return {
    ...(campaign as Campaign),
    video,
    sessions: sessionsWithCounts,
  }
}

/**
 * Ensure upcoming sessions exist based on campaign rules.
 * Creates missing sessions automatically (evergreen behavior).
 */
async function ensureUpcomingSessions(campaign: Campaign): Promise<void> {
  const supabase = createServiceRoleClient()
  const rules = campaign.session_rules
  const upcomingDates = generateUpcomingSessions(rules)

  if (upcomingDates.length === 0) return

  // Check existing sessions
  const { data: existing } = await supabase
    .from('sessions')
    .select('starts_at')
    .eq('campaign_id', campaign.id)
    .gt('starts_at', new Date().toISOString())

  // Compare by ISO string (minute precision) to avoid millisecond mismatches
  const existingKeys = new Set(
    (existing ?? []).map((s) => new Date(s.starts_at).toISOString().slice(0, 16))
  )

  // Insert missing sessions
  const toInsert = upcomingDates
    .filter((d) => !existingKeys.has(d.toISOString().slice(0, 16)))
    .map((d) => ({
      campaign_id: campaign.id,
      starts_at: d.toISOString(),
      max_seats: rules.max_seats,
      is_generated: true,
    }))

  if (toInsert.length > 0) {
    await supabase.from('sessions').insert(toInsert)
  }
}

/**
 * Create a registration for a session.
 */
export async function createRegistration(params: {
  campaign_id: string
  session_id: string
  name: string
  email: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}): Promise<Registration | null> {
  const supabase = createServiceRoleClient()

  // Check for existing registration with same email + session
  const { data: existing } = await supabase
    .from('registrations')
    .select('*')
    .eq('session_id', params.session_id)
    .eq('email', params.email)
    .single()

  if (existing) {
    // Update name if it changed
    if (existing.name !== params.name) {
      await supabase
        .from('registrations')
        .update({ name: params.name })
        .eq('id', existing.id)
    }
    return { ...existing, name: params.name } as Registration
  }

  const { data, error } = await supabase
    .from('registrations')
    .insert(params)
    .select()
    .single()

  if (error) {
    console.error('Registration error:', error)
    return null
  }

  return data as Registration
}

/**
 * Get watch page data by registration token.
 */
export async function getWatchPageData(
  token: string
): Promise<WatchPageData | null> {
  const supabase = createServiceRoleClient()

  const { data: registration, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !registration) return null

  const [sessionResult, campaignResult, viewResult] = await Promise.all([
    supabase
      .from('sessions')
      .select('*')
      .eq('id', registration.session_id)
      .single(),
    supabase
      .from('campaigns')
      .select('*')
      .eq('id', registration.campaign_id)
      .single(),
    supabase
      .from('view_events')
      .select('id')
      .eq('registration_id', registration.id)
      .eq('event_type', 'complete')
      .limit(1),
  ])

  if (!sessionResult.data || !campaignResult.data) return null

  const campaign = campaignResult.data as Campaign
  let video = null
  if (campaign.video_id) {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('id', campaign.video_id)
      .single()
    if (data) {
      // Generate signed URL for video playback
      const signedUrl = await getVideoSignedUrl(data.storage_url)
      video = { ...data, storage_url: signedUrl ?? data.storage_url }
    }
  }

  return {
    registration: registration as Registration,
    session: sessionResult.data,
    campaign,
    video,
    has_completed: (viewResult.data ?? []).length > 0,
  }
}
