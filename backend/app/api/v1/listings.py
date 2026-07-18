import os
import shutil
import uuid
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, Query, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.domains.listing.schemas import ListingCreate, ListingUpdate, ListingResponse, ListingDetailResponse, ListingImageResponse
from app.domains.listing.service import ListingService
from app.api.deps import get_current_user
from app.domains.user.models import User
from app.core.exceptions import ForbiddenException

router = APIRouter()

@router.get("", response_model=List[ListingResponse])
def get_listings(
    category: Optional[str] = None,
    city: Optional[str] = None,
    country: Optional[str] = None,
    guests: Optional[int] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    amenities: Optional[List[str]] = Query(None),
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    skip: int = 0,
    limit: int = 24,
    db: Session = Depends(get_db)
):
    """Retrieve all active listings matching user search criteria."""
    # Support comma-separated amenities string in case the client sends it that way (e.g. ?amenities=wifi,tv)
    processed_amenities = []
    if amenities:
        for a in amenities:
            processed_amenities.extend([item.strip() for item in a.split(",") if item.strip()])
            
    service = ListingService(db)
    listings, _ = service.list_listings(
        category=category,
        city=city,
        country=country,
        guests=guests,
        price_min=price_min,
        price_max=price_max,
        amenities=processed_amenities if processed_amenities else None,
        check_in=check_in,
        check_out=check_out,
        skip=skip,
        limit=limit
    )
    return listings

@router.get("/{id}", response_model=ListingDetailResponse)
def get_listing(id: int, db: Session = Depends(get_db)):
    """Fetch details for a specific listing."""
    service = ListingService(db)
    return service.get_listing_details(id)

@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    schema: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register a new property to host on Airbnb."""
    service = ListingService(db)
    return service.create_listing(current_user.id, schema)

@router.put("/{id}", response_model=ListingResponse)
def update_listing(
    id: int,
    schema: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Modify details of a hosted listing."""
    service = ListingService(db)
    return service.update_listing(current_user.id, id, schema)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a hosted listing from Airbnb."""
    service = ListingService(db)
    service.delete_listing(current_user.id, id)

@router.post("/{id}/images", response_model=ListingImageResponse)
def upload_listing_image(
    id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a photos for a property and save it locally."""
    # Generate unique filename to avoid overlaps
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Save the file to our upload directory
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Build serving URL (this maps to static folder middleware configured in main.py)
    image_url = f"/static/uploads/{filename}"
    
    service = ListingService(db)
    # Default newly uploaded image to primary if it's the first one, or assign an incremental order
    listing = service.get_listing_details(id)
    is_primary = len(listing.images) == 0
    display_order = len(listing.images)
    
    return service.add_image_url(
        host_id=current_user.id,
        listing_id=id,
        url=image_url,
        is_primary=is_primary,
        display_order=display_order
    )
