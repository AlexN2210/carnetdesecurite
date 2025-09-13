-- Création de la table des sites
CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Suppression de la table des mots de passe maîtres (remplacée par l'auth Supabase)
-- DROP TABLE IF EXISTS master_passwords;

-- Activation de Row Level Security (RLS)
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour la sécurité des données utilisateur
CREATE POLICY "Users can only access their own sites" ON sites
  FOR ALL USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at);
CREATE INDEX IF NOT EXISTS idx_sites_name ON sites(name);
CREATE INDEX IF NOT EXISTS idx_sites_address ON sites(address);
