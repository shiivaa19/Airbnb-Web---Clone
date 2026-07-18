from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.domains.booking.schemas import BookingCreate, BookingResponse, BookingSummaryResponse
from app.domains.booking.service import BookingService
from app.api.deps import get_current_user
from app.domains.user.models import User

router = APIRouter()

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    schema: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Book a listing for specified check-in and check-out dates."""
    service = BookingService(db)
    return service.create_booking(current_user.id, schema)

@router.post("/calculate-summary", response_model=BookingSummaryResponse)
def calculate_checkout_summary(
    schema: BookingCreate,
    db: Session = Depends(get_db)
):
    """Pre-calculate nights, fees, and total checkout price before booking."""
    service = BookingService(db)
    return service.calculate_summary(schema)

@router.get("/my-trips", response_model=List[BookingResponse])
def get_my_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all trips (bookings) made by the current authenticated guest."""
    service = BookingService(db)
    return service.repo.list_by_guest_id(current_user.id)

@router.get("/{id}", response_model=BookingResponse)
def get_booking_details(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch billing and scheduling details for a specific reservation."""
    service = BookingService(db)
    return service.get_booking_details(current_user.id, id)

@router.post("/{id}/cancel", response_model=BookingResponse)
def cancel_booking(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel an active booking and release the blocked dates."""
    service = BookingService(db)
    return service.cancel_booking(current_user.id, id)
