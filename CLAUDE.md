# CLAUDE.md — event-gift-tracker (GiftLedger)

## Project Overview
GiftLedger is a personal ledger for tracking monetary gifts at events
(weddings, bar mitzvahs, brit, birthdays). It records money the user **gave**
and **received**, detects reciprocity per person, and provides filtering and
statistics.

This is a learning + portfolio project. Clean architecture and readable code
matter more than shipping speed.

## Tech Stack
- Language: Python 3.12
- API framework: FastAPI
- Database: PostgreSQL
- ORM + migrations: SQLAlchemy + Alembic
- Validation: Pydantic
- Containerization: Docker + docker-compose
- Tests: pytest

## Architecture
Layered architecture. Request flow:
`API (router) -> Service (business logic) -> Repository (DB access) -> Database`.
Each layer only knows the layer directly below it.

Folder layout:
- `app/api/`          — FastAPI routers (HTTP only, no business logic)
- `app/services/`     — business logic (reciprocity, summaries)
- `app/repositories/` — DB access only
- `app/models/`       — SQLAlchemy models
- `app/schemas/`      — Pydantic request/response schemas
- `app/core/`         — config and database session
- `migrations/`       — Alembic
- `tests/`            — pytest

## Data Model
Single `transactions` table with a `direction` field (`given` | `received`),
plus `persons` and `events` tables. Do NOT split given/received into two
tables — reciprocity must stay a single query.

## Commands
- Run app:   `docker compose up`
- Run tests: `pytest`
(Update these once the scaffold exists.)

## Coding Standards
- Type hints on every function.
- Pydantic schemas for every request and response.
- No business logic inside routers.
- Comments explain WHY, not WHAT.

## Git Workflow (IMPORTANT)
- Commit ONLY at the end of a completed roadmap phase — never after every
  small change. Aim for a small number of meaningful commits, not dozens.
- Use clear Conventional Commit messages in English, e.g.
  `chore: scaffold docker + fastapi`, `feat: add persons CRUD endpoints`.
- After finishing a phase, push to `origin main`.
- This repo is PUBLIC — keep the history clean and professional.

## Immutable Rules
- NEVER commit secrets: `.env`, API keys, DB credentials. Keep them in `.env`
  (which is gitignored). Commit only `.env.example` with placeholder values.
- NEVER commit generated artifacts (`__pycache__/`, `venv/`, `.pytest_cache/`).
- Ask before deleting files or changing the data model.
