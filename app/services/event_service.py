from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.event import Event
from app.repositories.event_repo import EventRepository
from app.schemas.event import EventCreate, EventUpdate


class EventService:
    """Business logic for events, scoped to the current user's owner_id."""

    def __init__(self, db: Session) -> None:
        self.repo = EventRepository(db)

    def create(self, data: EventCreate, owner_id: int) -> Event:
        event = Event(**data.model_dump(), owner_id=owner_id)
        return self.repo.create(event)

    def list(self, owner_id: int) -> list[Event]:
        return self.repo.list(owner_id)

    def get(self, event_id: int, owner_id: int) -> Event:
        event = self.repo.get(event_id, owner_id)
        if event is None:
            self._not_found(event_id)
        return event

    def update(self, event_id: int, data: EventUpdate, owner_id: int) -> Event:
        event = self.get(event_id, owner_id)  # reuse the 404 guard
        # Only apply fields the client actually sent (partial update).
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(event, field, value)
        return self.repo.update(event)

    def delete(self, event_id: int, owner_id: int) -> None:
        event = self.get(event_id, owner_id)  # reuse the 404 guard
        self.repo.delete(event)

    @staticmethod
    def _not_found(event_id: int) -> None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event {event_id} not found",
        )
