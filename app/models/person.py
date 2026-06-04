import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Relation(str, enum.Enum):
    """How the user knows this person — drives reciprocity grouping later."""

    family = "family"
    friend = "friend"
    work = "work"
    other = "other"


class Person(Base):
    __tablename__ = "persons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # Every person belongs to the user who created it (per-user data scoping).
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    relation: Mapped[Relation] = mapped_column(
        Enum(Relation, name="relation"), nullable=False
    )
    # Free-form context (e.g. "cousin on mom's side"); optional.
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
