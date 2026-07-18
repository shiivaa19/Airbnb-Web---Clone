from typing import Optional
from sqlalchemy.orm import Session
from app.domains.user.models import User, HostProfile
from app.domains.user.schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        """Fetch a user by their ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        """Fetch a user by their unique email."""
        return self.db.query(User).filter(User.email == email).first()

    def create(self, schema: UserCreate) -> User:
        """Create and store a new user in the database."""
        hashed_password = get_password_hash(schema.password)
        db_user = User(
            email=schema.email,
            hashed_password=hashed_password,
            first_name=schema.first_name,
            last_name=schema.last_name,
            bio=schema.bio,
            profile_image=schema.profile_image
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        # Every user gets a host profile initialized by default (to support seamless host switching)
        self.create_host_profile(user_id=db_user.id)
        self.db.refresh(db_user)
        return db_user

    def update(self, db_user: User, schema: UserUpdate) -> User:
        """Update a user's details."""
        update_data = schema.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_user, key, value)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def create_host_profile(self, user_id: int) -> HostProfile:
        """Create and link a HostProfile to a user."""
        db_profile = HostProfile(user_id=user_id)
        self.db.add(db_profile)
        self.db.commit()
        self.db.refresh(db_profile)
        return db_profile

    def get_host_profile(self, user_id: int) -> Optional[HostProfile]:
        """Retrieve the host profile for a user."""
        return self.db.query(HostProfile).filter(HostProfile.user_id == user_id).first()
