from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.domains.booking.repository import BookingRepository
from app.domains.listing.repository import ListingRepository
from app.domains.booking.schemas import BookingCreate, BookingSummaryResponse
from app.domains.booking.models import Booking
from app.core.exceptions import (
    BookingConflictException,
    ListingNotFoundException,
    BookingNotFoundException,
    ForbiddenException
)

class BookingService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BookingRepository(db)
        self.listing_repo = ListingRepository(db)

    def calculate_summary(self, schema: BookingCreate) -> BookingSummaryResponse:
        """Pre-calculate invoice pricing, guest fee breakouts, and number of nights."""
        listing = self.listing_repo.get_by_id(schema.listing_id)
        if not listing:
            raise ListingNotFoundException(schema.listing_id)
            
        if schema.check_in >= schema.check_out:
            raise BookingConflictException("Check-out date must be after check-in date.")
            
        if schema.guest_count > listing.max_guests:
            raise BookingConflictException(f"Guest count exceeds the listing limit of {listing.max_guests}.")

        nights = (schema.check_out - schema.check_in).days
        base_total = nights * float(listing.price_per_night)
        
        cleaning_fee = float(listing.cleaning_fee)
        service_fee = float(listing.service_fee)
        
        total_price = base_total + cleaning_fee + service_fee
        
        return BookingSummaryResponse(
            listing_id=schema.listing_id,
            check_in=schema.check_in,
            check_out=schema.check_out,
            guest_count=schema.guest_count,
            nights=nights,
            price_per_night=float(listing.price_per_night),
            base_total=base_total,
            cleaning_fee=cleaning_fee,
            service_fee=service_fee,
            total_price=total_price
        )

    def create_booking(self, guest_id: int, schema: BookingCreate) -> Booking:
        """Validate, block dates, and persist a booking."""
        # 1. Compute summary and validate rules
        summary = self.calculate_summary(schema)
        
        # 2. Check for date collision
        has_conflict = self.repo.check_date_conflicts(schema.listing_id, schema.check_in, schema.check_out)
        if has_conflict:
            raise BookingConflictException("The selected dates are no longer available.")
            
        # 3. Create booking
        booking = self.repo.create(guest_id, schema, summary.total_price)
        
        # 4. Block availability table dates
        current_date = schema.check_in
        while current_date < schema.check_out:
            self.listing_repo.set_availability(
                listing_id=schema.listing_id,
                target_date=current_date,
                is_available=False,
                booking_id=booking.id
            )
            current_date += timedelta(days=1)
            
        return booking

    def cancel_booking(self, user_id: int, booking_id: int) -> Booking:
        """Cancel a booking and free up the blocked dates."""
        booking = self.repo.get_by_id(booking_id)
        if not booking:
            raise BookingNotFoundException(booking_id)
            
        # Ensure either guest or listing host is cancelling
        if booking.guest_id != user_id and booking.listing.host_id != user_id:
            raise ForbiddenException("You are not authorized to cancel this booking.")
            
        if booking.status == "cancelled":
            raise BookingConflictException("This booking has already been cancelled.")

        # Update status
        cancelled_booking = self.repo.update_status(booking, "cancelled")
        
        # Free up dates in listing_availabilities table
        current_date = booking.check_in
        while current_date < booking.check_out:
            self.listing_repo.set_availability(
                listing_id=booking.listing_id,
                target_date=current_date,
                is_available=True,
                booking_id=None
            )
            current_date += timedelta(days=1)
            
        return cancelled_booking

    def get_booking_details(self, user_id: int, booking_id: int) -> Booking:
        """Fetch booking specifics, checking permissions."""
        booking = self.repo.get_by_id(booking_id)
        if not booking:
            raise BookingNotFoundException(booking_id)
            
        if booking.guest_id != user_id and booking.listing.host_id != user_id:
            raise ForbiddenException("You are not authorized to view this booking.")
            
        return booking
