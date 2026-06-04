from decimal import Decimal


def _payload(person, event, **overrides):
    data = {
        "person_id": person["id"],
        "event_id": event["id"],
        "amount": 500,
        "direction": "given",
        "date": "2026-07-15",
    }
    data.update(overrides)
    return data


def test_create_transaction(client, person, event):
    resp = client.post("/transactions", json=_payload(person, event))
    assert resp.status_code == 201
    body = resp.json()
    assert body["id"] > 0
    assert Decimal(body["amount"]) == Decimal("500")
    assert body["direction"] == "given"


def test_create_transaction_missing_person_returns_404(client, event):
    resp = client.post(
        "/transactions",
        json={
            "person_id": 999999,
            "event_id": event["id"],
            "amount": 10,
            "direction": "given",
            "date": "2026-07-15",
        },
    )
    assert resp.status_code == 404


def test_create_transaction_missing_event_returns_404(client, person):
    resp = client.post(
        "/transactions",
        json={
            "person_id": person["id"],
            "event_id": 999999,
            "amount": 10,
            "direction": "given",
            "date": "2026-07-15",
        },
    )
    assert resp.status_code == 404


def test_create_transaction_non_positive_amount_returns_422(client, person, event):
    resp = client.post("/transactions", json=_payload(person, event, amount=0))
    assert resp.status_code == 422


def test_get_and_update_transaction(client, person, event):
    created = client.post("/transactions", json=_payload(person, event)).json()
    assert client.get(f"/transactions/{created['id']}").status_code == 200

    resp = client.put(f"/transactions/{created['id']}", json={"amount": 750})
    assert resp.status_code == 200
    assert Decimal(resp.json()["amount"]) == Decimal("750")


def test_delete_transaction(client, person, event):
    created = client.post("/transactions", json=_payload(person, event)).json()
    assert client.delete(f"/transactions/{created['id']}").status_code == 204
    assert client.get(f"/transactions/{created['id']}").status_code == 404


def test_get_missing_transaction_returns_404(client):
    assert client.get("/transactions/999999").status_code == 404
