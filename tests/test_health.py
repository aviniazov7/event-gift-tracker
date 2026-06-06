"""Liveness (/health) must be instant and DB-free; readiness (/ready) checks DB."""

import app.main as main


class _BrokenEngine:
    def connect(self):
        raise RuntimeError("database down")


def test_health_is_instant_liveness(client, monkeypatch):
    # Even with the database completely broken, liveness must pass fast — it
    # must not touch the DB (this is what Render's health check hits on deploy).
    monkeypatch.setattr(main, "engine", _BrokenEngine())
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_health_needs_no_auth(client):
    from app.core.deps import get_current_user
    from app.main import app

    app.dependency_overrides.pop(get_current_user, None)
    assert client.get("/health").status_code == 200


def test_ready_ok_when_db_reachable(client):
    resp = client.get("/ready")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_ready_503_when_db_down(client, monkeypatch):
    monkeypatch.setattr(main, "engine", _BrokenEngine())
    resp = client.get("/ready")
    assert resp.status_code == 503
