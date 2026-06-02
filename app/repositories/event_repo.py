from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.event import Event


class EventRepository:
    """Pure database access for events — no business logic, no HTTP concerns."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, event: Event) -> Event:
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get(self, event_id: int) -> Event | None:
        return self.db.get(Event, event_id)

    def list(self) -> list[Event]:
        return list(self.db.scalars(select(Event).order_by(Event.id)))

    def update(self, event: Event) -> Event:
        # `event` is already tracked by the session; commit flushes the changes.
        self.db.commit()
        self.db.refresh(event)
        return event

    def delete(self, event: Event) -> None:
        self.db.delete(event)
        self.db.commit()
