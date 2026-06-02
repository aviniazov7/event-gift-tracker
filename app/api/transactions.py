import datetime as dt
from decimal import Decimal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.transaction import Direction
from app.schemas.transaction import (
    TransactionCreate,
    TransactionFilter,
    TransactionRead,
    TransactionUpdate,
)
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["transactions"])


def get_service(db: Session = Depends(get_db)) -> TransactionService:
    """Provide a request-scoped TransactionService wired to the DB session."""
    return TransactionService(db)


@router.get("", response_model=list[TransactionRead])
def list_transactions(
    service: TransactionService = Depends(get_service),
    direction: Direction | None = Query(default=None),
    person_id: int | None = Query(default=None),
    event_id: int | None = Query(default=None),
    date_from: dt.date | None = Query(default=None),
    date_to: dt.date | None = Query(default=None),
    min_amount: Decimal | None = Query(default=None, gt=0),
    max_amount: Decimal | None = Query(default=None, gt=0),
) -> list[TransactionRead]:
    # Parsing query params into the filter DTO is all the router does; the
    # actual query is built in the repository.
    filters = TransactionFilter(
        direction=direction,
        person_id=person_id,
        event_id=event_id,
        date_from=date_from,
        date_to=date_to,
        min_amount=min_amount,
        max_amount=max_amount,
    )
    return service.list(filters)


@router.post(
    "", response_model=TransactionRead, status_code=status.HTTP_201_CREATED
)
def create_transaction(
    payload: TransactionCreate,
    service: TransactionService = Depends(get_service),
) -> TransactionRead:
    return service.create(payload)


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(
    transaction_id: int, service: TransactionService = Depends(get_service)
) -> TransactionRead:
    return service.get(transaction_id)


@router.put("/{transaction_id}", response_model=TransactionRead)
def update_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    service: TransactionService = Depends(get_service),
) -> TransactionRead:
    return service.update(transaction_id, payload)


@router.delete(
    "/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_transaction(
    transaction_id: int, service: TransactionService = Depends(get_service)
) -> None:
    service.delete(transaction_id)
