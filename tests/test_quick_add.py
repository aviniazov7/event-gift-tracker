"""Tests for the unified one-step gift logging endpoint, POST /quick-add."""


def test_quick_add_creates_event_person_and_transaction(client):
    # Brand-new event (by name) + brand-new person (by name) in one call.
    resp = client.post(
        "/quick-add",
        json={
            "event": {"name": "החתונה של נועה", "type": "wedding"},
            "person": {"name": "דנה כהן"},
            "direction": "given",
            "amount": "300.00",
            "date": "2026-07-01",
        },
    )
    assert resp.status_code == 201
    body = resp.json()

    assert body["event"]["title"] == "החתונה של נועה"
    assert body["event"]["type"] == "wedding"
    assert body["event"]["is_mine"] is False
    assert body["person"]["full_name"] == "דנה כהן"
    assert body["transaction"]["direction"] == "given"
    assert body["transaction"]["amount"] == "300.00"
    assert body["transaction"]["event_id"] == body["event"]["id"]
    assert body["transaction"]["person_id"] == body["person"]["id"]

    # The created rows are now visible through the normal listing endpoints.
    assert any(e["id"] == body["event"]["id"] for e in client.get("/events").json())
    assert any(
        p["id"] == body["person"]["id"] for p in client.get("/persons").json()
    )


def test_quick_add_into_existing_event_reuses_it(client, event):
    # Two gifts into the same existing event id should not create a new event.
    payload = {
        "event": {"id": event["id"]},
        "person": {"name": "אורח א"},
        "direction": "received",
        "amount": "100.00",
        "date": "2026-07-01",
    }
    first = client.post("/quick-add", json=payload).json()
    payload["person"] = {"name": "אורח ב"}
    second = client.post("/quick-add", json=payload).json()

    assert first["event"]["id"] == event["id"]
    assert second["event"]["id"] == event["id"]
    # Still exactly one event, two people, two gifts.
    assert len(client.get("/events").json()) == 1
    txns = client.get("/transactions", params={"event_id": event["id"]}).json()
    assert len(txns) == 2


def test_quick_add_reuses_existing_person_by_name(client):
    # Same person name twice (case-insensitive) → one person, two gifts.
    base = {
        "event": {"name": "ברית", "type": "brit"},
        "direction": "given",
        "amount": "50.00",
        "date": "2026-07-01",
    }
    first = client.post(
        "/quick-add", json={**base, "person": {"name": "יוסי לוי"}}
    ).json()
    second = client.post(
        "/quick-add", json={**base, "person": {"name": "  yossi levi  "}}
    ).json()
    # Distinct names (Hebrew vs latin) won't collide, but identical ones do:
    third = client.post(
        "/quick-add", json={**base, "person": {"name": "יוסי לוי"}}
    ).json()

    assert first["person"]["id"] == third["person"]["id"]
    assert second["person"]["id"] != first["person"]["id"]


def test_quick_add_respects_is_mine(client):
    resp = client.post(
        "/quick-add",
        json={
            "event": {"name": "הבר מצווה שלי", "type": "bar_mitzvah", "is_mine": True},
            "person": {"name": "סבא"},
            "direction": "received",
            "amount": "500.00",
            "date": "2026-07-01",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["event"]["is_mine"] is True


def test_quick_add_unknown_event_id_is_404(client):
    resp = client.post(
        "/quick-add",
        json={
            "event": {"id": 99999},
            "person": {"name": "פלוני"},
            "direction": "given",
            "amount": "10.00",
            "date": "2026-07-01",
        },
    )
    assert resp.status_code == 404


def test_quick_add_rejects_event_with_both_id_and_name(client):
    resp = client.post(
        "/quick-add",
        json={
            "event": {"id": 1, "name": "שניהם"},
            "person": {"name": "פלוני"},
            "direction": "given",
            "amount": "10.00",
            "date": "2026-07-01",
        },
    )
    assert resp.status_code == 422


def test_quick_add_requires_auth(client):
    from app.core.deps import get_current_user
    from app.main import app

    app.dependency_overrides.pop(get_current_user, None)
    resp = client.post(
        "/quick-add",
        json={
            "event": {"name": "x"},
            "person": {"name": "y"},
            "direction": "given",
            "amount": "10.00",
            "date": "2026-07-01",
        },
    )
    assert resp.status_code == 401
