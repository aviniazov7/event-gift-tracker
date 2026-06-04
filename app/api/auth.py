from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import GoogleAuthRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_service(db: Session = Depends(get_db)) -> AuthService:
    """Provide a request-scoped AuthService wired to the DB session."""
    return AuthService(db)


@router.post("/google", response_model=TokenResponse)
def login_with_google(
    payload: GoogleAuthRequest, service: AuthService = Depends(get_service)
) -> TokenResponse:
    return service.login_with_google(payload.credential)
