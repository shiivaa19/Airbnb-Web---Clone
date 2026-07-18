from typing import List, Optional, Tuple
from datetime import date
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import Session, joinedload
from app.domains.listing.models import Listing, ListingImage, Amenity, ListingAvailability, listing_amenities
from app.domains.listing.schemas import ListingCreate, ListingUpdate

class ListingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, listing_id: int) -> Optional[Listing]:
        """Fetch a listing by ID, preloading images, amenities, and host profile."""
        return (
            self.db.query(Listing)
            .options(
                joinedload(Listing.images),
                joinedload(Listing.amenities),
                joinedload(Listing.host)
            )
            .filter(Listing.id == listing_id)
            .first()
        )

    def list_listings(
        self,
        category: Optional[str] = None,
        city: Optional[str] = None,
        country: Optional[str] = None,
        guests: Optional[int] = None,
        price_min: Optional[float] = None,
        price_max: Optional[float] = None,
        amenities: Optional[List[str]] = None,
        check_in: Optional[date] = None,
        check_out: Optional[date] = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Listing], int]:
        """Query and filter listings with support for pagination."""
        query = self.db.query(Listing)
        
        # 1. Category Filter
        if category:
            query = query.filter(Listing.category == category)
            
        # 2. Location Filter
        if city:
            query = query.filter(Listing.city.ilike(f"%{city}%"))
        if country:
            query = query.filter(Listing.country.ilike(f"%{country}%"))
            
        # 3. Guest Capacity Filter
        if guests:
            query = query.filter(Listing.max_guests >= guests)
            
        # 4. Price Boundaries
        if price_min is not None:
            query = query.filter(Listing.price_per_night >= price_min)
        if price_max is not None:
            query = query.filter(Listing.price_per_night <= price_max)
            
        # 5. Amenities Filter (AND logic: listing must contain all selected amenities)
        if amenities:
            for amenity_name in amenities:
                query = query.filter(
                    Listing.amenities.any(func.lower(Amenity.name) == amenity_name.lower())
                )
                
        # 6. Dates Availability Filter
        if check_in and check_out:
            # A listing is unavailable if it has any overlapping confirmed bookings,
            # or if it has custom availability blocks marked is_available = False.
            # (We will import Bookings dynamically or check listing_availabilities table)
            # Find listings where any availability block for the check-in range is marked is_available=False
            subquery = (
                self.db.query(ListingAvailability.listing_id)
                .filter(
                    and_(
                        ListingAvailability.date >= check_in,
                        ListingAvailability.date < check_out,
                        ListingAvailability.is_available == False
                    )
                )
            )
            query = query.filter(~Listing.id.in_(subquery))

        total = query.distinct().count()
        listings = (
            query.options(joinedload(Listing.images), joinedload(Listing.amenities))
            .distinct()
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        return listings, total

    def create(self, host_id: int, schema: ListingCreate) -> Listing:
        """Create a listing and associate it with a host and amenities."""
        # Find or create amenities
        db_amenities = []
        for name in schema.amenities:
            db_amenities.append(self.get_or_create_amenity(name))

        db_listing = Listing(
            host_id=host_id,
            title=schema.title,
            description=schema.description,
            category=schema.category,
            price_per_night=schema.price_per_night,
            cleaning_fee=schema.cleaning_fee,
            service_fee=schema.service_fee,
            address=schema.address,
            city=schema.city,
            country=schema.country,
            latitude=schema.latitude,
            longitude=schema.longitude,
            max_guests=schema.max_guests,
            bedrooms=schema.bedrooms,
            beds=schema.beds,
            bathrooms=schema.bathrooms,
            amenities=db_amenities
        )
        self.db.add(db_listing)
        self.db.commit()
        self.db.refresh(db_listing)
        return db_listing

    def update(self, db_listing: Listing, schema: ListingUpdate) -> Listing:
        """Update a listing's metadata and optionally update its amenities."""
        update_data = schema.model_dump(exclude_unset=True)
        amenities = update_data.pop("amenities", None)
        
        for key, value in update_data.items():
            setattr(db_listing, key, value)
            
        if amenities is not None:
            db_amenities = []
            for name in amenities:
                db_amenities.append(self.get_or_create_amenity(name))
            db_listing.amenities = db_amenities
            
        self.db.commit()
        self.db.refresh(db_listing)
        return db_listing

    def delete(self, db_listing: Listing) -> None:
        """Delete a listing from the database."""
        self.db.delete(db_listing)
        self.db.commit()

    def add_image(self, listing_id: int, url: str, is_primary: bool = False, display_order: int = 0) -> ListingImage:
        """Add an image URL to a listing."""
        db_image = ListingImage(
            listing_id=listing_id,
            url=url,
            is_primary=is_primary,
            display_order=display_order
        )
        self.db.add(db_image)
        self.db.commit()
        self.db.refresh(db_image)
        return db_image

    def get_or_create_amenity(self, name: str, icon: str = "wifi") -> Amenity:
        """Helper to get an existing amenity or create it if not found."""
        db_amenity = self.db.query(Amenity).filter(func.lower(Amenity.name) == name.lower()).first()
        if not db_amenity:
            db_amenity = Amenity(name=name, icon=icon)
            self.db.add(db_amenity)
            self.db.commit()
            self.db.refresh(db_amenity)
        return db_amenity

    def get_blocked_dates(self, listing_id: int) -> List[date]:
        """Fetch all dates for a listing that are explicitly marked as unavailable."""
        rows = (
            self.db.query(ListingAvailability.date)
            .filter(
                and_(
                    ListingAvailability.listing_id == listing_id,
                    ListingAvailability.is_available == False
                )
            )
            .all()
        )
        return [row[0] for row in rows]

    def set_availability(self, listing_id: int, target_date: date, is_available: bool, booking_id: Optional[int] = None) -> None:
        """Set availability state for a specific date (create or update record)."""
        availability = (
            self.db.query(ListingAvailability)
            .filter(
                and_(
                    ListingAvailability.listing_id == listing_id,
                    ListingAvailability.date == target_date
                )
            )
            .first()
        )
        
        if availability:
            availability.is_available = is_available
            availability.booking_id = booking_id
        else:
            availability = ListingAvailability(
                listing_id=listing_id,
                date=target_date,
                is_available=is_available,
                booking_id=booking_id
            )
            self.db.add(availability)
            
        self.db.commit()
