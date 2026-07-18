from pydantic import BaseModel

class FavoriteToggleResponse(BaseModel):
    listing_id: int
    status: str  # "added" or "removed"
