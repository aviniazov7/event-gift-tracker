from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionFilter


class TransactionRepository:
    """Pure database access for transactions — no business logic, no HTTP."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, transaction: Transaction) -> Transaction:
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def get(self, transaction_id: int) -> Transaction | None:
        return self.db.get(Transaction, transaction_id)

    def list(self, filters: TransactionFilter | None = None) -> list[Transaction]:
        stmt = select(Transaction)

        if filters is not None:
            # Each provided filter adds one condition; passing them all to a
            # single .where() ANDs them together.
            conditions = []
            if filters.direction is not None:
                conditions.append(Transaction.direction == filters.direction)
            if filters.person_id is not None:
                conditions.append(Transaction.person_id == filters.person_id)
            if filters.event_id is not None:
                conditions.append(Transaction.event_id == filters.event_id)
            if filters.date_from is not None:
                conditions.append(Transaction.date >= filters.date_from)
            if filters.date_to is not None:
                conditions.append(Transaction.date <= filters.date_to)
            if filters.min_amount is not None:
                conditions.append(Transaction.amount >= filters.min_amount)
            if filters.max_amount is not None:
                conditions.append(Transaction.amount <= filters.max_amount)
            if conditions:
                stmt = stmt.where(*conditions)

        stmt = stmt.order_by(Transaction.id)
        return list(self.db.scalars(stmt))

    def update(self, transaction: Transaction) -> Transaction:
        # `transaction` is already tracked by the session; commit flushes it.
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def delete(self, transaction: Transaction) -> None:
        self.db.delete(transaction)
        self.db.commit()
