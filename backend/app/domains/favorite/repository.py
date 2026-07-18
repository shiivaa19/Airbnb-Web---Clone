from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.domains.favorite.models import Favorite
from app.domains.listing.models import Listing

class FavoriteRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_favorite(self, user_id: int, listing_id: int) -> Optional[Favorite]:
        """Check if a listing is favorited by a user."""
        return (
            self.db.query(Favorite)
            .filter(Favorite.user_id == user_id, Favorite.listing_id == listing_id)
            .first()
        )

    def add_favorite(self, user_id: int, listing_id: int) -> Favorite:
        """Add a listing to a user's favorites list."""
        db_fav = Favorite(user_id=user_id, listing_id=listing_id)
        self.db.add(db_fav)
        self.db.commit()
        self.db.refresh(db_fav)
        return db_fav

    def remove_favorite(self, favorite: Favorite) -> None:
        """Remove a listing from a user's favorites list."""
        self.db.delete(favorite)
        self.db.commit()

    def list_favorites_for_user(self, user_id: int) -> List[Listing]:
        """Fetch all listings favorited by a user, preloading images and amenities."""
        favorites = (
            self.db.query(Favorite)
            .options(
                joinedload(Favorite.listing).joinedload(Listing.images),
                joinedload(Favorite.listing).joinedload(Listing.amenities)
            )
            .filter(Favorite.user_id == user_id)
            .all()
        )
        return [fav.listing for fav in favorites]
