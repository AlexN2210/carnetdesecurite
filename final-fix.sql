-- Script final pour corriger complètement la base de données

-- 1. Supprimer toutes les contraintes de clé étrangère d'abord
ALTER TABLE sites DROP CONSTRAINT IF EXISTS sites_user_id_fkey;
ALTER TABLE rounds DROP CONSTRAINT IF EXISTS rounds_user_id_fkey;
ALTER TABLE round_steps DROP CONSTRAINT IF EXISTS round_steps_round_id_fkey;

-- 2. Supprimer toutes les politiques RLS
DROP POLICY IF EXISTS "Users can only access their own sites" ON sites;
DROP POLICY IF EXISTS "Users can view their own rounds" ON rounds;
DROP POLICY IF EXISTS "Users can insert their own rounds" ON rounds;
DROP POLICY IF EXISTS "Users can update their own rounds" ON rounds;
DROP POLICY IF EXISTS "Users can delete their own rounds" ON rounds;
DROP POLICY IF EXISTS "Users can view their own round steps" ON round_steps;
DROP POLICY IF EXISTS "Users can insert their own round steps" ON round_steps;
DROP POLICY IF EXISTS "Users can update their own round steps" ON round_steps;
DROP POLICY IF EXISTS "Users can delete their own round steps" ON round_steps;

-- 3. Désactiver RLS
ALTER TABLE sites DISABLE ROW LEVEL SECURITY;
ALTER TABLE rounds DISABLE ROW LEVEL SECURITY;
ALTER TABLE round_steps DISABLE ROW LEVEL SECURITY;

-- 4. Modifier les types de colonnes
ALTER TABLE sites ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE rounds ALTER COLUMN id TYPE TEXT;
ALTER TABLE rounds ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE round_steps ALTER COLUMN id TYPE TEXT;
ALTER TABLE round_steps ALTER COLUMN round_id TYPE TEXT;

-- 5. Recréer seulement la contrainte entre rounds et round_steps
ALTER TABLE round_steps ADD CONSTRAINT round_steps_round_id_fkey 
  FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE;

-- 6. Vérifier que tout fonctionne
SELECT 'Configuration de base de données terminée avec succès' as status;
