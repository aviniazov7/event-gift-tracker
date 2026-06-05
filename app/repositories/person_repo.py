from sqlalchemy import func, select
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

    def add(self, person: Person) -> Person:
        """Stage an insert inside the caller's transaction (flush, NO commit).

        Lets quick-add create a person and its transaction atomically; the flush
        assigns the primary key without committing.
        """
        self.db.add(person)
        self.db.flush()
        return person

    def get(self, person_id: int, owner_id: int) -> Person | None:
        return self.db.scalar(
            select(Person).where(
                Person.id == person_id, Person.owner_id == owner_id
            )
        )

    def get_by_name(self, full_name: str, owner_id: int) -> Person | None:
        """Find one of the owner's people by name, case-insensitively and
        trimmed, so quick-add reuses an existing person instead of duplicating."""
        return self.db.scalar(
            select(Person).where(
                Person.owner_id == owner_id,
                func.lower(Person.full_name) == full_name.strip().lower(),
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

    def count(self, owner_id: int) -> int:
        """How many people the owner has (computed in SQL)."""
        return self.db.scalar(
            select(func.count())
            .select_from(Person)
            .where(Person.owner_id == owner_id)
        )

    def update(self, person: Person) -> Person:
        # `person` is already tracked by the session; commit flushes the changes.
        self.db.commit()
        self.db.refresh(person)
        return person

    def delete(self, person: Person) -> None:
        self.db.delete(person)
        self.db.commit()
