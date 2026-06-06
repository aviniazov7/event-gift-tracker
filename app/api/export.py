import csv
import io

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.event import EventType
from app.models.transaction import Direction
from app.models.user import User
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/export", tags=["export"])

# Hebrew labels for the CSV (the DB stores English enum values).
DIRECTION_HE = {Direction.given: "נתתי", Direction.received: "קיבלתי"}
EVENT_TYPE_HE = {
    EventType.wedding: "חתונה",
    EventType.bar_mitzvah: "בר מצווה",
    EventType.brit: "ברית",
    EventType.birthday: "יום הולדת",
    EventType.other: "אחר",
}

HEADERS = ["תאריך", "אדם", "אירוע", "סוג", "כיוון", "סכום"]


def get_service(db: Session = Depends(get_db)) -> TransactionService:
    return TransactionService(db)


@router.get("/transactions.csv")
def export_transactions_csv(
    service: TransactionService = Depends(get_service),
    current_user: User = Depends(get_current_user),
    direction: Direction | None = Query(default=None),
) -> StreamingResponse:
    """Stream the current user's transactions as CSV. UTF-8 with a BOM so Hebrew
    opens correctly in Excel. Optionally filtered by direction (matches the
    transactions screen's tab)."""
    rows = service.list_for_export(current_user.id, direction)

    def generate():
        buffer = io.StringIO()
        writer = csv.writer(buffer)

        def flush():
            value = buffer.getvalue()
            buffer.seek(0)
            buffer.truncate(0)
            return value

        # BOM first so Excel detects UTF-8.
        yield "﻿"
        writer.writerow(HEADERS)
        yield flush()
        for date, person_name, event_title, event_type, tx_direction, amount in rows:
            writer.writerow(
                [
                    date.strftime("%d/%m/%Y"),
                    person_name,
                    event_title,
                    EVENT_TYPE_HE.get(event_type, str(event_type)),
                    DIRECTION_HE.get(tx_direction, str(tx_direction)),
                    f"{amount}",
                ]
            )
            yield flush()

    return StreamingResponse(
        generate(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=giftledger.csv"},
    )
