from typing import List
from sqlalchemy.orm import Session
from app.domains.favorite.repository import FavoriteRepository
from app.domains.listing.repository import ListingRepository
from app.domains.listing.models import Listing
from app.core.exceptions import ListingNotFoundException

class FavoriteService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = FavoriteRepository(db)
        self.listing_repo = ListingRepository(db)

    def toggle_favorite(self, user_id: int, listing_id: int) -> str:
        """Toggle listing saved state in the user's wishlist."""
        listing = self.listing_repo.get_by_id(listing_id)
        if not listing:
            raise ListingNotFoundException(listing_id)
            
        fav = self.repo.get_favorite(user_id, listing_id)
        if fav:
            self.repo.remove_favorite(fav)
            return "removed"
        else:
            self.repo.add_favorite(user_id, listing_id)
            return "added"

    def list_wishlist(self, user_id: int) -> List[Listing]:
        """Fetch all listings favorited by a user, pre-aggregating rating summaries."""
        # Note: listing ratings are computed dynamically in listing service.
        # We can fetch listings here and map them. Let's do that in the API route, or fetch them here.
        return self.repo.list_favorites_for_user(user_id)
