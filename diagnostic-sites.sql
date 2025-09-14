-- Script de diagnostic complet pour les sites
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier si la table sites existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'sites'
        ) THEN 'Table sites existe'
        ELSE 'Table sites nexiste pas'
    END as table_status;

-- 2. Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN data_type = 'uuid' AND column_name = 'user_id' THEN 'Correct'
        WHEN data_type = 'text' AND column_name = 'user_id' THEN 'Incorrect (devrait etre UUID)'
        ELSE 'Info: ' || data_type
    END as status
FROM information_schema.columns
WHERE table_name = 'sites'
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes de clé étrangère
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    CASE 
        WHEN tc.constraint_name IS NOT NULL THEN 'Contrainte FK existe'
        ELSE 'Pas de contrainte FK'
    END as fk_status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'sites';

-- 4. Vérifier les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN policyname IS NOT NULL THEN 'Politique RLS existe'
        ELSE 'Pas de politique RLS'
    END as rls_status
FROM pg_policies 
WHERE tablename = 'sites';

-- 5. Vérifier si RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN 'RLS active'
        ELSE 'RLS desactive'
    END as rls_enabled
FROM pg_tables 
WHERE tablename = 'sites';

-- 6. Compter les sites existants
SELECT 
    COUNT(*) as total_sites,
    CASE 
        WHEN COUNT(*) > 0 THEN 'Sites existants'
        ELSE 'Aucun site'
    END as sites_status
FROM sites;

-- 7. Vérifier les types de user_id dans les données existantes
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'Aucune donnee'
        WHEN COUNT(*) = COUNT(CASE WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) THEN 'Tous les user_id sont des UUID valides'
        ELSE 'Certains user_id ne sont pas des UUID valides'
    END as uuid_validation
FROM sites;

-- 8. Test d'insertion d'un site de test (si pas d'utilisateur connecté)
-- Décommentez les lignes suivantes pour tester l'insertion
/*
INSERT INTO sites (
    id, 
    user_id, 
    name, 
    address, 
    notes, 
    created_at, 
    updated_at
) VALUES (
    'test_diagnostic_' || extract(epoch from now()),
    '00000000-0000-0000-0000-000000000000',
    'Site de test diagnostic',
    'Adresse de test',
    'Test de diagnostic',
    NOW(),
    NOW()
) RETURNING id, name;
*/

-- 9. Résumé du diagnostic
SELECT 
    'DIAGNOSTIC COMPLET' as section,
    'Vérifiez les résultats ci-dessus' as message,
    'Si des erreurs apparaissent, exécutez fix-user-id-type.sql' as action;
