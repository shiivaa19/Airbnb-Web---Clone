from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.domains.user.schemas import UserResponse

class ReviewBase(BaseModel):
    listing_id: int
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5 stars")
    comment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    author_id: int
    created_at: datetime
    author: UserResponse
    
    model_config = ConfigDict(from_attributes=True)
