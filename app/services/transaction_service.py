from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.repositories.event_repo import EventRepository
from app.repositories.person_repo import PersonRepository
from app.repositories.transaction_repo import TransactionRepository
from app.schemas.transaction import TransactionCreate, TransactionUpdate


class TransactionService:
    """Business logic for transactions.

    Beyond plain CRUD, it enforces referential integrity at the application
    level: a transaction may only point at a person and event that exist.
    """

    def __init__(self, db: Session) -> None:
        self.repo = TransactionRepository(db)
        self.persons = PersonRepository(db)
        self.events = EventRepository(db)

    def create(self, data: TransactionCreate) -> Transaction:
        self._ensure_person_exists(data.person_id)
        self._ensure_event_exists(data.event_id)
        transaction = Transaction(**data.model_dump())
        return self.repo.create(transaction)

    def list(self) -> list[Transaction]:
        return self.repo.list()

    def get(self, transaction_id: int) -> Transaction:
        transaction = self.repo.get(transaction_id)
        if transaction is None:
            raise self._not_found("Transaction", transaction_id)
        return transaction

    def update(self, transaction_id: int, data: TransactionUpdate) -> Transaction:
        transaction = self.get(transaction_id)  # reuse the 404 guard
        changes = data.model_dump(exclude_unset=True)

        # Re-validate the FKs only when the client is changing them.
        if "person_id" in changes:
            self._ensure_person_exists(changes["person_id"])
        if "event_id" in changes:
            self._ensure_event_exists(changes["event_id"])

        for field, value in changes.items():
            setattr(transaction, field, value)
        return self.repo.update(transaction)

    def delete(self, transaction_id: int) -> None:
        transaction = self.get(transaction_id)  # reuse the 404 guard
        self.repo.delete(transaction)

    def _ensure_person_exists(self, person_id: int) -> None:
        if self.persons.get(person_id) is None:
            raise self._not_found("Person", person_id)

    def _ensure_event_exists(self, event_id: int) -> None:
        if self.events.get(event_id) is None:
            raise self._not_found("Event", event_id)

    @staticmethod
    def _not_found(entity: str, entity_id: int) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity} {entity_id} not found",
        )
