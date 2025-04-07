# Système d'Information pour Voyageurs de Bus

Application web permettant le suivi des bus en temps réel avec notifications d'arrivée.

## Fonctionnalités

### Interface Chauffeur
- Enregistrement du matricule et numéro de bus
- Géolocalisation automatique du bus
- Transmission des données à l'administration

### Interface Administrateur
- Visualisation des demandes de suivi
- Attribution des lignes aux chauffeurs
- Surveillance des positions des bus

### Interface Voyageur
- Affichage des bus approchant
- Alertes à 2 minutes d'arrivée
- Carte interactive avec position de la station

## Technologies Utilisées

- **Frontend**: HTML5, Tailwind CSS, JavaScript
- **Cartographie**: Leaflet.js (OpenStreetMap)
- **Backend**: Supabase (Base de données temps réel)
- **Hébergement**: Vercel

## Installation

1. Cloner le dépôt
2. Configurer Supabase:
   ```bash
   cp .env.example .env
   ```
3. Remplir les variables d'environnement
4. Démarrer l'application:
   ```bash
   npm install
   npm run dev
   ```

## Structure des Fichiers

```
public/
├── supabase.js       # Configuration Supabase
├── driver.html       # Interface chauffeur
├── driver.js         # Logique chauffeur
├── admin.html        # Interface admin
├── admin.js          # Logique admin
├── passenger.html    # Interface voyageur
└── passenger.js      # Logique voyageur
```

## Déploiement

1. Créer un compte Vercel
2. Connecter le dépôt GitHub
3. Configurer les variables d'environnement
4. Déployer

## Auteur
[Votre nom]

## Licence
MIT