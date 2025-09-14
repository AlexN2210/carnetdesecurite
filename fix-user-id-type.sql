-- Script de correction du type user_id dans la table sites
-- À exécuter dans l'éditeur SQL de Supabase

-- Vérifier le type actuel de la colonne user_id
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sites' AND column_name = 'user_id';

-- Si user_id est de type TEXT, le convertir en UUID
DO $$ 
BEGIN
  -- Vérifier si la colonne user_id existe et est de type TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sites' 
    AND column_name = 'user_id' 
    AND data_type = 'text'
  ) THEN
    RAISE NOTICE 'Conversion de user_id de TEXT vers UUID...';
    
    -- Supprimer la contrainte de clé étrangère existante
    ALTER TABLE sites DROP CONSTRAINT IF EXISTS sites_user_id_fkey;
    
    -- Changer le type de user_id de TEXT vers UUID
    ALTER TABLE sites ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    
    -- Recréer la contrainte de clé étrangère
    ALTER TABLE sites ADD CONSTRAINT sites_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      
    RAISE NOTICE 'Conversion terminée avec succès';
  ELSE
    RAISE NOTICE 'La colonne user_id est déjà de type UUID ou n''existe pas';
  END IF;
END $$;

-- Vérifier le type après conversion
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sites' AND column_name = 'user_id';

-- Tester la politique RLS
SELECT 'Test de la politique RLS' as test;
SELECT COUNT(*) as total_sites FROM sites;
