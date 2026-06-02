from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.person import Relation


class PersonBase(BaseModel):
    """Fields shared by create/update/read."""

    full_name: str = Field(min_length=1, max_length=255)
    relation: Relation
    notes: str | None = None


class PersonCreate(PersonBase):
    """Payload for creating a person — all required fields must be present."""


class PersonUpdate(BaseModel):
    """Payload for updating a person.

    Every field is optional so callers can send a partial update; only the
    fields actually provided are applied (see the service layer).
    """

    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    relation: Relation | None = None
    notes: str | None = None


class PersonRead(PersonBase):
    """Response model returned to clients."""

    id: int
    created_at: datetime

    # Allow building this schema directly from a SQLAlchemy model instance.
    model_config = ConfigDict(from_attributes=True)
