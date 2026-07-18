from typing import List, Optional
from datetime import date
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session, joinedload
from app.domains.booking.models import Booking
from app.domains.listing.models import Listing, ListingAvailability
from app.domains.booking.schemas import BookingCreate

class BookingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, booking_id: int) -> Optional[Booking]:
        """Retrieve booking by ID with preloaded listing relationship."""
        return (
            self.db.query(Booking)
            .options(joinedload(Booking.listing).joinedload(Listing.images))
            .filter(Booking.id == booking_id)
            .first()
        )

    def list_by_guest_id(self, guest_id: int) -> List[Booking]:
        """Fetch all bookings created by a specific guest, ordered by date."""
        return (
            self.db.query(Booking)
            .options(joinedload(Booking.listing).joinedload(Listing.images))
            .filter(Booking.guest_id == guest_id)
            .order_by(Booking.check_in.desc())
            .all()
        )

    def list_by_host_id(self, host_id: int) -> List[Booking]:
        """Fetch bookings made on listings owned by a specific host."""
        return (
            self.db.query(Booking)
            .join(Listing)
            .options(joinedload(Booking.listing).joinedload(Listing.images))
            .filter(Listing.host_id == host_id)
            .order_by(Booking.check_in.desc())
            .all()
        )

    def create(self, guest_id: int, schema: BookingCreate, total_price: float) -> Booking:
        """Persist a new booking in the database."""
        db_booking = Booking(
            listing_id=schema.listing_id,
            guest_id=guest_id,
            check_in=schema.check_in,
            check_out=schema.check_out,
            total_price=total_price,
            guest_count=schema.guest_count,
            status="confirmed"
        )
        self.db.add(db_booking)
        self.db.commit()
        self.db.refresh(db_booking)
        return db_booking

    def update_status(self, db_booking: Booking, status: str) -> Booking:
        """Update a booking's status (e.g. cancelled)."""
        db_booking.status = status
        self.db.commit()
        self.db.refresh(db_booking)
        return db_booking

    def check_date_conflicts(self, listing_id: int, check_in: date, check_out: date) -> bool:
        """Check if check-in/out dates overlap with existing confirmed bookings,
        or if any day is explicitly marked as unavailable in the listing availability system.
        """
        # 1. Overlapping Bookings Check
        overlap_booking = (
            self.db.query(Booking)
            .filter(
                and_(
                    Booking.listing_id == listing_id,
                    Booking.status != "cancelled",
                    Booking.check_in < check_out,
                    Booking.check_out > check_in
                )
            )
            .first()
        )
        if overlap_booking:
            return True

        # 2. Blocked Dates Check
        blocked_day = (
            self.db.query(ListingAvailability)
            .filter(
                and_(
                    ListingAvailability.listing_id == listing_id,
                    ListingAvailability.date >= check_in,
                    ListingAvailability.date < check_out,
                    ListingAvailability.is_available == False
                )
            )
            .first()
        )
        if blocked_day:
            return True

        return False
