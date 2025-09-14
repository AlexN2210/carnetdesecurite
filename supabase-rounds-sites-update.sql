-- Mise à jour du schéma pour associer les rondes aux sites
-- Ajouter une colonne site_id à la table rounds

-- Ajouter la colonne site_id à la table rounds
ALTER TABLE rounds 
ADD COLUMN IF NOT EXISTS site_id TEXT REFERENCES sites(id) ON DELETE SET NULL;

-- Ajouter un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_rounds_site_id ON rounds(site_id);

-- Ajouter une colonne pour le nom de la ronde (si pas déjà présent)
ALTER TABLE rounds 
ADD COLUMN IF NOT EXISTS round_name TEXT;

-- Mettre à jour les rondes existantes pour avoir un nom par défaut si vide
UPDATE rounds 
SET round_name = COALESCE(round_name, 'Ronde du ' || to_char(start_time, 'DD/MM/YYYY à HH24:MI'))
WHERE round_name IS NULL OR round_name = '';

-- Ajouter une colonne pour les notes de la ronde
ALTER TABLE rounds 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Ajouter une colonne pour marquer si la ronde est terminée
ALTER TABLE rounds 
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

-- Mettre à jour les rondes existantes pour marquer celles avec end_time comme terminées
UPDATE rounds 
SET is_completed = (end_time IS NOT NULL)
WHERE is_completed IS NULL;
