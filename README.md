# GiftLedger

A personal ledger for tracking monetary gifts at events — weddings, bar
mitzvahs, brit, birthdays. It records the money you **gave** and **received**,
detects per-person reciprocity, and offers filtering and summary statistics.

This is a learning + portfolio project: clean, layered architecture and
readable code are the priority.

## Tech Stack

- **Python 3.12**
- **FastAPI** — HTTP API
- **PostgreSQL** — database
- **SQLAlchemy + Alembic** — ORM and migrations
- **Pydantic** — request/response validation
- **Docker + docker-compose** — containerised runtime
- **pytest** — tests

## Running the app

The only prerequisite is Docker.

```bash
# Copy the example env and adjust if you like (defaults work out of the box)
cp .env.example .env

# Build and start Postgres + the API
docker compose up --build
```

The API is then available at **http://localhost:8000**, with interactive
Swagger docs at **http://localhost:8000/docs**.

### Database migrations

The schema is managed by Alembic. Apply the latest migrations against the
running database with:

```bash
docker compose run --rm api alembic upgrade head
```

## Running the tests

Tests use an isolated in-memory SQLite database (no Postgres required) via a
FastAPI dependency override, so they are fully repeatable:

```bash
docker compose run --rm api sh -c "pip install -q -r requirements-dev.txt && pytest -q"
```

## API overview

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness + DB connectivity check |
| `GET/POST` | `/persons` | List / create persons |
| `GET/PUT/DELETE` | `/persons/{id}` | Read / update / delete a person |
| `GET` | `/persons/{id}/reciprocity` | Given / received / balance for one person |
| `GET/POST` | `/events` | List / create events |
| `GET/PUT/DELETE` | `/events/{id}` | Read / update / delete an event |
| `GET/POST` | `/transactions` | List (filterable) / create transactions |
| `GET/PUT/DELETE` | `/transactions/{id}` | Read / update / delete a transaction |
| `GET` | `/stats/summary` | Totals: given, received, net |

### Transaction filters

`GET /transactions` accepts optional query params, combined with **AND**:

`direction`, `person_id`, `event_id`, `date_from`, `date_to`,
`min_amount`, `max_amount`.

Example:

```
GET /transactions?direction=given&min_amount=100&date_from=2026-07-01
```

## Architecture

A strict layered architecture; each layer only knows the one directly below it:

```
API (router)  ->  Service (business logic)  ->  Repository (DB access)  ->  Database
```

- `app/api/` — FastAPI routers. HTTP only, no business logic.
- `app/services/` — business logic (reciprocity, summaries, validation rules).
- `app/repositories/` — database access only.
- `app/models/` — SQLAlchemy models.
- `app/schemas/` — Pydantic request/response schemas.
- `app/core/` — configuration and the database session.
- `migrations/` — Alembic migrations.
- `tests/` — pytest suite.

### Data model

A single `transactions` table carries a `direction` field (`given` /
`received`) and references `persons` and `events`. Keeping given and received
in one table is deliberate: reciprocity stays a single SQL query
(`SUM(amount) GROUP BY direction`) rather than a join across two tables.
