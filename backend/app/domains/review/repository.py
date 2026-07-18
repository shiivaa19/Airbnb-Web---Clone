from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.domains.review.models import Review
from app.domains.review.schemas import ReviewCreate

class ReviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, review_id: int) -> Optional[Review]:
        """Fetch a single review by its ID."""
        return self.db.query(Review).filter(Review.id == review_id).first()

    def list_by_listing_id(self, listing_id: int) -> List[Review]:
        """Fetch all reviews for a listing, preloading author profiles."""
        return (
            self.db.query(Review)
            .options(joinedload(Review.author))
            .filter(Review.listing_id == listing_id)
            .order_by(Review.created_at.desc())
            .all()
        )

    def create(self, author_id: int, schema: ReviewCreate) -> Review:
        """Create and store a listing review."""
        db_review = Review(
            listing_id=schema.listing_id,
            author_id=author_id,
            rating=schema.rating,
            comment=schema.comment
        )
        self.db.add(db_review)
        self.db.commit()
        self.db.refresh(db_review)
        return db_review

    def delete(self, db_review: Review) -> None:
        """Delete a review."""
        self.db.delete(db_review)
        self.db.commit()
