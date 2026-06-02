from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.transaction import Transaction


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

    def list(self) -> list[Transaction]:
        return list(self.db.scalars(select(Transaction).order_by(Transaction.id)))

    def update(self, transaction: Transaction) -> Transaction:
        # `transaction` is already tracked by the session; commit flushes it.
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def delete(self, transaction: Transaction) -> None:
        self.db.delete(transaction)
        self.db.commit()
