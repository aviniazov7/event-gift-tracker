import datetime as dt
from decimal import Decimal

from pydantic import BaseModel, Field, model_validator

from app.models.event import EventType
from app.models.transaction import Direction
from app.schemas.event import EventRead
from app.schemas.person import PersonRead
from app.schemas.transaction import TransactionRead


class QuickAddEvent(BaseModel):
    """Reference an existing event by `id`, or describe a brand-new one by
    `name` (with optional type/date/is_mine). Exactly one of id/name is given."""

    id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=255)
    type: EventType | None = None
    date: dt.date | None = None
    is_mine: bool | None = None

    @model_validator(mode="after")
    def _exactly_one_ref(self) -> "QuickAddEvent":
        # (id is None) == (name is None) is True when both are set or both unset.
        if (self.id is None) == (self.name is None):
            raise ValueError("event needs exactly one of `id` or `name`")
        return self


class QuickAddPerson(BaseModel):
    """Reference an existing person by `id`, or create one by `name`. Exactly
    one of id/name is given."""

    id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=255)

    @model_validator(mode="after")
    def _exactly_one_ref(self) -> "QuickAddPerson":
        if (self.id is None) == (self.name is None):
            raise ValueError("person needs exactly one of `id` or `name`")
        return self


class QuickAddRequest(BaseModel):
    """One-shot gift logging: resolve the event + person, then record the gift."""

    event: QuickAddEvent
    person: QuickAddPerson
    direction: Direction
    amount: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    date: dt.date


class QuickAddResponse(BaseModel):
    """The created transaction together with the event and person it points at
    (either of which may have just been created)."""

    transaction: TransactionRead
    event: EventRead
    person: PersonRead
