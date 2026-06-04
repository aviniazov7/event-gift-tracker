from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.transaction import Direction, Transaction
from app.schemas.transaction import TransactionFilter


class TransactionRepository:
    """Pure database access for transactions — no business logic, no HTTP.

    Every read is scoped to an owner_id so users only ever see their own data.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, transaction: Transaction) -> Transaction:
        # owner_id is set on the model by the service before this is called.
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def get(self, transaction_id: int, owner_id: int) -> Transaction | None:
        return self.db.scalar(
            select(Transaction).where(
                Transaction.id == transaction_id,
                Transaction.owner_id == owner_id,
            )
        )

    def list(
        self, owner_id: int, filters: TransactionFilter | None = None
    ) -> list[Transaction]:
        # Always scope to the owner; optional filters are ANDed on top.
        conditions = [Transaction.owner_id == owner_id]

        if filters is not None:
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

        stmt = select(Transaction).where(*conditions).order_by(Transaction.id)
        return list(self.db.scalars(stmt))

    def update(self, transaction: Transaction) -> Transaction:
        # `transaction` is already tracked by the session; commit flushes it.
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def delete(self, transaction: Transaction) -> None:
        self.db.delete(transaction)
        self.db.commit()

    def sum_by_direction(
        self, owner_id: int, person_id: int | None = None
    ) -> dict[Direction, Decimal]:
        """Total amount per direction for one owner, computed in SQL
        (SUM ... GROUP BY). Optionally scoped to a single person. Directions
        with no transactions are absent; callers default them to 0."""
        conditions = [Transaction.owner_id == owner_id]
        if person_id is not None:
            conditions.append(Transaction.person_id == person_id)

        stmt = (
            select(Transaction.direction, func.sum(Transaction.amount))
            .where(*conditions)
            .group_by(Transaction.direction)
        )
        return {direction: total for direction, total in self.db.execute(stmt)}
