-- Migration 004: Doubt History and Voice Tutoring Sessions
-- Stores user doubts, multi-modal solutions, and talk mode transcripts with RLS

CREATE TABLE IF NOT EXISTS user_doubts (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL,
  question      TEXT NOT NULL,
  subject       TEXT NOT NULL DEFAULT 'Science',
  grade         INTEGER NOT NULL DEFAULT 10,
  solution      JSONB NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_doubts_user_id ON user_doubts (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_talk_sessions (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL,
  subject       TEXT DEFAULT 'Science',
  grade         INTEGER DEFAULT 10,
  topic         TEXT,
  messages      JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_talk_user_id ON user_talk_sessions (user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_talk_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only read and insert their own records
CREATE POLICY "Users can manage own doubts"
  ON user_doubts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own talk sessions"
  ON user_talk_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
