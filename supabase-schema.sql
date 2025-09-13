-- Création de la table des sites
CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
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

-- Création de la table des mots de passe maîtres
CREATE TABLE IF NOT EXISTS master_passwords (
  id TEXT PRIMARY KEY DEFAULT 'master',
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation de Row Level Security (RLS)
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_passwords ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'accès anonyme (pour l'instant)
-- En production, vous devriez implémenter une authentification appropriée
CREATE POLICY "Allow anonymous access to sites" ON sites
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to master_passwords" ON master_passwords
  FOR ALL USING (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at);
CREATE INDEX IF NOT EXISTS idx_sites_name ON sites(name);
CREATE INDEX IF NOT EXISTS idx_sites_address ON sites(address);
