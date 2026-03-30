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
| Déploiement Frontend | Vercel |
| Déploiement Backend | Render |

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
│       ├── components/
│       ├── contexts/
│       ├── pages/
│       └── layouts/
├── package.json             # Racine — workspaces + scripts globaux
├── CLAUDE.md                # Conventions de développement
└── README.md                # Ce fichier
```

## Démarrage local

```bash
# Cloner et installer toutes les dépendances
git clone <url-du-repo>
cd monorepo-dlg
npm install

# Backend (terminal 1)
cd backend
cp .env.example .env
npm run dev

# Frontend (terminal 2)
cd frontend
npm run dev
```

## Configuration

### Backend — `backend/.env`

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/dlg
NODE_ENV=development
```

### Frontend — `frontend/.env` (optionnel)

```env
VITE_API_URL=http://localhost:3001
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
# Vérifier les violations ESLint
npm run lint

# Corriger automatiquement
npm run lint:fix
```

## Architecture

### Principes

- **DDD** : Entités, Value Objects, Repository Pattern
- **Hexagonale** : Domain → Application → Infrastructure
- **Clean Code** : Noms explicites, pas de commentaires, fonctions petites et ciblées
- **Testing** : Tous les tests doivent passer avant chaque commit

Détails complets dans [CLAUDE.md](./CLAUDE.md).

## Déploiement

### Frontend (Vercel)

- Déploiement automatique sur chaque push vers `main`
- Build : `npm run build` depuis `frontend/`
- Preview sur branches

### Backend (Render)

- Déploiement automatique sur chaque push vers `main`
- Build : `npm run build` depuis `backend/`
- Base de données : MongoDB Atlas

## Workflow Git

Utiliser [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
feat(songs): add search by artist
fix(auth): handle expired token gracefully
test(songs): add unit tests for SongRepository
refactor(backend): extract value object for song title
```

Les commits sont signés par Copilot lors des PR.

## Troubleshooting

**MongoDB refuse la connexion locale :**
```bash
brew services start mongodb-community
```

**Port 3001 ou 5173 déjà utilisé :**
```bash
lsof -i :3001
lsof -i :5173
kill -9 <PID>
```

**Les tests échouent :**
```bash
# Réinstaller les dépendances
npm run clean
npm install
npm test
```
