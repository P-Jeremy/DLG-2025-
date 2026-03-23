# CLAUDE.md

## Projet

Monorepo DLG — React + Express + TypeScript, hébergé sur Heroku/Railway.

- **Frontend** : React + Vite + TypeScript
- **Backend** : Express + TypeScript
- **Workspaces** : npm workspaces à la racine

## Architecture

### Backend — DDD + Architecture Hexagonale

Le backend suit une architecture hexagonale (ports & adapters) organisée en trois couches DDD :

- **Domain** — entités, value objects, services de domaine, interfaces de repository. Aucune dépendance vers l'infrastructure ou le framework.
- **Application** — cas d'usage (use cases). Orchestre les objets de domaine. Pas de code framework.
- **Infrastructure** — implémentations des repositories, base de données, adaptateurs externes, contrôleurs HTTP, routes Express.

> Les contrôleurs et routes Express appartiennent à **Infrastructure** (adapters entrants), pas à Application.

Ne jamais laisser des dépendances infrastructure fuiter vers le domaine ou l'application.

## Code Quality

### Clean Code

- Small, focused functions with a single responsibility.
- Meaningful names that reveal intent — no abbreviations, no generic names (`data`, `info`, `tmp`).
- No magic numbers or magic strings — use named constants.
- No dead code.

### No Comments

Tests are the documentation. If code needs a comment to be understood, rewrite the code until it is self-explanatory.

### Testing

All code must be tested. Tests are not optional.

- Unit-test domain logic and application services in isolation.
- Integration-test infrastructure adapters (repositories, external services).
- Tests must be readable and serve as living documentation of the intended behaviour.
- Follow the Arrange / Act / Assert pattern.
- No mocking of the domain — test real domain objects.

## Git

### Conventional Commits

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>
```

Common types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`.

Examples:
- `feat(songs): add search by artist`
- `fix(auth): handle expired token gracefully`
- `test(songs): add unit tests for SongRepository`
- `refactor(backend): extract value object for song title`
