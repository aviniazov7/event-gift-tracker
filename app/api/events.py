from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.event import EventCreate, EventRead, EventUpdate
from app.services.event_service import EventService

router = APIRouter(prefix="/events", tags=["events"])


def get_service(db: Session = Depends(get_db)) -> EventService:
    """Provide a request-scoped EventService wired to the DB session."""
    return EventService(db)


@router.get("", response_model=list[EventRead])
def list_events(service: EventService = Depends(get_service)) -> list[EventRead]:
    return service.list()


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate, service: EventService = Depends(get_service)
) -> EventRead:
    return service.create(payload)


@router.get("/{event_id}", response_model=EventRead)
def get_event(
    event_id: int, service: EventService = Depends(get_service)
) -> EventRead:
    return service.get(event_id)


@router.put("/{event_id}", response_model=EventRead)
def update_event(
    event_id: int,
    payload: EventUpdate,
    service: EventService = Depends(get_service),
) -> EventRead:
    return service.update(event_id, payload)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int, service: EventService = Depends(get_service)
) -> None:
    service.delete(event_id)
