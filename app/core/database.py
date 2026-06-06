from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.engine.url import URL
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.config import settings

# Hosts that are a local Postgres (docker-compose, dev) — SSL is off there, so we
# must NOT force sslmode=require for them (it would refuse the connection).
LOCAL_DB_HOSTS = {"", "db", "localhost", "127.0.0.1", "::1"}


def engine_options(url: URL) -> tuple[dict, dict]:
    """Return (connect_args, engine_kwargs) tuned for the given database URL.

    - `pool_pre_ping` is always on: a dropped idle connection is detected and
      replaced instead of raising — important for serverless, scale-to-zero
      Postgres (e.g. Neon) that closes idle connections.
    - For Postgres we also recycle connections proactively (`pool_recycle`) and,
      for REMOTE hosts (managed providers like Neon), require SSL — unless the
      URL already specifies an sslmode. Local Postgres is left untouched.
    """
    connect_args: dict = {}
    engine_kwargs: dict = {"pool_pre_ping": True}

    if url.drivername.startswith("postgresql"):
        # Recycle connections older than 5 min so we never hand out one the
        # serverless DB may have already closed during an idle period.
        engine_kwargs["pool_recycle"] = 300
        host = (url.host or "").lower()
        if host not in LOCAL_DB_HOSTS and "sslmode" not in url.query:
            connect_args["sslmode"] = "require"

    return connect_args, engine_kwargs


_url = make_url(settings.DATABASE_URL)
_connect_args, _engine_kwargs = engine_options(_url)

# Single engine for the whole process.
engine = create_engine(
    settings.DATABASE_URL, connect_args=_connect_args, **_engine_kwargs
)

# Session factory — one SessionLocal() per request.
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Declarative base that all ORM models will inherit from.
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: yield a request-scoped session and always close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
