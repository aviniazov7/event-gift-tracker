from decimal import Decimal


def _txn(client, person, event, direction, amount, date="2026-07-15"):
    resp = client.post(
        "/transactions",
        json={
            "person_id": person["id"],
            "event_id": event["id"],
            "amount": amount,
            "direction": direction,
            "date": date,
        },
    )
    assert resp.status_code == 201


def test_summary_totals(client, person, event):
    _txn(client, person, event, "given", 500)
    _txn(client, person, event, "given", 100)
    _txn(client, person, event, "received", 200)

    body = client.get("/stats/summary").json()
    assert Decimal(body["total_given"]) == Decimal("600")
    assert Decimal(body["total_received"]) == Decimal("200")
    assert Decimal(body["net"]) == Decimal("400")


def test_summary_empty_is_zero(client):
    body = client.get("/stats/summary").json()
    assert Decimal(body["total_given"]) == Decimal("0")
    assert Decimal(body["total_received"]) == Decimal("0")
    assert Decimal(body["net"]) == Decimal("0")


def test_reciprocity(client, person, event):
    _txn(client, person, event, "given", 300)
    _txn(client, person, event, "given", 100)
    _txn(client, person, event, "received", 120)

    body = client.get(f"/persons/{person['id']}/reciprocity").json()
    assert body["person_id"] == person["id"]
    assert Decimal(body["total_given"]) == Decimal("400")
    assert Decimal(body["total_received"]) == Decimal("120")
    assert Decimal(body["balance"]) == Decimal("280")


def test_reciprocity_person_without_transactions_is_zero(client, person):
    body = client.get(f"/persons/{person['id']}/reciprocity").json()
    assert Decimal(body["total_given"]) == Decimal("0")
    assert Decimal(body["total_received"]) == Decimal("0")
    assert Decimal(body["balance"]) == Decimal("0")


def test_reciprocity_missing_person_returns_404(client):
    assert client.get("/persons/999999/reciprocity").status_code == 404


def test_reciprocity_is_scoped_to_one_person(client, event):
    a = client.post(
        "/persons", json={"full_name": "A", "relation": "friend"}
    ).json()
    b = client.post(
        "/persons", json={"full_name": "B", "relation": "work"}
    ).json()
    _txn(client, a, event, "given", 500)
    _txn(client, b, event, "given", 999)

    # B's transaction must not leak into A's reciprocity.
    body = client.get(f"/persons/{a['id']}/reciprocity").json()
    assert Decimal(body["total_given"]) == Decimal("500")
