-- Script pour recréer les tables avec les bons types

-- 1. Supprimer les tables existantes (ATTENTION: cela supprime toutes les données)
DROP TABLE IF EXISTS round_steps CASCADE;
DROP TABLE IF EXISTS rounds CASCADE;
DROP TABLE IF EXISTS sites CASCADE;

-- 2. Recréer la table sites avec les bons types
CREATE TABLE sites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  notes TEXT,
  access_means JSONB,
  has_alarm BOOLEAN DEFAULT FALSE,
  alarm_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Recréer la table rounds avec les bons types
CREATE TABLE rounds (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  total_steps INTEGER DEFAULT 0,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Recréer la table round_steps avec les bons types
CREATE TABLE round_steps (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  action TEXT NOT NULL,
  direction TEXT,
  steps_count INTEGER NOT NULL,
  location TEXT,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at);
CREATE INDEX IF NOT EXISTS idx_rounds_user_id ON rounds(user_id);
CREATE INDEX IF NOT EXISTS idx_rounds_start_time ON rounds(start_time);
CREATE INDEX IF NOT EXISTS idx_round_steps_round_id ON round_steps(round_id);
CREATE INDEX IF NOT EXISTS idx_round_steps_timestamp ON round_steps(timestamp);

-- 6. RLS désactivé pour les tests (optionnel)
-- ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE round_steps ENABLE ROW LEVEL SECURITY;

-- 7. Vérifier que les tables sont créées
SELECT 'Tables recréées avec succès' as status;
