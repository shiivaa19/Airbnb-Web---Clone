from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import NotAuthenticatedException
from app.domains.user.repository import UserRepository
from app.domains.user.models import User

# Define the HTTP Bearer scheme
reusable_oauth2 = HTTPBearer()

def get_current_user(
    db: Session = Depends(get_db),
    token_credentials: HTTPAuthorizationCredentials = Depends(reusable_oauth2)
) -> User:
    """Dependency to extract the current authenticated user from the JWT bearer token.
    Raises 401 Unauthorized if the token is invalid or expired.
    """
    token = token_credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise NotAuthenticatedException()
    except JWTError:
        raise NotAuthenticatedException()
        
    repo = UserRepository(db)
    user = repo.get_by_id(int(user_id))
    if not user:
        raise NotAuthenticatedException()
        
    return user
