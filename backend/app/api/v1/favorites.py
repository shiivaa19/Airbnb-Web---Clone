from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.domains.favorite.schemas import FavoriteToggleResponse
from app.domains.listing.schemas import ListingResponse
from app.domains.favorite.service import FavoriteService
from app.domains.listing.service import ListingService
from app.api.deps import get_current_user
from app.domains.user.models import User

router = APIRouter()

@router.post("/{listing_id}", response_model=FavoriteToggleResponse)
def toggle_favorite(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save or unsave a listing in the user's wishlist."""
    service = FavoriteService(db)
    status = service.toggle_favorite(current_user.id, listing_id)
    return {
        "listing_id": listing_id,
        "status": status
    }

@router.get("", response_model=List[ListingResponse])
def get_my_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all properties added to the user's favorites list."""
    fav_service = FavoriteService(db)
    list_service = ListingService(db)
    
    # Load listings
    listings = fav_service.list_wishlist(current_user.id)
    
    # Inject computed rating aggregates
    for listing in listings:
        listing.rating, listing.review_count = list_service._get_review_aggregates(listing.id)
        
    return listings
