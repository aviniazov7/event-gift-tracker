"""Tests for the CSV export endpoint, GET /export/transactions.csv."""


def _quick_add(client, event_name, person, direction, amount, etype="wedding"):
    return client.post(
        "/quick-add",
        json={
            "event": {"name": event_name, "type": etype},
            "person": {"name": person},
            "direction": direction,
            "amount": amount,
            "date": "2025-09-11",
        },
    )


def test_export_csv_headers_and_content(client):
    _quick_add(client, "החתונה של נועה", "דנה כהן", "given", "300.00")
    _quick_add(client, "בר מצווה", "יוסי לוי", "received", "150.00", etype="bar_mitzvah")

    resp = client.get("/export/transactions.csv")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/csv")
    assert "attachment" in resp.headers["content-disposition"]
    assert "giftledger.csv" in resp.headers["content-disposition"]

    body = resp.content.decode("utf-8-sig")  # strips the BOM if present
    # BOM is present in the raw bytes so Excel reads UTF-8.
    assert resp.content.startswith(b"\xef\xbb\xbf")

    lines = body.strip().splitlines()
    assert lines[0] == "תאריך,אדם,אירוע,סוג,כיוון,סכום"
    # Two data rows, dates formatted DD/MM/YYYY, Hebrew direction labels.
    assert len(lines) == 3
    assert "11/09/2025" in body
    assert "דנה כהן" in body and "נתתי" in body and "300.00" in body
    assert "יוסי לוי" in body and "קיבלתי" in body


def test_export_csv_honors_direction_filter(client):
    _quick_add(client, "אירוע", "א", "given", "100.00")
    _quick_add(client, "אירוע", "ב", "received", "200.00")

    body = client.get(
        "/export/transactions.csv", params={"direction": "received"}
    ).content.decode("utf-8-sig")
    lines = body.strip().splitlines()
    assert len(lines) == 2  # header + 1 received row
    assert "קיבלתי" in body
    assert "נתתי" not in body


def test_export_csv_requires_auth(client):
    from app.core.deps import get_current_user
    from app.main import app

    app.dependency_overrides.pop(get_current_user, None)
    assert client.get("/export/transactions.csv").status_code == 401
