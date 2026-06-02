from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.transaction import Direction
from app.repositories.person_repo import PersonRepository
from app.repositories.transaction_repo import TransactionRepository
from app.schemas.stats import ReciprocityRead, SummaryRead


class StatsService:
    """Reporting logic: turns the repository's per-direction sums into the
    summary and per-person reciprocity figures."""

    def __init__(self, db: Session) -> None:
        self.transactions = TransactionRepository(db)
        self.persons = PersonRepository(db)

    def summary(self) -> SummaryRead:
        given, received = self._given_received()
        return SummaryRead(
            total_given=given,
            total_received=received,
            net=given - received,
        )

    def reciprocity(self, person_id: int) -> ReciprocityRead:
        if self.persons.get(person_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Person {person_id} not found",
            )
        given, received = self._given_received(person_id)
        return ReciprocityRead(
            person_id=person_id,
            total_given=given,
            total_received=received,
            balance=given - received,
        )

    def _given_received(
        self, person_id: int | None = None
    ) -> tuple[Decimal, Decimal]:
        """Fetch the SQL-aggregated totals and default missing directions to 0."""
        totals = self.transactions.sum_by_direction(person_id)
        given = totals.get(Direction.given, Decimal("0"))
        received = totals.get(Direction.received, Decimal("0"))
        return given, received
