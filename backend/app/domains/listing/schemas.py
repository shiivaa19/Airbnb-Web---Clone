from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.domains.user.schemas import UserResponse

class AmenityBase(BaseModel):
    name: str
    icon: str

class AmenityCreate(AmenityBase):
    pass

class AmenityResponse(AmenityBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

class ListingImageBase(BaseModel):
    url: str
    is_primary: bool = False
    display_order: int = 0

class ListingImageCreate(ListingImageBase):
    pass

class ListingImageResponse(ListingImageBase):
    id: int
    listing_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ListingBase(BaseModel):
    title: str
    description: str
    category: str
    price_per_night: float
    cleaning_fee: float = 0.0
    service_fee: float = 0.0
    address: str
    city: str
    country: str
    latitude: float
    longitude: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float

class ListingCreate(ListingBase):
    amenities: List[str] = []  # List of amenity names

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price_per_night: Optional[float] = None
    cleaning_fee: Optional[float] = None
    service_fee: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[float] = None
    amenities: Optional[List[str]] = None

class ListingResponse(ListingBase):
    id: int
    host_id: int
    created_at: datetime
    updated_at: datetime
    images: List[ListingImageResponse] = []
    amenities: List[AmenityResponse] = []
    
    # Computed rating summary
    rating: Optional[float] = None
    review_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)

class ListingDetailResponse(ListingResponse):
    host: UserResponse
    blocked_dates: List[date] = []
    
    model_config = ConfigDict(from_attributes=True)
