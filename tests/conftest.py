import os

# The app builds its engine from DATABASE_URL at import time, so give it a
# harmless value before importing anything from `app`. Tests never touch this
# engine — they override get_db with an isolated SQLite session below.
os.environ.setdefault("DATABASE_URL", "sqlite://")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401  (registers every table on Base.metadata)
from app.core.database import Base, get_db
from app.main import app


@pytest.fixture
def client():
    """A TestClient backed by a fresh in-memory SQLite database per test.

    StaticPool keeps the single in-memory DB alive across connections so the
    schema persists for the whole test; tearing the engine down between tests
    guarantees isolation.
    """
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(
        bind=engine, autoflush=False, autocommit=False
    )

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def person(client):
    """Create and return a person payload (including its id)."""
    resp = client.post(
        "/persons",
        json={"full_name": "Test Person", "relation": "friend"},
    )
    assert resp.status_code == 201
    return resp.json()


@pytest.fixture
def event(client):
    """Create and return an event payload (including its id)."""
    resp = client.post(
        "/events",
        json={
            "title": "Test Event",
            "type": "wedding",
            "event_date": "2026-07-01",
        },
    )
    assert resp.status_code == 201
    return resp.json()
