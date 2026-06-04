# Import every model here so that importing app.models registers all tables
# on Base.metadata — required for Alembic autogenerate to see the full schema.
from app.models.event import Event, EventType
from app.models.person import Person, Relation
from app.models.transaction import Direction, Transaction
from app.models.user import User

__all__ = [
    "User",
    "Person",
    "Relation",
    "Event",
    "EventType",
    "Transaction",
    "Direction",
]
