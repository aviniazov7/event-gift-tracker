from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.transaction import (
    TransactionCreate,
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
) -> list[TransactionRead]:
    return service.list()


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
