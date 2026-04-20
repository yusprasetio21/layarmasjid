-- Run this SQL in Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS screens (
  id TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read screen config (for display)
CREATE POLICY "Screens are publicly readable" ON screens
  FOR SELECT USING (true);

-- Allow anyone to insert screens (for device registration)
CREATE POLICY "Anyone can register screens" ON screens
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update screens (using device ID as auth)
CREATE POLICY "Anyone can update screens" ON screens
  FOR UPDATE USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE screens;
