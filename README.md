# DLG Monorepo

Monorepo pour le projet DLG — React + Express + TypeScript avec architecture hexagonale (DDD).

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Backend | Express 5 + TypeScript |
| Base de données | MongoDB (Mongoose) |
| Tests | Jest + Supertest + mongodb-memory-server |
| Workspaces | npm workspaces |
| Hébergement cible | Heroku / Railway |

## Structure

```
monorepo-dlg/
├── backend/
│   └── src/
│       ├── domain/          # Entités, value objects, interfaces repository
│       ├── application/     # Cas d'usage (use cases)
│       ├── infrastructure/  # Controllers, routes, repositories, DB
│       └── index.ts
├── frontend/
│   └── src/
│       ├── api/
│       └── components/
├── package.json             # Racine — workspaces + scripts globaux
└── CLAUDE.md                # Conventions de développement
```

## Démarrage

```bash
# Cloner et installer toutes les dépendances
git clone <url-du-repo>
cd monorepo-dlg
npm install

# Backend
cd backend
cp .env.example .env
npm run dev

# Frontend (dans un autre terminal)
cd frontend
npm run dev
```

## Configuration

Créer `backend/.env` :

```
PORT=3001
MONGO_URI=mongodb://localhost:27017/dlg
```

## Tests

```bash
# Tous les tests
npm run test:backend
npm run test:frontend

# Backend uniquement (depuis backend/)
npm test

# Frontend uniquement (depuis frontend/)
npm test
```

## Linting

```bash
npm run lint        # Vérifier
npm run lint:fix    # Corriger automatiquement
```

## Conventions

Voir [CLAUDE.md](./CLAUDE.md) pour les règles d'architecture, de code et de commits.

## Suivi des PRs

- PR #1 : `feat(songs): GET /songs — liste de chansons via API + affichage React`
