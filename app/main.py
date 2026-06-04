from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api import events, persons, stats, transactions
from app.core.database import engine

app = FastAPI(title="GiftLedger")

# Allow the Vite dev server (the React frontend) to call the API from the
# browser. Kept to the local dev origins; tighten/extend for production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(persons.router)
app.include_router(events.router)
app.include_router(transactions.router)
app.include_router(stats.router)


@app.get("/health")
def health() -> JSONResponse:
    """Liveness + readiness check.

    Returns 200 only when the database is actually reachable, so the
    container orchestrator can tell the difference between "process up"
    and "app actually usable".
    """
    try:
        # SELECT 1 is the cheapest way to confirm the connection is alive.
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "database": "unreachable"},
        )

    return JSONResponse(content={"status": "ok"})
