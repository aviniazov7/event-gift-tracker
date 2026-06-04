from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    """Pure database access for users — no business logic, no HTTP concerns."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def get_by_google_sub(self, google_sub: str) -> User | None:
        return self.db.scalar(select(User).where(User.google_sub == google_sub))

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
