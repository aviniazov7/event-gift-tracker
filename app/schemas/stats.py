from decimal import Decimal

from pydantic import BaseModel


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
