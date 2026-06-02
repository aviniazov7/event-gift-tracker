from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.event import EventType


class EventBase(BaseModel):
    """Fields shared by create/update/read."""

    title: str = Field(min_length=1, max_length=255)
    type: EventType
    event_date: date
    # Defaults to False: most recorded events belong to other people.
    is_mine: bool = False


class EventCreate(EventBase):
    """Payload for creating an event."""


class EventUpdate(BaseModel):
    """Partial update — only the provided fields are applied."""

    title: str | None = Field(default=None, min_length=1, max_length=255)
    type: EventType | None = None
    event_date: date | None = None
    is_mine: bool | None = None


class EventRead(EventBase):
    """Response model returned to clients."""

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
