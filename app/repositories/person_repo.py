from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.person import Person


class PersonRepository:
    """Pure database access for persons — no business logic, no HTTP concerns."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, person: Person) -> Person:
        self.db.add(person)
        self.db.commit()
        self.db.refresh(person)
        return person

    def get(self, person_id: int) -> Person | None:
        return self.db.get(Person, person_id)

    def list(self) -> list[Person]:
        return list(self.db.scalars(select(Person).order_by(Person.id)))

    def update(self, person: Person) -> Person:
        # `person` is already tracked by the session; commit flushes the changes.
        self.db.commit()
        self.db.refresh(person)
        return person

    def delete(self, person: Person) -> None:
        self.db.delete(person)
        self.db.commit()
