import enum
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EventType(str, enum.Enum):
    """Category of the celebration the gift is tied to."""

    wedding = "wedding"
    bar_mitzvah = "bar_mitzvah"
    brit = "brit"
    birthday = "birthday"
    other = "other"


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[EventType] = mapped_column(
        Enum(EventType, name="event_type"), nullable=False
    )
    event_date: Mapped[date] = mapped_column(Date, nullable=False)
    # True when this is the user's own event (so received gifts are expected).
    is_mine: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
