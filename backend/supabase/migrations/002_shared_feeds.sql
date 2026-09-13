CREATE TABLE IF NOT EXISTS shared_feeds (
  id            BIGSERIAL PRIMARY KEY,
  short_code    TEXT UNIQUE NOT NULL,
  subject       TEXT NOT NULL,
  grade         INTEGER NOT NULL,
  topic         TEXT,
  vibe          TEXT,
  posts         JSONB NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  view_count    INTEGER DEFAULT 0,
  created_ip    INET
);

CREATE INDEX IF NOT EXISTS idx_shared_feeds_code ON shared_feeds (short_code);
CREATE INDEX IF NOT EXISTS idx_shared_feeds_expires ON shared_feeds (expires_at);

ALTER TABLE shared_feeds ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shared_feeds' AND policyname = 'Anyone can read shared feeds'
  ) THEN
    CREATE POLICY "Anyone can read shared feeds"
      ON shared_feeds FOR SELECT
      USING (true);
  END IF;
END
$$;
