-- Migration pour ajouter les colonnes de coordonnées géographiques
-- Exécuter ce script si vous avez déjà des données dans votre base

-- Ajouter les colonnes de coordonnées si elles n'existent pas
DO $$ 
BEGIN
    -- Vérifier si la colonne latitude existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sites' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE sites ADD COLUMN latitude DECIMAL(10, 8);
    END IF;
    
    -- Vérifier si la colonne longitude existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sites' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE sites ADD COLUMN longitude DECIMAL(11, 8);
    END IF;
END $$;

-- Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN sites.latitude IS 'Latitude en degrés décimaux (WGS84)';
COMMENT ON COLUMN sites.longitude IS 'Longitude en degrés décimaux (WGS84)';

-- Créer un index pour améliorer les performances des requêtes géographiques
CREATE INDEX IF NOT EXISTS idx_sites_coordinates ON sites(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Migration des coordonnées géographiques terminée avec succès!';
    RAISE NOTICE 'Colonnes ajoutées: latitude, longitude';
    RAISE NOTICE 'Index créé: idx_sites_coordinates';
END $$;
