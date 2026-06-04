from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.person import Person
from app.repositories.person_repo import PersonRepository
from app.schemas.person import PersonCreate, PersonUpdate


class PersonService:
    """Business logic for persons. Everything is scoped to the current user's
    owner_id; delegates all DB access to the repository."""

    def __init__(self, db: Session) -> None:
        self.repo = PersonRepository(db)

    def create(self, data: PersonCreate, owner_id: int) -> Person:
        person = Person(**data.model_dump(), owner_id=owner_id)
        return self.repo.create(person)

    def list(self, owner_id: int) -> list[Person]:
        return self.repo.list(owner_id)

    def get(self, person_id: int, owner_id: int) -> Person:
        person = self.repo.get(person_id, owner_id)
        if person is None:
            self._not_found(person_id)
        return person

    def update(self, person_id: int, data: PersonUpdate, owner_id: int) -> Person:
        person = self.get(person_id, owner_id)  # reuse the 404 guard
        # Only apply fields the client actually sent (partial update).
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(person, field, value)
        return self.repo.update(person)

    def delete(self, person_id: int, owner_id: int) -> None:
        person = self.get(person_id, owner_id)  # reuse the 404 guard
        self.repo.delete(person)

    @staticmethod
    def _not_found(person_id: int) -> None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Person {person_id} not found",
        )
