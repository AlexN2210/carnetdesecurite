-- Script de diagnostic basique pour les sites
-- A executer dans l'editeur SQL de Supabase

-- 1. Verifier si la table sites existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'sites'
        ) THEN 'Table sites existe'
        ELSE 'Table sites nexiste pas'
    END as table_status;

-- 2. Verifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'sites'
ORDER BY ordinal_position;

-- 3. Verifier les contraintes de cle etrangere
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'sites';

-- 4. Verifier les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'sites';

-- 5. Verifier si RLS est active
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'sites';

-- 6. Compter les sites existants
SELECT COUNT(*) as total_sites FROM sites;

-- 7. Verifier les types de user_id dans les donnees existantes
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'Aucune donnee'
        WHEN COUNT(*) = COUNT(CASE WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) THEN 'Tous les user_id sont des UUID valides'
        ELSE 'Certains user_id ne sont pas des UUID valides'
    END as uuid_validation
FROM sites;

-- 8. Resume du diagnostic
SELECT 
    'DIAGNOSTIC COMPLET' as section,
    'Verifiez les resultats ci-dessus' as message,
    'Si des erreurs apparaissent, executez fix-sites-simple.sql' as action;
