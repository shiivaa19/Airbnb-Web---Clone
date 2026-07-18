from datetime import date
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user
from app.domains.user.models import User
from app.domains.listing.schemas import ListingResponse
from app.domains.booking.schemas import BookingResponse
from app.domains.listing.models import Listing
from app.domains.booking.models import Booking
from app.domains.listing.service import ListingService
from app.domains.booking.service import BookingService

router = APIRouter()

class RevenueMonth(BaseModel):
    month: str  # e.g., "Jan", "Feb"
    revenue: float

class HostStatsResponse(BaseModel):
    total_listings: int
    active_bookings_count: int
    total_revenue: float
    monthly_revenue: List[RevenueMonth]

@router.get("/listings", response_model=List[ListingResponse])
def get_host_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all listings owned by the authenticated host."""
    list_service = ListingService(db)
    query = db.query(Listing).filter(Listing.host_id == current_user.id)
    listings = query.all()
    
    # Pre-calculate ratings
    for listing in listings:
        listing.rating, listing.review_count = list_service._get_review_aggregates(listing.id)
        
    return listings

@router.get("/bookings", response_model=List[BookingResponse])
def get_host_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all guest bookings made on properties owned by this host."""
    booking_service = BookingService(db)
    return booking_service.repo.list_by_host_id(current_user.id)

@router.get("/dashboard/stats", response_model=HostStatsResponse)
def get_host_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate overall hosting analytics including listings, bookings, and revenue data."""
    # 1. Total Listings
    total_listings = db.query(Listing).filter(Listing.host_id == current_user.id).count()
    
    # 2. Active Bookings Count (non-cancelled and check_out >= today)
    today = date.today()
    active_bookings_count = (
        db.query(Booking)
        .join(Listing)
        .filter(
            Listing.host_id == current_user.id,
            Booking.status != "cancelled",
            Booking.check_out >= today
        )
        .count()
    )
    
    # 3. Total Revenue (sum of booking total_prices for confirmed bookings)
    revenue_query = (
        db.query(func.sum(Booking.total_price))
        .join(Listing)
        .filter(
            Listing.host_id == current_user.id,
            Booking.status != "cancelled"
        )
        .scalar()
    )
    total_revenue = float(revenue_query) if revenue_query is not None else 0.0
    
    # 4. Monthly Revenue breakouts for charts (simulated/extracted from booking check_in dates)
    # We will query and group by month of the check_in date
    # In SQLite, we can use strftime('%m', check_in) to extract month
    monthly_stats = (
        db.query(
            func.strftime("%m", Booking.check_in).label("month_num"),
            func.sum(Booking.total_price).label("month_revenue")
        )
        .join(Listing)
        .filter(
            Listing.host_id == current_user.id,
            Booking.status != "cancelled"
        )
        .group_by("month_num")
        .all()
    )
    
    # Map numbers to abbreviations
    month_names = {
        "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
        "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
        "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
    }
    
    # Populate all months with 0.0 initially to ensure full chart rendering
    revenue_map = {name: 0.0 for name in month_names.values()}
    for month_num, month_rev in monthly_stats:
        m_name = month_names.get(month_num)
        if m_name:
            revenue_map[m_name] = float(month_rev) if month_rev is not None else 0.0
            
    # Flatten map to list of RevenueMonth items
    monthly_revenue = [
        RevenueMonth(month=m, revenue=rev)
        for m, rev in revenue_map.items()
    ]
    
    return HostStatsResponse(
        total_listings=total_listings,
        active_bookings_count=active_bookings_count,
        total_revenue=total_revenue,
        monthly_revenue=monthly_revenue
    )
