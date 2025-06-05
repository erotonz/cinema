# Système de Réservation de Cinéma

Ce projet est une application web de réservation de cinéma avec des fonctionnalités pour les administrateurs, les organisateurs et les utilisateurs.

## Prérequis

- Node.js (version 14 ou supérieure)
- MongoDB
- npm ou yarn

## Installation

### 1. Cloner le repository
```bash
git clone [URL_DE_VOTRE_REPO]
cd [NOM_DU_DOSSIER]
```

### 2. Configuration du Backend
```bash
cd backend
npm install
npm install node-schedule  # Installation explicite de node-schedule
```

### 3. Configuration du Frontend
```bash
cd frontend
npm install --legacy-peer-deps  # Important pour éviter les conflits de dépendances
```

### 4. Configuration des Variables d'Environnement

Créez un fichier `.env` dans le dossier `backend` avec les variables suivantes :
```
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt
PORT=5001
```

## Démarrage de l'Application

### Démarrer le Backend
```bash
cd backend
npm start
```
Le serveur backend démarrera sur http://localhost:5001

### Démarrer le Frontend
```bash
cd frontend
npm start
```
L'application frontend démarrera sur http://localhost:3000

## Fonctionnalités

- Réservation de billets de cinéma
- Gestion des films et des séances
- Interface administrateur pour la gestion des utilisateurs et des films
- Interface organisateur pour la gestion des réservations
- Scanner de QR code pour la validation des billets
- Système de notifications

## Structure du Projet

```
├── backend/           # Serveur Node.js/Express
├── frontend/         # Application React
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/      # Pages de l'application
│   │   ├── services/   # Services API
│   │   └── styles/     # Fichiers CSS
└── public/           # Fichiers statiques
```

## Technologies Utilisées

- Frontend:
  - React
  - Material-UI
  - TypeScript
  - Axios

- Backend:
  - Node.js
  - Express
  - MongoDB
  - Mongoose
  - JWT pour l'authentification
  - node-schedule pour les notifications

## Résolution des Problèmes Courants

1. **Erreurs de dépendances**:
   - Utilisez `npm install --legacy-peer-deps` pour le frontend
   - Assurez-vous d'installer `node-schedule` dans le backend

2. **Problèmes de connexion MongoDB**:
   - Vérifiez que MongoDB est en cours d'exécution
   - Vérifiez les variables d'environnement dans le fichier `.env`

3. **Erreurs de compilation TypeScript**:
   - Exécutez `npm install` dans le dossier frontend
   - Vérifiez les versions des dépendances dans package.json

## Contribution

1. Fork le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request 