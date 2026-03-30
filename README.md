# DLG Monorepo

Application web moderne de gestion de contenu musical (songs, tablatures), développée dans le cadre de la modernisation d’un ancien projet.

Ce projet a pour objectif de reconstruire une application existante sur des bases techniques solides en appliquant :

* une architecture hexagonale (DDD)
* TypeScript sur l’ensemble de la stack
* un développement incrémental et testé
* l’utilisation d’assistants IA dans le processus de développement

👉 Voir les décisions d’architecture dans le dossier [ADR](./adr)

---

## Contexte

Ce projet est une refonte complète d’une application développée lors de ma reconversion professionnelle.

L’objectif est de repartir d’une base propre, en appliquant les bonnes pratiques acquises depuis :

* architecture hexagonale
* séparation des responsabilités
* testabilité
* maintenabilité

👉 Ancien projet : https://github.com/P-Jeremy/MEAN-DLG-project

---

## Stack technique

| Couche               | Technologie                              |
| -------------------- | ---------------------------------------- |
| Frontend             | React 19 + Vite + TypeScript             |
| Backend              | Express 5 + TypeScript                   |
| Base de données      | MongoDB (Mongoose)                       |
| Tests                | Jest + Supertest + mongodb-memory-server |
| Workspaces           | npm workspaces                           |
| Déploiement Frontend | Vercel                                   |
| Déploiement Backend  | Render                                   |

---

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
├── adr/                     # Architecture Decision Records
├── package.json             # Racine — workspaces + scripts globaux
├── CLAUDE.md                # Conventions de développement
└── README.md                # Ce fichier
```

---

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

---

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

---

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

---

## Linting

```bash
# Vérifier les violations ESLint
npm run lint

# Corriger automatiquement
npm run lint:fix
```

---

## Architecture

### Principes

* **DDD** : Entités, Value Objects, Repository Pattern
* **Hexagonale** : Domain → Application → Infrastructure
* **Clean Code** : Noms explicites, pas de commentaires, fonctions petites et ciblées
* **Testing** : Tous les tests doivent passer avant chaque commit

👉 Voir [ADR 0001 - Architecture hexagonale](./adr/0001-architecture-hexagonale.md)

---

## Développement assisté par IA

Ce projet est développé avec l’aide d’assistants IA :

* Claude Code
* GitHub Copilot

Ces outils sont utilisés pour :

* accélérer le développement
* générer du code et des tests
* explorer des solutions techniques

Le code produit est systématiquement relu et validé.

👉 Voir [ADR 0004 - Utilisation de l’IA](./adr/0004-utilisation-ia.md)

---

## Déploiement

Le déploiement en production est déclenché manuellement via la GitHub Action :

👉 **Deploy to Production**

Le déclenchement manuel permet de découpler les releases des merges.

---

### Frontend (Vercel)

* Déployé via la GitHub Action "Deploy to Production"
* Build : `npm run build` depuis `frontend/`
* Hébergement sur Vercel

---

### Backend (Render)

* Déployé via la GitHub Action "Deploy to Production"
* Build : `npm run build` depuis `backend/`
* Hébergement sur Render
* Base de données : MongoDB Atlas

---

### Workflow

* Les changements sont mergés sur `main`
* Le déploiement en production est déclenché manuellement
* Permet de contrôler précisément les mises en production

---

## Workflow Git

Utiliser [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
feat(songs): add search by artist
fix(auth): handle expired token gracefully
test(songs): add unit tests for SongRepository
refactor(backend): extract value object for song title
```

Les commits peuvent être assistés par Copilot lors des PR.

---

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
