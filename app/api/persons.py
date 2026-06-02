from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.person import PersonCreate, PersonRead, PersonUpdate
from app.services.person_service import PersonService

router = APIRouter(prefix="/persons", tags=["persons"])


def get_service(db: Session = Depends(get_db)) -> PersonService:
    """Provide a request-scoped PersonService wired to the DB session."""
    return PersonService(db)


@router.get("", response_model=list[PersonRead])
def list_persons(service: PersonService = Depends(get_service)) -> list[PersonRead]:
    return service.list()


@router.post("", response_model=PersonRead, status_code=status.HTTP_201_CREATED)
def create_person(
    payload: PersonCreate, service: PersonService = Depends(get_service)
) -> PersonRead:
    return service.create(payload)


@router.get("/{person_id}", response_model=PersonRead)
def get_person(
    person_id: int, service: PersonService = Depends(get_service)
) -> PersonRead:
    return service.get(person_id)


@router.put("/{person_id}", response_model=PersonRead)
def update_person(
    person_id: int,
    payload: PersonUpdate,
    service: PersonService = Depends(get_service),
) -> PersonRead:
    return service.update(person_id, payload)


@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_person(
    person_id: int, service: PersonService = Depends(get_service)
) -> None:
    service.delete(person_id)
