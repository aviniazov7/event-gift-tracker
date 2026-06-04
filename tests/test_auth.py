from app.core.deps import get_current_user
from app.main import app


def test_protected_endpoints_require_auth(client):
    # Drop the stubbed auth so the real Bearer check runs (no token -> 401).
    app.dependency_overrides.pop(get_current_user, None)

    assert client.get("/persons").status_code == 401
    assert client.get("/events").status_code == 401
    assert client.get("/transactions").status_code == 401
    assert client.get("/stats/summary").status_code == 401


def test_invalid_token_is_rejected(client):
    app.dependency_overrides.pop(get_current_user, None)
    resp = client.get(
        "/persons", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert resp.status_code == 401
