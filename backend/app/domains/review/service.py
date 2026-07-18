from typing import List
from sqlalchemy.orm import Session
from app.domains.review.repository import ReviewRepository
from app.domains.listing.repository import ListingRepository
from app.domains.review.schemas import ReviewCreate
from app.domains.review.models import Review
from app.core.exceptions import (
    ListingNotFoundException,
    ForbiddenException,
    BookingConflictException
)

class ReviewService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ReviewRepository(db)
        self.listing_repo = ListingRepository(db)

    def create_review(self, author_id: int, schema: ReviewCreate) -> Review:
        """Create a listing review after validating authorization."""
        listing = self.listing_repo.get_by_id(schema.listing_id)
        if not listing:
            raise ListingNotFoundException(schema.listing_id)

        # A host cannot review their own listing
        if listing.host_id == author_id:
            raise ForbiddenException("Hosts cannot write reviews on their own listings.")

        return self.repo.create(author_id, schema)

    def list_reviews_for_listing(self, listing_id: int) -> List[Review]:
        """Fetch all reviews associated with a listing."""
        listing = self.listing_repo.get_by_id(listing_id)
        if not listing:
            raise ListingNotFoundException(listing_id)
        return self.repo.list_by_listing_id(listing_id)

    def delete_review(self, user_id: int, review_id: int) -> None:
        """Delete a review (only the author or listing host can delete it)."""
        review = self.repo.get_by_id(review_id)
        if not review:
            raise ForbiddenException("Review not found or not authorized.")
            
        # Check permissions
        listing = self.listing_repo.get_by_id(review.listing_id)
        if review.author_id != user_id and listing.host_id != user_id:
            raise ForbiddenException("You do not have permission to delete this review.")
            
        self.repo.delete(review)
