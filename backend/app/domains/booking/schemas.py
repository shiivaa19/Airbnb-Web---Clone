from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.domains.listing.schemas import ListingResponse

class BookingBase(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guest_count: int

class BookingCreate(BookingBase):
    pass

class BookingResponse(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    total_price: float
    guest_count: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    # Detailed listing relation can be optionally preloaded
    listing: Optional[ListingResponse] = None
    
    model_config = ConfigDict(from_attributes=True)

class BookingSummaryResponse(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guest_count: int
    nights: int
    price_per_night: float
    base_total: float
    cleaning_fee: float
    service_fee: float
    total_price: float
