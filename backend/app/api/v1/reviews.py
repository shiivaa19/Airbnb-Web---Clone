from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.domains.review.schemas import ReviewCreate, ReviewResponse
from app.domains.review.service import ReviewService
from app.api.deps import get_current_user
from app.domains.user.models import User

router = APIRouter()

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    schema: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Publish a review and rating for a listing."""
    service = ReviewService(db)
    return service.create_review(current_user.id, schema)

@router.get("/listing/{listing_id}", response_model=List[ReviewResponse])
def get_listing_reviews(
    listing_id: int,
    db: Session = Depends(get_db)
):
    """Fetch all reviews for a listing, ordered by date."""
    service = ReviewService(db)
    return service.list_reviews_for_listing(listing_id)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a review from a listing."""
    service = ReviewService(db)
    service.delete_review(current_user.id, id)
