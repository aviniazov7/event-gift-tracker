from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.person import Person
from app.repositories.person_repo import PersonRepository
from app.schemas.person import PersonCreate, PersonUpdate


class PersonService:
    """Business logic for persons. Translates domain rules (e.g. "must exist")
    into the right outcomes and delegates all DB access to the repository."""

    def __init__(self, db: Session) -> None:
        self.repo = PersonRepository(db)

    def create(self, data: PersonCreate) -> Person:
        person = Person(**data.model_dump())
        return self.repo.create(person)

    def list(self) -> list[Person]:
        return self.repo.list()

    def get(self, person_id: int) -> Person:
        person = self.repo.get(person_id)
        if person is None:
            self._not_found(person_id)
        return person

    def update(self, person_id: int, data: PersonUpdate) -> Person:
        person = self.get(person_id)  # reuse the 404 guard
        # Only apply fields the client actually sent (partial update).
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(person, field, value)
        return self.repo.update(person)

    def delete(self, person_id: int) -> None:
        person = self.get(person_id)  # reuse the 404 guard
        self.repo.delete(person)

    @staticmethod
    def _not_found(person_id: int) -> None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Person {person_id} not found",
        )
