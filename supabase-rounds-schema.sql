-- Table pour les rondes de sécurité
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  total_steps INTEGER DEFAULT 0,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les étapes d'une ronde
CREATE TABLE IF NOT EXISTS round_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  action TEXT NOT NULL,
  direction TEXT,
  steps_count INTEGER NOT NULL,
  location TEXT,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_rounds_user_id ON rounds(user_id);
CREATE INDEX IF NOT EXISTS idx_rounds_start_time ON rounds(start_time);
CREATE INDEX IF NOT EXISTS idx_round_steps_round_id ON round_steps(round_id);
CREATE INDEX IF NOT EXISTS idx_round_steps_timestamp ON round_steps(timestamp);

-- RLS (Row Level Security) pour la sécurité
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_steps ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les rondes
CREATE POLICY "Users can view their own rounds" ON rounds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rounds" ON rounds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rounds" ON rounds
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rounds" ON rounds
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour les étapes de ronde
CREATE POLICY "Users can view their own round steps" ON round_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rounds 
      WHERE rounds.id = round_steps.round_id 
      AND rounds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own round steps" ON round_steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rounds 
      WHERE rounds.id = round_steps.round_id 
      AND rounds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own round steps" ON round_steps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rounds 
      WHERE rounds.id = round_steps.round_id 
      AND rounds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own round steps" ON round_steps
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rounds 
      WHERE rounds.id = round_steps.round_id 
      AND rounds.user_id = auth.uid()
    )
  );
