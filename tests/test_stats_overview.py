"""Tests for the Statistics payload, GET /stats/overview."""


def _quick_add(client, event_name, person_name, direction, amount, etype="wedding"):
    return client.post(
        "/quick-add",
        json={
            "event": {"name": event_name, "type": etype},
            "person": {"name": person_name},
            "direction": direction,
            "amount": amount,
            "date": "2026-07-01",
        },
    )


def test_overview_empty(client):
    body = client.get("/stats/overview").json()
    assert body["total_given"] == "0"
    assert body["total_received"] == "0"
    assert body["net"] == "0"
    assert body["event_count"] == 0
    assert body["person_count"] == 0
    assert body["gift_count"] == 0
    assert body["avg_given"] == "0"
    assert body["avg_received"] == "0"
    assert body["biggest_gift"] is None
    assert body["breakdown_by_event_type"] == []
    assert body["top_people"] == []


def test_overview_aggregates(client):
    # Two events of different types; a few gifts both directions.
    _quick_add(client, "חתונה", "דנה", "given", "300.00", etype="wedding")
    _quick_add(client, "חתונה", "יוסי", "received", "100.00", etype="wedding")
    _quick_add(client, "ברית", "דנה", "given", "500.00", etype="brit")

    body = client.get("/stats/overview").json()

    assert body["total_given"] == "800.00"
    assert body["total_received"] == "100.00"
    assert body["net"] == "700.00"
    # Both "חתונה" entries share the same name AND date, so they're the same
    # event; with the ברית that's 2 events. דנה is reused so only 2 people.
    assert body["event_count"] == 2
    assert body["person_count"] == 2  # דנה reused, יוסי new
    assert body["gift_count"] == 3
    # avg given = (300 + 500) / 2 = 400
    assert body["avg_given"].startswith("400")
    assert body["avg_received"].startswith("100")

    # Biggest single gift is the 500 to/from דנה at the ברית.
    assert body["biggest_gift"]["amount"] == "500.00"
    assert body["biggest_gift"]["person_name"] == "דנה"
    assert body["biggest_gift"]["event_title"] == "ברית"

    # Breakdown by event type covers both types.
    by_type = {b["type"]: b for b in body["breakdown_by_event_type"]}
    assert by_type["wedding"]["given"] == "300.00"
    assert by_type["wedding"]["received"] == "100.00"
    assert by_type["brit"]["given"] == "500.00"
    assert by_type["brit"]["received"] == "0.00"

    # Top people: דנה (800 total) ahead of יוסי (100).
    top = body["top_people"]
    assert top[0]["person_name"] == "דנה"
    assert top[0]["net"] == "800.00"
    assert top[1]["person_name"] == "יוסי"
    assert len(top) == 2


def test_overview_requires_auth(client):
    from app.core.deps import get_current_user
    from app.main import app

    app.dependency_overrides.pop(get_current_user, None)
    assert client.get("/stats/overview").status_code == 401
