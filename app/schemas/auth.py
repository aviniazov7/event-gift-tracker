from pydantic import BaseModel, ConfigDict


class GoogleAuthRequest(BaseModel):
    """The Google ID token (JWT credential) returned by Google Sign-In."""

    credential: str


class UserRead(BaseModel):
    """Public view of the authenticated user."""

    id: int
    email: str
    name: str | None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Issued after a successful Google sign-in."""

    access_token: str
    token_type: str = "bearer"
    user: UserRead
