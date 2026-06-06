# GiftLedger · יומן מתנות

A multi-user, Hebrew / RTL ledger for tracking the monetary gifts you **gave**
and **received** at events — weddings, bar mitzvahs, brit, birthdays. It detects
per-person **reciprocity**, surfaces **statistics with charts**, and signs you in
with **Google** so every person's data is fully isolated.

**▶ Live demo: https://giftledger-web.onrender.com**

> Sign in with Google to get your own private ledger. The demo runs on Render's
> free tier, so the very first request after idle may take ~50s while the backend
> wakes — the login screen pre-warms it and shows progress.

![GiftLedger — home screen](docs/screenshots/home-dark.png)

This is a portfolio project: clean, layered architecture and readable code are
the priority.

---

## Features

- **Google sign-in + per-user isolation** — Google OAuth verifies your identity;
  the API issues its own JWT, and every row is scoped to your `owner_id`, so
  users only ever see their own events, people and gifts.
- **Quick-add flow** — log a gift in one form: pick or create the event and the
  person and record the amount in a single atomic request.
- **Fast per-event bulk entry** — inside an event, the add-row keeps a sticky
  direction (and defaults to *received* for your own event), so adding many
  guests is just name + amount.
- **Events, people & reciprocity** — drill into any event or person; each person
  view shows given / received / balance at a glance.
- **Statistics with charts** — totals, averages, biggest gift, breakdown by event
  type and top people, visualised with `recharts` (lazy-loaded).
- **Given / received tabs** — a transactions view with a segmented control to
  filter by direction, each with its own total.
- **Delete with confirmation** — themed confirm dialog; deleting an event or
  person cascades to its gifts.
- **Polished UX** — dark / light themes, full RTL, keyboard-accessible focus
  rings, WCAG-AA contrast, and subtle entrance / count-up animations that respect
  `prefers-reduced-motion`.

## צילומי מסך · Screenshots

Captured against a demo dataset (Hebrew names; חתונה / ברית / בר מצווה / יום
הולדת events with both given and received gifts). Every screen ships in **dark
and light**, fully RTL.

| | Dark | Light |
| --- | --- | --- |
| **דף הבית** · Home — balance, quick-add & events | ![Home (dark)](docs/screenshots/home-dark.png) | ![Home (light)](docs/screenshots/home-light.png) |
| **תנועות** · Transactions — given/received tabs | ![Transactions (dark)](docs/screenshots/transactions-dark.png) | ![Transactions (light)](docs/screenshots/transactions-light.png) |
| **סטטיסטיקות** · Statistics — charts | ![Statistics (dark)](docs/screenshots/statistics-dark.png) | ![Statistics (light)](docs/screenshots/statistics-light.png) |
| **הדדיות** · Reciprocity — per-person given/received/balance | ![Reciprocity (dark)](docs/screenshots/reciprocity-dark.png) | ![Reciprocity (light)](docs/screenshots/reciprocity-light.png) |
| **דף נחיתה** · Landing (logged-out) | ![Landing (dark)](docs/screenshots/landing-dark.png) | ![Landing (light)](docs/screenshots/landing-light.png) |

**Responsive (mobile, 430px)**

| Home | Statistics |
| --- | --- |
| ![Home (mobile)](docs/screenshots/home-mobile-dark.png) | ![Statistics (mobile)](docs/screenshots/statistics-mobile-dark.png) |

---

## Tech stack

**Backend**
- Python 3.12 · **FastAPI**
- **PostgreSQL** · **SQLAlchemy** ORM · **Alembic** migrations
- **Pydantic** validation
- Auth: **Google OAuth** (ID-token verification) + app-issued **JWT**
- **Docker** / docker-compose · **pytest**

**Frontend**
- **React 19** · **Vite**
- **Tailwind CSS v4** (class-based dark mode, RTL)
- **recharts** (code-split), **Headless UI**, **lucide-react**
- `@react-oauth/google`

**Deployment**
- **Render** — Dockerised API + static frontend (see [`render.yaml`](render.yaml)).
- **Neon** — external serverless Postgres (free tier); `DATABASE_URL` is set as a
  secret in the Render dashboard, not committed.

---

## Architecture

A strict layered backend; each layer only knows the one directly below it:

```
API (router)  ->  Service (business logic)  ->  Repository (DB access)  ->  Database
```

Everything below the API is **scoped by `owner_id`** — the authenticated user's
id is threaded from the router into every service and repository call, so data
isolation is enforced in one place per query rather than sprinkled across the UI.

### Backend layout

```
app/
  api/           FastAPI routers — HTTP only, no business logic
  services/      business logic (reciprocity, stats, quick-add, cascade delete)
  repositories/  database access only (owner-scoped queries)
  models/        SQLAlchemy models
  schemas/       Pydantic request/response schemas
  core/          config, DB session, security (JWT), auth dependency
migrations/      Alembic migrations
tests/           pytest suite
```

### Frontend layout

