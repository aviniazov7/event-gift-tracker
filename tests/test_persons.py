def test_create_person(client):
    resp = client.post(
        "/persons",
        json={"full_name": "Sarah Cohen", "relation": "friend", "notes": "uni"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["id"] > 0
    assert body["full_name"] == "Sarah Cohen"
    assert body["relation"] == "friend"
    assert body["notes"] == "uni"
    assert "created_at" in body


def test_get_person(client, person):
    resp = client.get(f"/persons/{person['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == person["id"]


def test_get_missing_person_returns_404(client):
    assert client.get("/persons/999999").status_code == 404


def test_list_persons(client, person):
    resp = client.get("/persons")
    assert resp.status_code == 200
    ids = [p["id"] for p in resp.json()]
    assert person["id"] in ids


def test_update_person_is_partial(client, person):
    # Only `notes` is sent; full_name must stay unchanged.
    resp = client.put(f"/persons/{person['id']}", json={"notes": "updated"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["notes"] == "updated"
    assert body["full_name"] == person["full_name"]


def test_delete_person(client, person):
    assert client.delete(f"/persons/{person['id']}").status_code == 204
    assert client.get(f"/persons/{person['id']}").status_code == 404


def test_invalid_relation_returns_422(client):
    resp = client.post(
        "/persons", json={"full_name": "X", "relation": "enemy"}
    )
    assert resp.status_code == 422
