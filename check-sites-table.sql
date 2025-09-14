-- Script de vérification et création de la table sites
-- À exécuter dans l'éditeur SQL de Supabase

-- Vérifier si la table sites existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'sites'
);

-- Si la table n'existe pas, la créer
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

-- Si la table existe déjà avec user_id en TEXT, la corriger
DO $$ 
BEGIN
  -- Vérifier si la colonne user_id existe et est de type TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sites' 
    AND column_name = 'user_id' 
    AND data_type = 'text'
  ) THEN
    -- Supprimer la contrainte de clé étrangère existante
    ALTER TABLE sites DROP CONSTRAINT IF EXISTS sites_user_id_fkey;
    
    -- Changer le type de user_id de TEXT vers UUID
    ALTER TABLE sites ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    
    -- Recréer la contrainte de clé étrangère
    ALTER TABLE sites ADD CONSTRAINT sites_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      
    RAISE NOTICE 'Colonne user_id convertie de TEXT vers UUID';
  END IF;
END $$;

-- Vérifier la structure de la table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sites'
ORDER BY ordinal_position;

-- Activer RLS si ce n'est pas déjà fait
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques s'il y en a
DROP POLICY IF EXISTS "Users can only access their own sites" ON sites;

-- Créer la politique RLS
CREATE POLICY "Users can only access their own sites" ON sites
  FOR ALL USING (auth.uid() = user_id);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at);
CREATE INDEX IF NOT EXISTS idx_sites_name ON sites(name);
CREATE INDEX IF NOT EXISTS idx_sites_address ON sites(address);

-- Tester l'insertion d'un site de test (remplacer l'UUID par un vrai)
-- INSERT INTO sites (id, user_id, name, address, notes, created_at, updated_at)
-- VALUES ('test_123', '00000000-0000-0000-0000-000000000000', 'Site Test', 'Adresse Test', 'Notes test', NOW(), NOW());

-- Vérifier les données existantes
SELECT COUNT(*) as total_sites FROM sites;
SELECT * FROM sites LIMIT 5;
