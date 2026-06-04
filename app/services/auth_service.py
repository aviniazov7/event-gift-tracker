from fastapi import HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.auth import TokenResponse, UserRead


class AuthService:
    """Verifies Google sign-ins, maps them to users, and issues app JWTs."""

    def __init__(self, db: Session) -> None:
        self.users = UserRepository(db)

    def login_with_google(self, credential: str) -> TokenResponse:
        claims = self._verify_google_token(credential)
        user = self._find_or_create_user(claims)
        return TokenResponse(
            access_token=create_access_token(user.id),
            token_type="bearer",
            user=UserRead.model_validate(user),
        )

    @staticmethod
    def _verify_google_token(credential: str) -> dict:
        """Validate the Google ID token against our client id and return its
        claims. Any failure is surfaced as a 401."""
        try:
            return id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google credential",
            ) from exc

    def _find_or_create_user(self, claims: dict) -> User:
        google_sub = claims["sub"]
        user = self.users.get_by_google_sub(google_sub)
        if user is not None:
            return user
        return self.users.create(
            User(
                google_sub=google_sub,
                email=claims.get("email", ""),
                name=claims.get("name"),
            )
        )
