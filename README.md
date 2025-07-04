DLG 2025 Monorepo

Monorepo pour le projet DLG (anciennement MEAN), désormais en React + Express avec TypeScript et une architecture hexagonale.

Stack technique

- Monorepo avec npm workspaces
- Frontend : React + Vite + TypeScript
- Backend : Express + TypeScript
- Architecture : hexagonale (application, domain, infrastructure)
- Tests : prévus (unitaires, intégration, acceptance)
- Hébergement cible : Heroku
- .env centralisé

Structure

monorepo-dlg/
├── backend/
│ ├── src/
│ │ └── index.ts
│ ├── tsconfig.json
│ ├── package.json
│ └── .env.example
├── frontend/
│ └── (généré avec Vite React + TS)
├── .gitignore
├── README.md
├── package.json (racine)
└── tsconfig.json (partagé)

Démarrage

# Cloner le repo et se placer à la racine

git clone <url-du-repo>
cd monorepo-dlg

# Installer toutes les dépendances

npm install

Lancer les serveurs

# Backend

cd backend
cp .env.example .env
npm run dev

# Frontend (dans un autre terminal)

cd frontend
npm run dev

Configuration de l'environnement

Créer un fichier .env dans backend/ :

PORT=3001

Objectifs & méthodologie

- Travail incrémental, via petites PR (feat:, chore:, fix:...)
- Respect de l’architecture hexagonale :
  - Application : routes, contrôleurs
  - Domaine : modèles, cas d’usage, services
  - Infrastructure : base de données, adaptateurs, repos
- Tests à tous les niveaux :
  - Unitaires : logique pure
  - Intégration : requêtes HTTP vers l’API
  - Acceptance : interactions bout en bout

Suivi des PRs

- PR #1 : feat: GET /songs → retour d’une liste de chansons côté API + affichage côté React
- …

À venir

- Intégration base de données (Mongo ou autre)
- Routing frontend (React Router)
- Authentification (JWT)
- Déploiement Heroku / Railway
