from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.person import Person


class PersonRepository:
    """Pure database access for persons — no business logic, no HTTP concerns.

    Every read is scoped to an owner_id so users only ever see their own data.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, person: Person) -> Person:
        # owner_id is set on the model by the service before this is called.
        self.db.add(person)
        self.db.commit()
        self.db.refresh(person)
        return person

    def get(self, person_id: int, owner_id: int) -> Person | None:
        return self.db.scalar(
            select(Person).where(
                Person.id == person_id, Person.owner_id == owner_id
            )
        )

    def list(self, owner_id: int) -> list[Person]:
        return list(
            self.db.scalars(
                select(Person)
                .where(Person.owner_id == owner_id)
                .order_by(Person.id)
            )
        )

    def update(self, person: Person) -> Person:
        # `person` is already tracked by the session; commit flushes the changes.
        self.db.commit()
        self.db.refresh(person)
        return person

    def delete(self, person: Person) -> None:
        self.db.delete(person)
        self.db.commit()
