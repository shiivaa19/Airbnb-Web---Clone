from sqlalchemy.orm import Session
from app.domains.user.repository import UserRepository
from app.domains.user.schemas import UserCreate, UserUpdate, UserLogin
from app.domains.user.models import User
from app.core.security import verify_password
from app.core.exceptions import UserAlreadyExistsException, InvalidCredentialsException

class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def register_user(self, schema: UserCreate) -> User:
        """Register a new user if the email isn't already taken."""
        existing_user = self.repo.get_by_email(schema.email)
        if existing_user:
            raise UserAlreadyExistsException(schema.email)
        return self.repo.create(schema)

    def authenticate_user(self, schema: UserLogin) -> User:
        """Authenticate user based on email and password."""
        user = self.repo.get_by_email(schema.email)
        if not user or not verify_password(schema.password, user.hashed_password):
            raise InvalidCredentialsException()
        return user

    def get_user_by_id(self, user_id: int) -> User:
        """Retrieve user profile details by ID."""
        user = self.repo.get_by_id(user_id)
        if not user:
            raise InvalidCredentialsException()
        return user

    def update_user(self, user_id: int, schema: UserUpdate) -> User:
        """Update user profile profile fields."""
        user = self.get_user_by_id(user_id)
        return self.repo.update(user, schema)
