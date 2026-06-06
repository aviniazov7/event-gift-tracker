# Deferred annotations: this class defines a method named `list`, which would
# otherwise shadow the builtin `list` when later return annotations (list[Row])
# are evaluated in the class body.
from __future__ import annotations

from decimal import Decimal

from sqlalchemy import Row, case, delete, func, select
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.person import Person
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

    def add(self, transaction: Transaction) -> Transaction:
        """Stage an insert inside the caller's transaction (flush, NO commit) so
        quick-add can commit the event, person and transaction in one shot."""
        self.db.add(transaction)
        self.db.flush()
        return transaction

    def get(self, transaction_id: int, owner_id: int) -> Transaction | None:
        return self.db.scalar(
            select(Transaction).where(
                Transaction.id == transaction_id,
                Transaction.owner_id == owner_id,
            )
        )

    def list_for_export(
        self, owner_id: int, direction: Direction | None = None
    ) -> list[Row]:
        """Rows for CSV export — (date, person_name, event_title, event_type,
        direction, amount), joined and owner-scoped, oldest first. Optionally
        filtered by direction."""
        conditions = [Transaction.owner_id == owner_id]
        if direction is not None:
            conditions.append(Transaction.direction == direction)
        stmt = (
            select(
                Transaction.date,
                Person.full_name,
                Event.title,
                Event.type,
                Transaction.direction,
                Transaction.amount,
            )
            .join(Person, Person.id == Transaction.person_id)
            .join(Event, Event.id == Transaction.event_id)
            .where(*conditions)
            .order_by(Transaction.date, Transaction.id)
        )
        return list(self.db.execute(stmt))

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

    def delete_by_event(self, event_id: int, owner_id: int) -> None:
        """Remove all of the owner's gifts for one event (no commit) — lets the
        event delete cascade atomically in the caller's transaction."""
        self.db.execute(
            delete(Transaction).where(
                Transaction.event_id == event_id,
                Transaction.owner_id == owner_id,
            )
        )

    def delete_by_person(self, person_id: int, owner_id: int) -> None:
        """Remove all of the owner's gifts for one person (no commit) — lets the
        person delete cascade atomically in the caller's transaction."""
        self.db.execute(
            delete(Transaction).where(
                Transaction.person_id == person_id,
                Transaction.owner_id == owner_id,
            )
        )

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

    def count(self, owner_id: int) -> int:
        """How many gifts (transactions) the owner has."""
        return self.db.scalar(
            select(func.count())
            .select_from(Transaction)
            .where(Transaction.owner_id == owner_id)
        )

    def avg_by_direction(self, owner_id: int) -> dict[Direction, Decimal]:
        """Average gift amount per direction, computed in SQL. Directions with
        no gifts are absent; callers default them to 0."""
        stmt = (
            select(Transaction.direction, func.avg(Transaction.amount))
            .where(Transaction.owner_id == owner_id)
            .group_by(Transaction.direction)
        )
        return {direction: avg for direction, avg in self.db.execute(stmt)}

    def biggest_gift(self, owner_id: int) -> Row | None:
        """The single largest gift (either direction) as a row of
        (amount, person_name, event_title), or None when there are no gifts."""
        stmt = (
            select(
                Transaction.amount,
                Person.full_name.label("person_name"),
                Event.title.label("event_title"),
            )
            .join(Person, Person.id == Transaction.person_id)
            .join(Event, Event.id == Transaction.event_id)
            .where(Transaction.owner_id == owner_id)
            .order_by(Transaction.amount.desc(), Transaction.id)
            .limit(1)
        )
        return self.db.execute(stmt).first()

    def sum_by_event_type(self, owner_id: int) -> list[Row]:
        """Per event-type given/received totals, as rows of
        (type, given, received). Computed with a single grouped query."""
        given = func.coalesce(
            func.sum(
                case(
                    (Transaction.direction == Direction.given, Transaction.amount),
                    else_=0,
                )
            ),
            0,
        ).label("given")
        received = func.coalesce(
            func.sum(
                case(
                    (Transaction.direction == Direction.received, Transaction.amount),
                    else_=0,
                )
            ),
            0,
        ).label("received")
        stmt = (
            select(Event.type, given, received)
            .join(Event, Event.id == Transaction.event_id)
            .where(Transaction.owner_id == owner_id)
            .group_by(Event.type)
            .order_by(Event.type)
        )
        return list(self.db.execute(stmt))

    def top_people(self, owner_id: int, limit: int = 5) -> list[Row]:
        """The top people by total money exchanged (given + received), as rows
        of (person_name, given, received), highest first."""
        given = func.coalesce(
            func.sum(
                case(
                    (Transaction.direction == Direction.given, Transaction.amount),
                    else_=0,
                )
            ),
            0,
        ).label("given")
        received = func.coalesce(
            func.sum(
                case(
                    (Transaction.direction == Direction.received, Transaction.amount),
                    else_=0,
                )
            ),
            0,
        ).label("received")
        stmt = (
            select(Person.full_name.label("person_name"), given, received)
            .join(Person, Person.id == Transaction.person_id)
            .where(Transaction.owner_id == owner_id)
            .group_by(Person.id, Person.full_name)
            .order_by((given + received).desc(), Person.id)
            .limit(limit)
        )
        return list(self.db.execute(stmt))
