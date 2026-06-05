from decimal import Decimal

from pydantic import BaseModel

from app.models.event import EventType


class SummaryRead(BaseModel):
    """Aggregate totals across all transactions."""

    total_given: Decimal
    total_received: Decimal
    # net = total_given - total_received (positive => gave more than received).
    net: Decimal


class ReciprocityRead(BaseModel):
    """Per-person giving/receiving balance — the core reciprocity view."""

    person_id: int
    # Money the user GAVE to this person.
    total_given: Decimal
    # Money the user RECEIVED from this person.
    total_received: Decimal
    # balance = total_given - total_received (positive => user is "ahead").
    balance: Decimal


class BiggestGift(BaseModel):
    """The single largest gift recorded (either direction)."""

    amount: Decimal
    person_name: str
    event_title: str


class EventTypeBreakdown(BaseModel):
    """Given/received totals for one category of event."""

    type: EventType
    given: Decimal
    received: Decimal


class TopPerson(BaseModel):
    """One row of the "top people" ranking (by total money exchanged)."""

    person_name: str
    given: Decimal
    received: Decimal
    # net = given - received (positive => user gave this person more).
    net: Decimal


class OverviewRead(BaseModel):
    """Everything the Statistics screen needs, in one scoped payload."""

    total_given: Decimal
    total_received: Decimal
    net: Decimal
    event_count: int
    person_count: int
    gift_count: int
    avg_given: Decimal
    avg_received: Decimal
    biggest_gift: BiggestGift | None
    breakdown_by_event_type: list[EventTypeBreakdown]
    top_people: list[TopPerson]
