# Contributing to SETU AI

SETU AI is developed as an open-standard Digital Public Good (DPG) connecting citizen voices with sovereign infrastructure capital allocation across BRICS nations.

## Conventional Commits

We adhere strictly to the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification:

- `feat(scope)`: A new feature for the user or platform (e.g. `feat(api): add public open data hotspot endpoint`)
- `fix(scope)`: A bug fix (e.g. `fix(clustering): normalize geospatial coordinates in HDBSCAN`)
- `docs(scope)`: Documentation changes (e.g. `docs(setup): document native PostgreSQL installation`)
- `style(scope)`: Code formatting or CSS adjustments without logic changes
- `refactor(scope)`: Code refactoring without fixing a bug or adding a feature
- `test(scope)`: Adding missing tests or correcting existing tests
- `chore(scope)`: Build tasks, package updates, CI/CD configuration

### Scopes
- `auth`: Authentication and role-based access control
- `citizen`: Citizen-facing intake and tracking
- `official`: Regional official dashboard and triage
- `admin`: National commission, leaderboard, and impact tracker
- `ai_service`: STT, NLU, clustering, scoring, and RAG modules
- `api`: FastAPI route handlers and schemas
- `ingest`: Multi-channel ingestion adapters (WhatsApp, SMS, Web)

## Development Workflow

1. Fork or branch from `main`
2. Ensure backend tests pass: `pytest backend/tests`
3. Ensure frontend builds cleanly: `cd frontend && npm run build`
4. Submit PR with detailed description and test verification notes.
