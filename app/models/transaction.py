import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Direction(str, enum.Enum):
    """Which way the money moved — the axis reciprocity is measured on."""

    given = "given"
    received = "received"


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    person_id: Mapped[int] = mapped_column(
        ForeignKey("persons.id"), nullable=False, index=True
    )
    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id"), nullable=False, index=True
    )
    # Numeric (not float) so money never drifts on rounding.
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    direction: Mapped[Direction] = mapped_column(
        Enum(Direction, name="direction"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
