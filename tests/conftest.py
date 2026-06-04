import os

# The app reads these from the environment at import time, so set harmless
# values before importing anything from `app`. Tests never touch the real
# engine — they override get_db with an isolated SQLite session below.
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("JWT_SECRET", "test-jwt-secret")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401  (registers every table on Base.metadata)
from app.core.database import Base, get_db
from app.core.deps import get_current_user
from app.main import app
from app.models.user import User


@pytest.fixture
def client():
    """A TestClient backed by a fresh in-memory SQLite database per test, with
    a signed-in test user.

    StaticPool keeps the single in-memory DB alive across connections so the
    schema persists for the whole test; tearing the engine down between tests
    guarantees isolation. Auth is stubbed by overriding get_current_user with
    a real user row, so every request is scoped to that user's owner_id.
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

    # Seed the authenticated user the overridden dependency will return.
    seed = TestingSessionLocal()
    test_user = User(
        google_sub="test-sub", email="test@example.com", name="Test User"
    )
    seed.add(test_user)
    seed.commit()
    seed.refresh(test_user)
    seed.close()

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: test_user

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
