-- Script pour corriger l'authentification Supabase

-- 1. Supprimer toutes les politiques RLS d'abord
DROP POLICY IF EXISTS "Users can only access their own sites" ON sites;
DROP POLICY IF EXISTS "Users can view their own rounds" ON rounds;
DROP POLICY IF EXISTS "Users can insert their own rounds" ON rounds;
DROP POLICY IF EXISTS "Users can update their own rounds" ON rounds;
DROP POLICY IF EXISTS "Users can delete their own rounds" ON rounds;
DROP POLICY IF EXISTS "Users can view their own round steps" ON round_steps;
DROP POLICY IF EXISTS "Users can insert their own round steps" ON round_steps;
DROP POLICY IF EXISTS "Users can update their own round steps" ON round_steps;
DROP POLICY IF EXISTS "Users can delete their own round steps" ON round_steps;

-- 2. Désactiver RLS temporairement
ALTER TABLE sites DISABLE ROW LEVEL SECURITY;
ALTER TABLE rounds DISABLE ROW LEVEL SECURITY;
ALTER TABLE round_steps DISABLE ROW LEVEL SECURITY;

-- 3. Supprimer les contraintes de clé étrangère
ALTER TABLE round_steps DROP CONSTRAINT IF EXISTS round_steps_round_id_fkey;

-- 4. Modifier les types de colonnes
ALTER TABLE sites ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE rounds ALTER COLUMN id TYPE TEXT;
ALTER TABLE rounds ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE round_steps ALTER COLUMN id TYPE TEXT;
ALTER TABLE round_steps ALTER COLUMN round_id TYPE TEXT;

-- 5. Recréer les contraintes de clé étrangère
ALTER TABLE round_steps ADD CONSTRAINT round_steps_round_id_fkey 
  FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE;

-- 6. Réactiver RLS (optionnel pour les tests)
-- ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE round_steps ENABLE ROW LEVEL SECURITY;

-- 7. Recréer les politiques RLS (optionnel pour les tests)
-- CREATE POLICY "Users can only access their own sites" ON sites
--   FOR ALL USING (auth.uid() = user_id);

-- 8. Vérifier que les tables sont accessibles
SELECT 'Configuration de base de données terminée' as status;
