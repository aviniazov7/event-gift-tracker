from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.stats import SummaryRead
from app.services.stats_service import StatsService

router = APIRouter(prefix="/stats", tags=["stats"])


def get_service(db: Session = Depends(get_db)) -> StatsService:
    """Provide a request-scoped StatsService wired to the DB session."""
    return StatsService(db)


@router.get("/summary", response_model=SummaryRead)
def get_summary(
    service: StatsService = Depends(get_service),
    current_user: User = Depends(get_current_user),
) -> SummaryRead:
    return service.summary(current_user.id)