```
frontend/src/
  pages/         screens (Home, EventDetail, PersonDetail, Statistics, Transactions, Login)
  components/    reusable UI (QuickAddForm, ConfirmDialog, NumberStepper, charts…)
  auth/          AuthContext (token + user, persisted)
  hooks/         useTheme, useCountUp, useReducedMotion
  api/           client (auth header, 401 handling, cold-start retry)
```

### Data model

A single `transactions` table carries a `direction` field (`given` /
`received`) and references `persons` and `events`; `users` owns them all via
`owner_id`. Keeping given and received in one table is deliberate: reciprocity
stays a single SQL query (`SUM(amount) GROUP BY direction`) rather than a join
across two tables.

---

## Local setup

### Backend (Docker)

The only prerequisite is Docker.

```bash
# 1. Copy the example env (defaults work for local dev)
cp .env.example .env

# 2. Build and start Postgres + the API (migrations run on boot)
docker compose up --build
```

The API is then at **http://localhost:8000**, with Swagger docs at
**http://localhost:8000/docs**. `docker compose` runs a **local Postgres** for
development; migrations apply automatically on container start.

Required backend env vars (see [`.env.example`](.env.example)):

| Var | Purpose |
| --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Local Postgres credentials (compose `db` service) |
| `DATABASE_URL` | SQLAlchemy connection string (host = `db` locally) |
| `CORS_ALLOW_ORIGINS` | Comma-separated browser origins allowed to call the API |
| `GOOGLE_CLIENT_ID` | Google OAuth client id (verifies sign-in tokens) |
| `JWT_SECRET` | Secret for signing the app's JWTs (use a long random value) |
| `JWT_ALGORITHM` / `JWT_EXPIRE_MINUTES` | JWT signing algorithm / token lifetime |

### Database — local vs production

- **Local:** `docker compose` provides Postgres via the `db` service; the
  default `DATABASE_URL` in `.env` points at it (`@db:5432`). Nothing else to do.
- **Production:** the database is an **external serverless Postgres
  ([Neon](https://neon.tech), free tier)** — there is no Render-managed DB.
  Set `DATABASE_URL` as a secret in the Render dashboard (`sync: false` in
  [`render.yaml`](render.yaml)) to the Neon connection string, **including
  `?sslmode=require`**; prefer Neon's *pooled* host (`...-pooler...`). Example:

  ```
  postgresql+psycopg2://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/giftledger?sslmode=require
  ```

  The SQLAlchemy engine is tuned for a scale-to-zero DB: `pool_pre_ping`
  replaces dropped idle connections, `pool_recycle` retires stale ones, and SSL
  is required for remote hosts. Migrations run on container start against
  whatever `DATABASE_URL` is set.

### Frontend (Vite dev server)

```bash
cd frontend
cp .env.example .env     # set VITE_API_BASE + VITE_GOOGLE_CLIENT_ID
npm install
npm run dev              # http://localhost:5173
```

Frontend env vars (see [`frontend/.env.example`](frontend/.env.example)):

| Var | Purpose |
| --- | --- |
| `VITE_API_BASE` | Base URL of the API (no trailing slash) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client id (public) |

### Tests

```bash
pytest          # in-memory SQLite, no Postgres required
```

### Design skill (optional, gitignored)

UI work is informed by the [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
design skill, installed into the repo with:

```bash
uipro init --ai antigravity
```

It lands in `.agent/` and is **gitignored** — it's local tooling for the IDE
assistant, not part of the app.

---

## API overview

All endpoints except `/health`, `/ready` and `POST /auth/google` require an
`Authorization: Bearer <jwt>` header and are scoped to the signed-in user.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness probe — instant 200, no DB (Render's health check) |
| `GET` | `/ready` | Readiness probe — 200 only when the database is reachable |
| `POST` | `/auth/google` | Verify a Google ID token, find-or-create the user, return an app JWT + profile |
| `POST` | `/quick-add` | One-shot: find-or-create event + person, record a gift (atomic) |
| `GET` | `/stats/overview` | Full stats payload: totals, counts, averages, biggest gift, breakdown by type, top people |
| `GET` | `/stats/summary` | Totals: given, received, net |
| `GET` / `POST` | `/events` | List / create events |
| `GET` / `PUT` / `DELETE` | `/events/{id}` | Read / update / delete an event (delete cascades to its gifts) |
| `GET` / `POST` | `/persons` | List / create persons |
| `GET` / `PUT` / `DELETE` | `/persons/{id}` | Read / update / delete a person (delete cascades to their gifts) |
| `GET` | `/persons/{id}/reciprocity` | Given / received / balance for one person |
| `GET` / `POST` | `/transactions` | List (filterable) / create transactions |
| `GET` / `PUT` / `DELETE` | `/transactions/{id}` | Read / update / delete a transaction |

### Transaction filters

`GET /transactions` accepts optional query params, combined with **AND**:
`direction`, `person_id`, `event_id`, `date_from`, `date_to`, `min_amount`,
`max_amount`.

```
GET /transactions?direction=given&min_amount=100&date_from=2026-07-01
```
