import datetime as dt
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.transaction import Direction

# NOTE: this schema has a field literally named `date`. We reference the types
# as `dt.date` / `dt.datetime` (module-qualified) so the field name can't
# shadow the type when Pydantic resolves the annotations.


class TransactionBase(BaseModel):
    """Fields shared by create/update/read."""

    person_id: int
    event_id: int
    # Positive money only; bounds mirror the Numeric(10, 2) DB column.
    amount: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    direction: Direction
    date: dt.date
    notes: str | None = None


class TransactionCreate(TransactionBase):
    """Payload for creating a transaction."""


class TransactionUpdate(BaseModel):
    """Partial update — only the provided fields are applied."""

    person_id: int | None = None
    event_id: int | None = None
    amount: Decimal | None = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    direction: Direction | None = None
    date: dt.date | None = None
    notes: str | None = None


class TransactionRead(TransactionBase):
    """Response model returned to clients."""

    id: int
    created_at: dt.datetime

    model_config = ConfigDict(from_attributes=True)
