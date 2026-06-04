from decimal import Decimal

import pytest


@pytest.fixture
def seeded(client, event):
    """Two persons and four transactions with known, distinct attributes so
    every filter dimension can be asserted independently."""
    a = client.post(
        "/persons", json={"full_name": "A", "relation": "friend"}
    ).json()
    b = client.post(
        "/persons", json={"full_name": "B", "relation": "work"}
    ).json()

    rows = [
        (a, "given", 500, "2026-07-15"),
        (a, "received", 200, "2026-08-01"),
        (b, "given", 1000, "2026-09-10"),
        (b, "received", 50, "2026-06-20"),
    ]
    for person, direction, amount, date in rows:
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

    return {"a": a, "b": b}


def _amounts(resp):
    assert resp.status_code == 200
    return sorted(Decimal(t["amount"]) for t in resp.json())


def test_filter_by_direction(client, seeded):
    assert _amounts(client.get("/transactions?direction=given")) == [
        Decimal("500"),
        Decimal("1000"),
    ]
    assert _amounts(client.get("/transactions?direction=received")) == [
        Decimal("50"),
        Decimal("200"),
    ]


def test_filter_by_person(client, seeded):
    pid = seeded["a"]["id"]
    assert _amounts(client.get(f"/transactions?person_id={pid}")) == [
        Decimal("200"),
        Decimal("500"),
    ]


def test_filter_by_amount_range(client, seeded):
    resp = client.get("/transactions?min_amount=200&max_amount=600")
    assert _amounts(resp) == [Decimal("200"), Decimal("500")]


def test_filter_by_date_range(client, seeded):
    resp = client.get("/transactions?date_from=2026-07-01&date_to=2026-08-31")
    assert _amounts(resp) == [Decimal("200"), Decimal("500")]


def test_filters_combine_with_and(client, seeded):
    pid = seeded["b"]["id"]
    resp = client.get(f"/transactions?direction=given&person_id={pid}")
    assert _amounts(resp) == [Decimal("1000")]


def test_invalid_filter_value_returns_422(client, seeded):
    assert client.get("/transactions?direction=sideways").status_code == 422
    assert client.get("/transactions?min_amount=0").status_code == 422
