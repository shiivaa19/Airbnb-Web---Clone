from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class HostProfileBase(BaseModel):
    is_superhost: bool = False
    response_rate: float = 100.0
    response_time: str = "within an hour"
    identity_verified: bool = True

class HostProfileResponse(HostProfileBase):
    id: int
    user_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    bio: Optional[str] = None
    profile_image: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    host_profile: Optional[HostProfileResponse] = None
    
    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
