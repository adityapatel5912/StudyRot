CREATE TABLE IF NOT EXISTS user_review_states (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL,
  card_id       TEXT NOT NULL,
  subject       TEXT NOT NULL,
  grade         INTEGER NOT NULL,
  topic         TEXT NOT NULL,
  stability     REAL NOT NULL DEFAULT 0,
  difficulty    REAL NOT NULL DEFAULT 5,
  last_reviewed TIMESTAMPTZ,
  next_review   TIMESTAMPTZ,
  review_count  INTEGER DEFAULT 0,
  UNIQUE(user_id, card_id)
);

CREATE INDEX IF NOT EXISTS idx_review_next ON user_review_states (user_id, next_review);

CREATE TABLE IF NOT EXISTS user_error_patterns (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL,
  card_id       TEXT NOT NULL,
  error_type    TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_review_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_error_patterns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_review_states' AND policyname = 'Users see own review states'
  ) THEN
    CREATE POLICY "Users see own review states" ON user_review_states
      FOR ALL USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_error_patterns' AND policyname = 'Users see own error patterns'
  ) THEN
    CREATE POLICY "Users see own error patterns" ON user_error_patterns
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;
