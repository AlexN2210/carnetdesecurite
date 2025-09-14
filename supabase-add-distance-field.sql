-- Migration pour ajouter le champ distance aux étapes de ronde
-- Ajouter le champ distance à la table round_steps

ALTER TABLE round_steps 
ADD COLUMN IF NOT EXISTS distance DECIMAL(10,2);

-- Commentaire pour documenter le champ
COMMENT ON COLUMN round_steps.distance IS 'Distance parcourue en mètres pour cette étape';

-- Index pour optimiser les requêtes sur la distance
CREATE INDEX IF NOT EXISTS idx_round_steps_distance ON round_steps(distance);
