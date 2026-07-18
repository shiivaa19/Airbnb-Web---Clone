from fastapi import APIRouter
from app.api.v1 import auth, listings, bookings, favorites, host, reviews, ai

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(listings.router, prefix="/listings", tags=["listings"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(favorites.router, prefix="/favorites", tags=["favorites"])
api_router.include_router(host.router, prefix="/host", tags=["host"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
