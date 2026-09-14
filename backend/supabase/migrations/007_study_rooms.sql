-- Migration 007: Collaborative Study Rooms schema and RLS
CREATE TABLE IF NOT EXISTS room_chat (
  id          BIGSERIAL PRIMARY KEY,
  room_code   TEXT NOT NULL,
  user_id     UUID,
  nickname    TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_ai       BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_chat_code ON room_chat (room_code, created_at);
ALTER TABLE room_chat ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'room_chat' AND policyname = 'Room chat access'
  ) THEN
    CREATE POLICY "Room chat access" ON room_chat FOR ALL USING (true);
  END IF;
END $$;
