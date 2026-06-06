import datetime as dt
from typing import NamedTuple

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.event import Event, EventType
from app.models.person import Person, Relation
from app.models.transaction import Transaction
from app.repositories.event_repo import EventRepository
from app.repositories.person_repo import PersonRepository
from app.repositories.transaction_repo import TransactionRepository
from app.schemas.quick_add import QuickAddEvent, QuickAddPerson, QuickAddRequest


class QuickAddResult(NamedTuple):
    """The three rows the endpoint reports back — any of which the flow may
    have just created."""

    transaction: Transaction
    event: Event
    person: Person


class QuickAddService:
    """One-step gift logging.

    Find-or-create the event, find-or-create the person, then create the
    transaction — all inside a SINGLE database transaction (one commit at the
    end). If anything fails mid-way we roll back, so the flow never leaves a
    dangling event or person behind. Everything is scoped to the owner.
    """

    def __init__(self, db: Session) -> None:
        self.db = db
        self.events = EventRepository(db)
        self.persons = PersonRepository(db)
        self.transactions = TransactionRepository(db)

    def quick_add(self, data: QuickAddRequest, owner_id: int) -> QuickAddResult:
        try:
            event = self._resolve_event(data.event, owner_id, data.date)
            person = self._resolve_person(data.person, owner_id)
            transaction = Transaction(
                owner_id=owner_id,
                person_id=person.id,
                event_id=event.id,
                amount=data.amount,
                direction=data.direction,
                date=data.date,
            )
            self.transactions.add(transaction)
            # Single commit → the whole quick-add is atomic.
            self.db.commit()
        except Exception:
            # Undo any staged inserts so a failure leaves the DB untouched.
            self.db.rollback()
            raise

        # Reload so server-side defaults (ids, created_at) are populated.
        self.db.refresh(transaction)
        self.db.refresh(event)
        self.db.refresh(person)
        return QuickAddResult(transaction=transaction, event=event, person=person)

    def _resolve_event(
        self, ref: QuickAddEvent, owner_id: int, fallback_date: dt.date
    ) -> Event:
        # Existing event: must belong to the user.
        if ref.id is not None:
            event = self.events.get(ref.id, owner_id)
            if event is None:
                raise self._not_found("Event", ref.id)
            return event

        # New event from the typed name. An event is identified by
        # (owner_id, name, date): reuse one only when BOTH the name and the date
        # match, so the same name on a different date stays a separate event.
        title = ref.name.strip()
        event_date = ref.date or fallback_date
        existing = self.events.get_by_name_and_date(title, event_date, owner_id)
        if existing is not None:
            return existing

        # Otherwise create it, filling the optionals with sensible defaults
        # (type→other, is_mine→False).
        event = Event(
            owner_id=owner_id,
            title=title,
            type=ref.type or EventType.other,
            event_date=event_date,
            is_mine=bool(ref.is_mine),
        )
        return self.events.add(event)

    def _resolve_person(self, ref: QuickAddPerson, owner_id: int) -> Person:
        # Existing person: must belong to the user.
        if ref.id is not None:
            person = self.persons.get(ref.id, owner_id)
            if person is None:
                raise self._not_found("Person", ref.id)
            return person

        # Reuse a same-named person if one already exists; else create one.
        existing = self.persons.get_by_name(ref.name, owner_id)
        if existing is not None:
            return existing
        person = Person(
            owner_id=owner_id,
            full_name=ref.name.strip(),
            relation=Relation.other,
        )
        return self.persons.add(person)

    @staticmethod
    def _not_found(entity: str, entity_id: int) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity} {entity_id} not found",
        )
