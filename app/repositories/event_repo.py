from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.event import Event


class EventRepository:
    """Pure database access for events — no business logic, no HTTP concerns.

    Every read is scoped to an owner_id so users only ever see their own data.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, event: Event) -> Event:
        # owner_id is set on the model by the service before this is called.
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def add(self, event: Event) -> Event:
        """Stage an insert inside the caller's transaction (flush, NO commit).

        Used by multi-entity flows (e.g. quick-add) that must commit the event,
        person and transaction together so a partial failure leaves nothing
        behind. The flush assigns the primary key without ending the transaction.
        """
        self.db.add(event)
        self.db.flush()
        return event

    def get(self, event_id: int, owner_id: int) -> Event | None:
        return self.db.scalar(
            select(Event).where(Event.id == event_id, Event.owner_id == owner_id)
        )

    def list(self, owner_id: int) -> list[Event]:
        return list(
            self.db.scalars(
                select(Event).where(Event.owner_id == owner_id).order_by(Event.id)
            )
        )

    def count(self, owner_id: int) -> int:
        """How many events the owner has (computed in SQL)."""
        return self.db.scalar(
            select(func.count()).select_from(Event).where(Event.owner_id == owner_id)
        )

    def update(self, event: Event) -> Event:
        # `event` is already tracked by the session; commit flushes the changes.
        self.db.commit()
        self.db.refresh(event)
        return event

    def delete(self, event: Event) -> None:
        self.db.delete(event)
        self.db.commit()
