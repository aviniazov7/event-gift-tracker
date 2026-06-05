from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.event import EventRead
from app.schemas.person import PersonRead
from app.schemas.quick_add import QuickAddRequest, QuickAddResponse
from app.schemas.transaction import TransactionRead
from app.services.quick_add_service import QuickAddService

router = APIRouter(prefix="/quick-add", tags=["quick-add"])


def get_service(db: Session = Depends(get_db)) -> QuickAddService:
    """Provide a request-scoped QuickAddService wired to the DB session."""
    return QuickAddService(db)


@router.post(
    "", response_model=QuickAddResponse, status_code=status.HTTP_201_CREATED
)
def quick_add(
    payload: QuickAddRequest,
    service: QuickAddService = Depends(get_service),
    current_user: User = Depends(get_current_user),
) -> QuickAddResponse:
    # The service does the atomic find-or-create + create in one transaction;
    # the router just assembles the combined response.
    result = service.quick_add(payload, current_user.id)
    return QuickAddResponse(
        transaction=TransactionRead.model_validate(result.transaction),
        event=EventRead.model_validate(result.event),
        person=PersonRead.model_validate(result.person),
    )
