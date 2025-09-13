# Fonctionnalité de Recherche d'Adresse avec Waze

## 🎯 Nouvelle fonctionnalité ajoutée

Votre application Carnet de Sécurité dispose maintenant d'une fonctionnalité de recherche d'adresse avancée avec intégration Waze !

## ✨ Fonctionnalités

### 🔍 Recherche d'adresse intelligente
- **Recherche en temps réel** : Tapez au moins 3 caractères pour voir les suggestions
- **Géocodage automatique** : Utilise l'API OpenStreetMap Nominatim
- **Filtrage France** : Recherche optimisée pour les adresses françaises
- **Navigation au clavier** : Utilisez les flèches ↑↓ et Entrée pour naviguer
- **Sélection facile** : Cliquez ou appuyez sur Entrée pour sélectionner

### 🗺️ Intégration Waze
- **Bouton Waze dans le formulaire** : Apparaît dès qu'une adresse est saisie
- **Bouton Waze sur les cartes** : Chaque site a son bouton Waze
- **Navigation directe** : Ouvre Waze avec l'itinéraire pré-rempli
- **Fallback intelligent** : Utilise les coordonnées précises si disponibles, sinon recherche par adresse

## 🚀 Comment utiliser

### 1. Ajouter un nouveau site
1. Cliquez sur le bouton **"Nouveau site"** (+)
2. Dans le champ **"Adresse"**, commencez à taper une adresse
3. Sélectionnez l'adresse dans la liste déroulante
4. Cliquez sur **"Ouvrir dans Waze"** pour vérifier l'emplacement
5. Complétez les autres informations et sauvegardez

### 2. Consulter un site existant
1. Sur chaque carte de site, vous verrez un bouton **"Waze"** vert
2. Cliquez dessus pour ouvrir directement l'itinéraire dans Waze

## 🛠️ Détails techniques

### API utilisée
- **OpenStreetMap Nominatim** : Service de géocodage gratuit et open-source
- **Limite de 5 résultats** : Pour une interface claire
- **Debounce de 300ms** : Évite les requêtes excessives

### Sécurité et confidentialité
- ✅ Aucune donnée personnelle envoyée
- ✅ Requêtes HTTPS sécurisées
- ✅ Pas de stockage des recherches
- ✅ API publique et gratuite

### Compatibilité
- ✅ Fonctionne sur tous les navigateurs modernes
- ✅ Responsive design
- ✅ Accessibilité clavier complète

## 🎨 Interface utilisateur

### Dans le formulaire d'ajout
- Champ de recherche avec icône de loupe
- Liste déroulante avec suggestions
- Bouton Waze vert qui apparaît dynamiquement
- Indicateur de chargement pendant la recherche

### Sur les cartes de sites
- Bouton Waze compact et discret
- Icône de navigation claire
- Couleur verte distinctive de Waze

## 🔧 Configuration

Aucune configuration supplémentaire n'est nécessaire ! La fonctionnalité est prête à l'emploi.

### Personnalisation possible
Si vous souhaitez modifier le comportement :
- **Changer l'API** : Modifiez l'URL dans `AddressSearch.tsx`
- **Modifier le pays** : Changez le paramètre `countrycodes=fr`
- **Ajuster le nombre de résultats** : Modifiez la valeur `limit=5`

## 🚨 Notes importantes

1. **Connexion internet requise** : La recherche d'adresse nécessite une connexion
2. **API gratuite** : OpenStreetMap Nominatim est gratuit mais a des limites d'usage
3. **Waze requis** : Le bouton Waze ouvre l'application Waze (doit être installée)
4. **Fallback** : Si Waze n'est pas installé, le navigateur proposera d'ouvrir l'application

## 🎉 Résultat

Vous pouvez maintenant :
- ✅ Rechercher des adresses facilement
- ✅ Obtenir des coordonnées précises
- ✅ Ouvrir directement des itinéraires Waze
- ✅ Gagner du temps lors de l'ajout de sites
- ✅ Naviguer rapidement vers vos sites de sécurité

La fonctionnalité est entièrement intégrée et prête à l'emploi ! 🚀
