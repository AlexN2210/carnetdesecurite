-- Script de correction simple pour les sites
-- A executer dans l'editeur SQL de Supabase

-- 1. Supprimer la table sites si elle existe (ATTENTION: supprime toutes les donnees)
DROP TABLE IF EXISTS sites CASCADE;

-- 2. Creer la table sites avec la structure correcte
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

-- 4. Creer la politique RLS
CREATE POLICY "Users can only access their own sites" ON sites
    FOR ALL USING (auth.uid() = user_id);

-- 5. Creer les index pour ameliorer les performances
CREATE INDEX idx_sites_user_id ON sites(user_id);
CREATE INDEX idx_sites_created_at ON sites(created_at);
CREATE INDEX idx_sites_name ON sites(name);
CREATE INDEX idx_sites_address ON sites(address);

-- 6. Verifier la structure creee
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'sites'
ORDER BY ordinal_position;

-- 7. Verifier que RLS est active
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'sites';

-- 8. Verifier les politiques
SELECT 
    policyname
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
    'Site de test apres correction',
    '[{"id":"access_1","type":"key","description":"Cle principale","code":"1234","location":"Boite a cles"}]',
    true,
    '1234'
) RETURNING id, name, user_id;
*/

-- 10. Message de confirmation
SELECT 
    'CORRECTION TERMINEE' as status,
    'La table sites a ete recreee avec la structure correcte' as message,
    'Vous pouvez maintenant tester la sauvegarde des sites' as next_step;
