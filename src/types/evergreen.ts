// Evergreen Launch Platform Types

export interface Campaign {
  id: string
  name: string
  slug: string
  description: string | null
  video_id: string | null
  is_active: boolean
  offer_url: string | null
  offer_price: number | null
  offer_currency: string
  session_rules: SessionRules
  lp_settings: LPSettings
  created_at: string
  updated_at: string
}

export interface SessionRules {
  days_offsets: number[]
  times: string[]
  timezone: string
  max_seats: number
}

export interface LPSettings {
  headline: string
  subheadline: string
  benefits: string[]
  testimonials: Testimonial[]
  cta_text: string
}

export interface Testimonial {
  name: string
  text: string
  role?: string
}

export interface Video {
  id: string
  title: string
  description: string | null
  storage_url: string
  thumbnail_url: string | null
  duration_seconds: number | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  campaign_id: string
  starts_at: string
  max_seats: number
  is_generated: boolean
  created_at: string
}

export interface SessionWithCount extends Session {
  registration_count: number
  remaining_seats: number
}

export interface Registration {
  id: string
  campaign_id: string
  session_id: string
  name: string
  email: string
  token: string
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  registered_at: string
}

export interface EmailTemplate {
  id: string
  campaign_id: string
  trigger_type: EmailTriggerType
  subject: string
  body_html: string
  delay_minutes: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type EmailTriggerType =
  | 'confirmation'
  | 'reminder_24h'
  | 'reminder_1h'
  | 'start'
  | 'followup'
  | 'replay'

export interface EmailLog {
  id: string
  registration_id: string
  template_id: string
  sent_at: string
  status: 'pending' | 'sent' | 'failed' | 'bounced'
  resend_id: string | null
  error_message: string | null
}

export interface ViewEvent {
  id: string
  registration_id: string
  event_type: 'page_view' | 'play' | 'pause' | 'seek' | 'complete' | 'leave'
  progress_percent: number
  created_at: string
}

export interface Payment {
  id: string
  registration_id: string
  stripe_payment_id: string | null
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'
  created_at: string
}

// API request/response types

export interface RegisterRequest {
  campaign_slug: string
  session_id: string
  name: string
  email: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

export interface RegisterResponse {
  success: boolean
  registration_id: string
  token: string
  session: Session
}

export interface CampaignWithSessions extends Campaign {
  video: Video | null
  sessions: SessionWithCount[]
}

export interface WatchPageData {
  registration: Registration
  session: Session
  campaign: Campaign
  video: Video | null
  has_completed: boolean
}
