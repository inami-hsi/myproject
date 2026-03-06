-- =============================================================
-- Notifications table (referenced by /api/notifications)
-- =============================================================

CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type              TEXT NOT NULL DEFAULT 'alert'
    CHECK (type IN ('alert', 'system', 'download')),
  title             TEXT NOT NULL,
  message           TEXT,
  saved_search_id   UUID REFERENCES saved_searches(id) ON DELETE SET NULL,
  new_count         INTEGER,
  is_read           BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read)
  WHERE is_read = false;

COMMENT ON TABLE notifications IS 'ユーザー通知（アラート、システム、ダウンロード完了）';

-- RLS: 自分の通知のみ
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (user_id = (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt()->>'sub'
  ));
