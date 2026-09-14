-- Migration 006: Mock Tests schema and RLS
CREATE TABLE IF NOT EXISTS mock_tests (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID,
  subject       TEXT NOT NULL,
  grade         INTEGER NOT NULL,
  paper_json    JSONB NOT NULL,
  answers_json  JSONB,
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  submitted_at  TIMESTAMPTZ,
  total_marks   INTEGER,
  score         INTEGER,
  duration_sec  INTEGER,
  status        TEXT DEFAULT 'in_progress'
);

CREATE INDEX IF NOT EXISTS idx_mock_user ON mock_tests (user_id, started_at DESC);
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'mock_tests' AND policyname = 'Users see own mocks'
  ) THEN
    CREATE POLICY "Users see own mocks" ON mock_tests FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;
