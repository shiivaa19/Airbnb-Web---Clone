from typing import List, Optional, Tuple
from datetime import date
import urllib.request
import json
import urllib.parse
import random
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.domains.listing.repository import ListingRepository
from app.domains.listing.schemas import ListingCreate, ListingUpdate
from app.domains.listing.models import Listing, ListingImage, Amenity
from app.domains.user.models import User
from app.core.exceptions import ListingNotFoundException, ForbiddenException
from app.domains.review.models import Review

class ListingService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ListingRepository(db)

    def create_listing(self, host_id: int, schema: ListingCreate) -> Listing:
        """Create a listing for a host."""
        return self.repo.create(host_id, schema)

    def update_listing(self, host_id: int, listing_id: int, schema: ListingUpdate) -> Listing:
        """Update a listing after checking host authorization."""
        listing = self.repo.get_by_id(listing_id)
        if not listing:
            raise ListingNotFoundException(listing_id)
        if listing.host_id != host_id:
            raise ForbiddenException("You are not authorized to edit this listing.")
        return self.repo.update(listing, schema)

    def delete_listing(self, host_id: int, listing_id: int) -> None:
        """Delete a listing after checking host authorization."""
        listing = self.repo.get_by_id(listing_id)
        if not listing:
            raise ListingNotFoundException(listing_id)
        if listing.host_id != host_id:
            raise ForbiddenException("You are not authorized to delete this listing.")
        self.repo.delete(listing)

    def get_listing_details(self, listing_id: int) -> Listing:
        """Fetch details of a listing, pre-populating computed ratings and blocked dates."""
        listing = self.repo.get_by_id(listing_id)
        if not listing:
            raise ListingNotFoundException(listing_id)
        
        # Attach computed values
        listing.rating, listing.review_count = self._get_review_aggregates(listing_id)
        listing.blocked_dates = self.repo.get_blocked_dates(listing_id)
        return listing

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
        """Fetch listings matching criteria and inject aggregated ratings and review counts."""
        listings, total = self.repo.list_listings(
            category=category,
            city=city,
            country=country,
            guests=guests,
            price_min=price_min,
            price_max=price_max,
            amenities=amenities,
            check_in=check_in,
            check_out=check_out,
            skip=skip,
            limit=limit
        )
        
        # If no listings were found in database, and a city search parameter exists:
        if not listings and city:
            generated = self._geocode_and_generate_listings(city)
            if generated:
                listings = generated
                total = len(generated)

        for listing in listings:
            listing.rating, listing.review_count = self._get_review_aggregates(listing.id)
            
        return listings, total

    def _geocode_and_generate_listings(self, city_query: str) -> List[Listing]:
        """Call OpenStreetMap Nominatim API to find coordinates and dynamically create 3 bookable listings."""
        url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(city_query)}&format=json&limit=1"
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'AirbubCloneApp/1.0 (srikanthchauhan101@gmail.com)'}
        )
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode('utf-8'))
                if not data:
                    return []
                
                place = data[0]
                lat = float(place["lat"])
                lon = float(place["lon"])
                display_name = place["display_name"]
                
                # Extract country name from display name
                parts = [p.strip() for p in display_name.split(",")]
                country = parts[-1] if parts else "Worldwide"
                
                # Fetch default host to assign
                host = self.db.query(User).filter(User.email == "host@example.com").first()
                if not host:
                    host = self.db.query(User).first()
                if not host:
                    return []
                
                # Fetch base amenities list
                all_amenities = self.db.query(Amenity).all()
                
                generated_listings = []
                
                # Template listings with real unsplash images
                templates = [
                    {
                        "title": f"Luxury Modern Design Loft in {city_query}",
                        "desc": f"Enjoy a premium stay in this designer-decorated apartment located in central {city_query}. Features open-concept layouts, high-speed WiFi, and panoramic windows overlooking the skyline.",
                        "category": "Trending",
                        "price": 280.0,
                        "images": [
                            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
                            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"
                        ]
                    },
                    {
                        "title": f"Scenic Skyline Penthouse with Private Balcony",
                        "desc": f"Breathtaking views of the city await you. This top-floor penthouse features a wrap-around private balcony, fully equipped designer kitchen, and central AC.",
                        "category": "Mansions",
                        "price": 450.0,
                        "images": [
                            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
                            "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800"
                        ]
                    },
                    {
                        "title": f"Cozy Artist Studio Close to Cafes & Metro",
                        "desc": f"A bright, quiet, and fully renovated studio situated in the most trendy neighbourhood of {city_query}. Steps away from local coffee shops, fine dining, and transport options.",
                        "category": "Trending",
                        "price": 160.0,
                        "images": [
                            "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800",
                            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=800"
                        ]
                    }
                ]
                
                for idx, t in enumerate(templates):
                    # Add small random offsets so markers disperse on Leaflet map
                    offset_lat = lat + random.uniform(-0.015, 0.015)
                    offset_lon = lon + random.uniform(-0.015, 0.015)
                    
                    db_listing = Listing(
                        host_id=host.id,
                        title=t["title"],
                        description=t["desc"],
                        category=t["category"],
                        price_per_night=t["price"] + random.randint(-20, 20),
                        cleaning_fee=50.00,
                        service_fee=30.00,
                        address=f"Street {idx + 1}, {city_query}",
                        city=city_query,
                        country=country,
                        latitude=offset_lat,
                        longitude=offset_lon,
                        max_guests=random.randint(2, 6),
                        bedrooms=random.randint(1, 3),
                        beds=random.randint(1, 4),
                        bathrooms=float(random.randint(1, 2)),
                        amenities=random.sample(all_amenities, k=min(len(all_amenities), 6))
                    )
                    self.db.add(db_listing)
                    self.db.flush()
                    
                    # Add images
                    for img_idx, img_url in enumerate(t["images"]):
                        db_image = ListingImage(
                            listing_id=db_listing.id,
                            url=img_url,
                            is_primary=(img_idx == 0),
                            display_order=img_idx
                        )
                        self.db.add(db_image)
                    
                    generated_listings.append(db_listing)
                
                self.db.commit()
                return generated_listings
        except Exception as e:
            print(f"Error geocoding/generating dynamic listings for {city_query}: {e}")
            return []

    def add_image_url(self, host_id: int, listing_id: int, url: str, is_primary: bool = False, display_order: int = 0):
        """Add an image to a listing after checking host authorization."""
        listing = self.repo.get_by_id(listing_id)
        if not listing:
            raise ListingNotFoundException(listing_id)
        if listing.host_id != host_id:
            raise ForbiddenException("You are not authorized to manage images for this listing.")
        return self.repo.add_image(listing_id, url, is_primary, display_order)

    def _get_review_aggregates(self, listing_id: int) -> Tuple[Optional[float], int]:
        """Compute the average rating and review count for a listing."""
        stats = (
            self.db.query(func.avg(Review.rating), func.count(Review.id))
            .filter(Review.listing_id == listing_id)
            .first()
        )
        avg_rating = round(float(stats[0]), 2) if stats[0] is not None else None
        count = stats[1] if stats[1] is not None else 0
        return avg_rating, count
