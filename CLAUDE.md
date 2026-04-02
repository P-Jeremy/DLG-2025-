# CLAUDE.md

## Projet

Monorepo DLG — React + Express + TypeScript, déployé sur Vercel (frontend) et Render (backend).

- **Frontend** : React 19 + Vite + TypeScript + Sass (SCSS)
- **Backend** : Express 5 + TypeScript
- **Base de données** : MongoDB (Mongoose) — MongoDB Atlas en production
- **Temps-réel** : Socket.io (backend + frontend)
- **Upload fichiers** : AWS S3 (multer-s3)
- **PWA** : vite-plugin-pwa

## Architecture

### Backend — DDD + Architecture Hexagonale

Le backend suit une architecture hexagonale (ports & adapters) organisée en trois couches DDD :

- **Domain** — entités, value objects, services de domaine, interfaces de repository. Aucune dépendance vers l'infrastructure ou le framework.
- **Application** — cas d'usage (use cases). Orchestre les objets de domaine. Pas de code framework.
- **Infrastructure** — implémentations des repositories, base de données, adaptateurs externes, contrôleurs HTTP, routes Express.

> Les contrôleurs et routes Express appartiennent à **Infrastructure** (adapters entrants), pas à Application.

Ne jamais laisser des dépendances infrastructure fuiter vers le domaine ou l'application.

👉 Voir [ADR 0001 - Architecture hexagonale](./adr/0001-architecture-hexagonale.md)

## Qualité du code

### Clean Code

- Fonctions petites et ciblées, une seule responsabilité.
- Noms qui révèlent l'intention — pas d'abréviations, pas de noms génériques (`data`, `info`, `tmp`).
- Pas de magic numbers ni magic strings — utiliser des constantes nommées.
- Pas de code mort.

### Styles

Tous les styles sont en **SCSS** (`.scss`). Ne jamais utiliser de CSS pur ni de `style={{...}}` inline dans les composants React.

### Pas de commentaires

Les tests sont la documentation. Si du code nécessite un commentaire pour être compris, le réécrire jusqu'à ce qu'il soit auto-explicatif.

### Tests

Tout le code doit être testé. Les tests ne sont pas optionnels.

- Tester la logique de domaine et les services applicatifs en isolation.
- Tester en intégration les adaptateurs infrastructure (repositories, services externes).
- Les tests doivent être lisibles et servir de documentation vivante du comportement attendu.
- Suivre le pattern Arrange / Act / Assert.
- Ne jamais mocker le domaine — tester les vrais objets de domaine.
- Stack de test : Jest + Supertest + mongodb-memory-server.

```bash
# Commandes de référence
cd backend && npm test --forceExit
cd frontend && npm test -- --watchAll=false
```

## Git

### Conventional Commits

Tous les messages de commit doivent suivre la spécification [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>(<scope>): <description courte>
```

Types courants : `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`.

Exemples :
- `feat(songs): add search by artist`
- `fix(auth): handle expired token gracefully`
- `test(songs): add unit tests for SongRepository`
- `refactor(backend): extract value object for song title`

### Linting

```bash
npm run lint       # vérifier les violations
npm run lint:fix   # corriger automatiquement
```

## Versioning

Versioning simplifié `MAJOR.MINOR.PATCH` :

- **MAJOR** — changement cassant le fonctionnement réel (modification du flux d'auth, contrat frontend/backend rompu)
- **MINOR** — nouvelle fonctionnalité utilisateur
- **PATCH** — correction de bug, amélioration UI/UX, refactoring sans impact fonctionnel

> Les refactorings internes et suppressions de code mort ne changent pas la version.

👉 Voir [ADR 0002 - Stratégie de versioning](./adr/0002-strategie-versioning.md)

## Utilisation de l'IA

Claude Code et GitHub Copilot sont des outils de support, pas des décideurs.

- Le code généré est systématiquement relu et validé.
- Les décisions d'architecture restent humaines.
- L'IA accélère l'écriture, la génération de tests, et l'exploration de solutions.

👉 Voir [ADR 0004 - Utilisation de l'IA](./adr/0004-utilisation-ia.md)
