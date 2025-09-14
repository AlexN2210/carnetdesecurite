-- Script de test avec l'utilisateur actuellement connecte
-- A executer dans l'editeur SQL de Supabase

-- 1. Verifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'sites'
ORDER BY ordinal_position;

-- 2. Verifier que RLS est active
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'sites';

-- 3. Verifier les politiques
SELECT 
    policyname
FROM pg_policies 
WHERE tablename = 'sites';

-- 4. Compter les sites existants
SELECT COUNT(*) as total_sites FROM sites;

-- 5. Obtenir l'utilisateur actuellement connecte
SELECT auth.uid() as current_user_id;

-- 6. Test d'insertion avec l'utilisateur actuellement connecte
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
    auth.uid(), -- Utilise l'utilisateur actuellement connecte
    'Site de test',
    '123 Rue de Test, Paris',
    48.8566,
    2.3522,
    'Site de test apres correction',
    '[{"id":"access_1","type":"key","description":"Cle principale","code":"1234","location":"Boite a cles"}]',
    true,
    '1234'
) RETURNING id, name, user_id;

-- 7. Verifier que le site a ete cree
SELECT COUNT(*) as total_sites_apres_test FROM sites;
