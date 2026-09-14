-- Migration 008: Adaptive Study Pathway Generator schema and RLS
CREATE TABLE IF NOT EXISTS study_plans (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL,
  week_start    DATE NOT NULL,
  plan_json     JSONB NOT NULL,
  generated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_study_plans_user ON study_plans (user_id, week_start DESC);
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'study_plans' AND policyname = 'Users see own plans'
  ) THEN
    CREATE POLICY "Users see own plans" ON study_plans FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS plan_sessions (
  id            BIGSERIAL PRIMARY KEY,
  plan_id       BIGINT REFERENCES study_plans(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL,
  day_date      DATE NOT NULL,
  session_type  TEXT NOT NULL,
  topic         TEXT NOT NULL,
  subject       TEXT NOT NULL,
  minutes       INTEGER NOT NULL,
  completed     BOOLEAN DEFAULT FALSE,
  completed_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_plan_sessions_day ON plan_sessions (user_id, day_date);
ALTER TABLE plan_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'plan_sessions' AND policyname = 'Users see own sessions'
  ) THEN
    CREATE POLICY "Users see own sessions" ON plan_sessions FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
