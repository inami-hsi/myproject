-- =============================================================
-- Evergreen Launch Platform - Schema Migration
-- =============================================================
-- Issue: #22
-- Tables: campaigns, videos, sessions, registrations,
--         email_templates, email_logs, view_events, payments
-- =============================================================

-- =============================================================
-- videos (動画)
-- =============================================================
CREATE TABLE videos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  storage_url     TEXT NOT NULL,
  thumbnail_url   TEXT,
  duration_seconds INTEGER,
  is_public       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE videos IS 'ローンチ用動画';

-- =============================================================
-- campaigns (キャンペーン)
-- =============================================================
CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  video_id        UUID REFERENCES videos(id) ON DELETE SET NULL,
  is_active       BOOLEAN NOT NULL DEFAULT false,
  offer_url       TEXT,
  offer_price     INTEGER,
  offer_currency  TEXT DEFAULT 'jpy',
  session_rules   JSONB NOT NULL DEFAULT '{
    "days_offsets": [3, 5, 7],
    "times": ["20:00"],
    "timezone": "Asia/Tokyo",
    "max_seats": 50
  }'::jsonb,
  lp_settings     JSONB NOT NULL DEFAULT '{
    "headline": "",
    "subheadline": "",
    "benefits": [],
    "testimonials": [],
    "cta_text": "無料で参加する"
  }'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE campaigns IS 'エバーグリーンキャンペーン';

CREATE INDEX idx_campaigns_slug ON campaigns(slug);
CREATE INDEX idx_campaigns_active ON campaigns(is_active) WHERE is_active = true;

-- =============================================================
-- sessions (セッション日程)
-- =============================================================
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  starts_at       TIMESTAMPTZ NOT NULL,
  max_seats       INTEGER DEFAULT 50,
  is_generated    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE sessions IS 'セッション日程（エバーグリーン自動生成）';

CREATE INDEX idx_sessions_campaign ON sessions(campaign_id);
CREATE INDEX idx_sessions_starts_at ON sessions(starts_at);
CREATE INDEX idx_sessions_upcoming ON sessions(campaign_id, starts_at);

-- =============================================================
-- registrations (登録者)
-- =============================================================
CREATE TABLE registrations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  token           TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE registrations IS 'セッション登録者';

CREATE INDEX idx_registrations_campaign ON registrations(campaign_id);
CREATE INDEX idx_registrations_session ON registrations(session_id);
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE UNIQUE INDEX idx_registrations_token ON registrations(token);

-- =============================================================
-- email_templates (メールテンプレート)
-- =============================================================
CREATE TABLE email_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  trigger_type    TEXT NOT NULL CHECK (trigger_type IN (
    'confirmation', 'reminder_24h', 'reminder_1h',
    'start', 'followup', 'replay'
  )),
  subject         TEXT NOT NULL,
  body_html       TEXT NOT NULL,
  delay_minutes   INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE email_templates IS 'メールテンプレート';

CREATE INDEX idx_email_templates_campaign ON email_templates(campaign_id);
CREATE UNIQUE INDEX idx_email_templates_unique_trigger
  ON email_templates(campaign_id, trigger_type);

-- =============================================================
-- email_logs (メール送信ログ)
-- =============================================================
CREATE TABLE email_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id   UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  template_id       UUID NOT NULL REFERENCES email_templates(id) ON DELETE CASCADE,
  sent_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'failed', 'bounced'
  )),
  resend_id         TEXT,
  error_message     TEXT
);

COMMENT ON TABLE email_logs IS 'メール送信ログ';

CREATE INDEX idx_email_logs_registration ON email_logs(registration_id);
CREATE INDEX idx_email_logs_status ON email_logs(status) WHERE status = 'pending';

-- =============================================================
-- view_events (視聴イベント)
-- =============================================================
CREATE TABLE view_events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id   UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  event_type        TEXT NOT NULL CHECK (event_type IN (
    'page_view', 'play', 'pause', 'seek', 'complete', 'leave'
  )),
  progress_percent  INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE view_events IS '動画視聴イベント';

CREATE INDEX idx_view_events_registration ON view_events(registration_id);

-- =============================================================
-- payments (決済)
-- =============================================================
CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id   UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  stripe_payment_id TEXT UNIQUE,
  amount            INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'jpy',
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'succeeded', 'failed', 'refunded'
  )),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE payments IS '決済記録';

CREATE INDEX idx_payments_registration ON payments(registration_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_id);

-- =============================================================
-- RLS (Row Level Security)
-- =============================================================

-- Public tables (read-only for anonymous)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Service-role only tables
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Public read policies for campaigns/sessions/videos
CREATE POLICY "Public can read active campaigns"
  ON campaigns FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read sessions for active campaigns"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = sessions.campaign_id
      AND campaigns.is_active = true
    )
  );

CREATE POLICY "Public can read public videos"
  ON videos FOR SELECT
  USING (is_public = true);

-- Service role has full access (bypasses RLS)
-- Admin operations use createServiceRoleClient()

-- =============================================================
-- Updated_at trigger
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
