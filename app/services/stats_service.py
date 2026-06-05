from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.transaction import Direction
from app.repositories.event_repo import EventRepository
from app.repositories.person_repo import PersonRepository
from app.repositories.transaction_repo import TransactionRepository
from app.schemas.stats import (
    BiggestGift,
    EventTypeBreakdown,
    OverviewRead,
    ReciprocityRead,
    SummaryRead,
    TopPerson,
)

ZERO = Decimal("0")


class StatsService:
    """Reporting logic, scoped to the current user's owner_id: turns the
    repository's per-direction sums into summary and reciprocity figures."""

    def __init__(self, db: Session) -> None:
        self.transactions = TransactionRepository(db)
        self.persons = PersonRepository(db)
        self.events = EventRepository(db)

    def summary(self, owner_id: int) -> SummaryRead:
        given, received = self._given_received(owner_id)
        return SummaryRead(
            total_given=given,
            total_received=received,
            net=given - received,
        )

    def overview(self, owner_id: int) -> OverviewRead:
        """Assemble the full Statistics payload from SQL-aggregated figures."""
        given, received = self._given_received(owner_id)

        avgs = self.transactions.avg_by_direction(owner_id)
        avg_given = avgs.get(Direction.given) or ZERO
        avg_received = avgs.get(Direction.received) or ZERO

        biggest_row = self.transactions.biggest_gift(owner_id)
        biggest_gift = (
            BiggestGift(
                amount=biggest_row.amount,
                person_name=biggest_row.person_name,
                event_title=biggest_row.event_title,
            )
            if biggest_row is not None
            else None
        )

        breakdown = [
            EventTypeBreakdown(type=row.type, given=row.given, received=row.received)
            for row in self.transactions.sum_by_event_type(owner_id)
        ]

        top_people = [
            TopPerson(
                person_name=row.person_name,
                given=row.given,
                received=row.received,
                net=row.given - row.received,
            )
            for row in self.transactions.top_people(owner_id, limit=5)
        ]

        return OverviewRead(
            total_given=given,
            total_received=received,
            net=given - received,
            event_count=self.events.count(owner_id),
            person_count=self.persons.count(owner_id),
            gift_count=self.transactions.count(owner_id),
            avg_given=avg_given,
            avg_received=avg_received,
            biggest_gift=biggest_gift,
            breakdown_by_event_type=breakdown,
            top_people=top_people,
        )

    def reciprocity(self, person_id: int, owner_id: int) -> ReciprocityRead:
        # Only the owner's own person can be inspected.
        if self.persons.get(person_id, owner_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Person {person_id} not found",
            )
        given, received = self._given_received(owner_id, person_id)
        return ReciprocityRead(
            person_id=person_id,
            total_given=given,
            total_received=received,
            balance=given - received,
        )

    def _given_received(
        self, owner_id: int, person_id: int | None = None
    ) -> tuple[Decimal, Decimal]:
        """Fetch the SQL-aggregated totals and default missing directions to 0."""
        totals = self.transactions.sum_by_direction(owner_id, person_id)
        given = totals.get(Direction.given, Decimal("0"))
        received = totals.get(Direction.received, Decimal("0"))
        return given, received
