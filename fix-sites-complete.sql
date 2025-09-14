-- Script de correction complète pour les sites
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Supprimer la table sites si elle existe (ATTENTION: supprime toutes les données)
DROP TABLE IF EXISTS sites CASCADE;

-- 2. Créer la table sites avec la structure correcte
CREATE TABLE sites (
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

-- 3. Activer Row Level Security
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- 4. Créer la politique RLS
CREATE POLICY "Users can only access their own sites" ON sites
    FOR ALL USING (auth.uid() = user_id);

-- 5. Créer les index pour améliorer les performances
CREATE INDEX idx_sites_user_id ON sites(user_id);
CREATE INDEX idx_sites_created_at ON sites(created_at);
CREATE INDEX idx_sites_name ON sites(name);
CREATE INDEX idx_sites_address ON sites(address);

-- 6. Vérifier la structure créée
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    CASE 
        WHEN data_type = 'uuid' AND column_name = 'user_id' THEN '✅ Correct'
        ELSE '❌ Incorrect'
    END as status
FROM information_schema.columns
WHERE table_name = 'sites'
ORDER BY ordinal_position;

-- 7. Vérifier que RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS activé'
        ELSE '❌ RLS désactivé'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'sites';

-- 8. Vérifier les politiques
SELECT 
    policyname,
    CASE 
        WHEN policyname IS NOT NULL THEN '✅ Politique créée'
        ELSE '❌ Pas de politique'
    END as policy_status
FROM pg_policies 
WHERE tablename = 'sites';

-- 9. Test d'insertion d'un site de test
-- (Remplacez l'UUID par un vrai UUID d'utilisateur pour tester)
/*
INSERT INTO sites (
    id, 
    user_id, 
    name, 
    address, 
    latitude,
    longitude,
    notes,
    access_means,
    has_alarm,
    alarm_code
) VALUES (
    'test_' || extract(epoch from now()),
    '00000000-0000-0000-0000-000000000000', -- Remplacez par un vrai UUID
    'Site de test',
    '123 Rue de Test, Paris',
    48.8566,
    2.3522,
    'Site de test après correction',
    '[{"id":"access_1","type":"key","description":"Clé principale","code":"1234","location":"Boîte à clés"}]',
    true,
    '1234'
) RETURNING id, name, user_id;
*/

-- 10. Message de confirmation
SELECT 
    'CORRECTION TERMINÉE' as status,
    'La table sites a été recréée avec la structure correcte' as message,
    'Vous pouvez maintenant tester la sauvegarde des sites' as next_step;
