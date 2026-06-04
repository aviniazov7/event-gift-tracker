from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.person import PersonCreate, PersonRead, PersonUpdate
from app.schemas.stats import ReciprocityRead
from app.services.person_service import PersonService
from app.services.stats_service import StatsService

router = APIRouter(prefix="/persons", tags=["persons"])


def get_service(db: Session = Depends(get_db)) -> PersonService:
    """Provide a request-scoped PersonService wired to the DB session."""
    return PersonService(db)


def get_stats_service(db: Session = Depends(get_db)) -> StatsService:
    """Reciprocity is reporting logic, so it lives in StatsService even though
    the route is nested under a person."""
    return StatsService(db)


@router.get("", response_model=list[PersonRead])
def list_persons(
    service: PersonService = Depends(get_service),
    current_user: User = Depends(get_current_user),
) -> list[PersonRead]:
    return service.list(current_user.id)


@router.post("", response_model=PersonRead, status_code=status.HTTP_201_CREATED)
def create_person(
    payload: PersonCreate,
    service: PersonService = Depends(get_service),
    current_user: User = Depends(get_current_user),
) -> PersonRead:
    return service.create(payload, current_user.id)


@router.get("/{person_id}", response_model=PersonRead)
def get_person(
    person_id: int,
    service: PersonService = Depends(get_service),
    current_user: User = Depends(get_current_user),
) -> PersonRead:
    return service.get(person_id, current_user.id)


@router.put("/{person_id}", response_model=PersonRead)
def update_person(
    person_id: int,
    payload: PersonUpdate,
    service: PersonService = Depends(get_service),
    current_user: User = Depends(get_current_user),
) -> PersonRead:
    return service.update(person_id, payload, current_user.id)


@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_person(
    person_id: int,
    service: PersonService = Depends(get_service),
    current_user: User = Depends(get_current_user),
) -> None:
    service.delete(person_id, current_user.id)


@router.get("/{person_id}/reciprocity", response_model=ReciprocityRead)
def get_person_reciprocity(
    person_id: int,
    service: StatsService = Depends(get_stats_service),
    current_user: User = Depends(get_current_user),
) -> ReciprocityRead:
    return service.reciprocity(person_id, current_user.id)
