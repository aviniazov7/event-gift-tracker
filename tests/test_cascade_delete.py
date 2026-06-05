"""Deleting an event or person cascades to its gifts (application-level)."""


def _quick_add(client, event_name, person_name, direction="given", amount="100.00"):
    return client.post(
        "/quick-add",
        json={
            "event": {"name": event_name, "type": "wedding"},
            "person": {"name": person_name},
            "direction": direction,
            "amount": amount,
            "date": "2026-07-01",
        },
    ).json()


def test_deleting_event_removes_its_gifts(client):
    a = _quick_add(client, "החתונה", "דנה", amount="300.00")
    event_id = a["event"]["id"]
    # A second gift in the same event, plus an unrelated event to keep.
    client.post(
        "/quick-add",
        json={
            "event": {"id": event_id},
            "person": {"name": "יוסי"},
            "direction": "received",
            "amount": "120.00",
            "date": "2026-07-01",
        },
    )
    other = _quick_add(client, "ברית", "אבי", amount="50.00")

    assert client.delete(f"/events/{event_id}").status_code == 204

    # Event gone, its two gifts gone, the unrelated event + gift remain.
    assert client.get(f"/events/{event_id}").status_code == 404
    remaining = client.get("/transactions").json()
    assert all(t["event_id"] != event_id for t in remaining)
    assert any(t["event_id"] == other["event"]["id"] for t in remaining)


def test_deleting_person_removes_their_gifts(client):
    a = _quick_add(client, "חתונה", "שרה", amount="200.00")
    person_id = a["person"]["id"]
    keep = _quick_add(client, "חתונה2", "מירי", amount="80.00")

    assert client.delete(f"/persons/{person_id}").status_code == 204

    assert client.get(f"/persons/{person_id}").status_code == 404
    remaining = client.get("/transactions").json()
    assert all(t["person_id"] != person_id for t in remaining)
    assert any(t["person_id"] == keep["person"]["id"] for t in remaining)


def test_delete_is_scoped_404_when_not_owner(client):
    # A non-existent id is a 404, never a 500 (no dangling FK error).
    assert client.delete("/events/99999").status_code == 404
    assert client.delete("/persons/99999").status_code == 404
