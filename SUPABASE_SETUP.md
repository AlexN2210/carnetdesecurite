# Configuration Supabase

## Étapes de configuration

### 1. Créer les tables dans Supabase

1. Connectez-vous à votre tableau de bord Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans l'onglet "SQL Editor"
4. Exécutez le script SQL contenu dans le fichier `supabase-schema.sql`

**Si vous avez déjà des données existantes :**
- Exécutez également le script `supabase-migration-coordinates.sql` pour ajouter les colonnes de coordonnées

### 2. Vérifier la configuration

Les clés Supabase sont déjà configurées dans le fichier `src/utils/supabase.ts` :
- URL : https://yqckzyubenfsjmopvtok.supabase.co
- Clé anonyme : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### 3. Structure des données

#### Table `sites`
- `id` : Identifiant unique du site
- `name` : Nom du site
- `address` : Adresse du site
- `latitude` : Latitude en degrés décimaux (WGS84) - optionnel
- `longitude` : Longitude en degrés décimaux (WGS84) - optionnel
- `notes` : Notes sur le site
- `access_means` : Moyens d'accès (JSON)
- `has_alarm` : Présence d'une alarme
- `alarm_code` : Code d'alarme
- `created_at` : Date de création
- `updated_at` : Date de mise à jour

#### Table `master_passwords`
- `id` : Identifiant (toujours 'master')
- `password` : Mot de passe maître encodé
- `created_at` : Date de création
- `updated_at` : Date de mise à jour

### 4. Sécurité

⚠️ **Important** : La configuration actuelle permet l'accès anonyme aux données. En production, vous devriez :

1. Implémenter l'authentification Supabase
2. Configurer des politiques RLS appropriées
3. Chiffrer les données sensibles côté client
4. Utiliser des clés API avec des permissions limitées

### 5. Migration depuis localStorage

L'application utilise maintenant Supabase au lieu du localStorage. Les données seront automatiquement synchronisées avec la base de données Supabase.

## Fonctionnalités

- ✅ Sauvegarde des sites dans Supabase
- ✅ **Sauvegarde des coordonnées géographiques précises**
- ✅ Gestion du mot de passe maître
- ✅ Synchronisation en temps réel
- ✅ Gestion des erreurs
- ✅ Interface utilisateur préservée
- ✅ **Navigation Waze avec coordonnées précises**
