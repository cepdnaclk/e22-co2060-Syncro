from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, List

# --- Auth & Users ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str
    first_name: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Bids ---
class BidBase(BaseModel):
    bid_amount: float = Field(..., gt=0, description="Bid must be greater than 0")
    message: Optional[str] = Field(None, max_length=500)

class BidCreate(BidBase):
    request_id: int
    seller_id: int

class BidResponse(BidBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Profiles ---
class ProfileBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    name: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    logo: Optional[str] = None
    cover_image: Optional[str] = None

    class Config:
        from_attributes = True

# --- Listings ---
class ListingBase(BaseModel):
    title: str
    description: str
    price: float
    delivery_time: Optional[str] = None

class ListingCreate(ListingBase):
    category_id: int

class ListingResponse(ListingBase):
    id: int
    seller_id: int
    category_id: int
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

# --- Orders ---
class OrderBase(BaseModel):
    service_name: str
    amount: float

class OrderCreate(OrderBase):
    seller_id: int
    listing_id: Optional[int] = None

class OrderResponse(OrderBase):
    id: int
    buyer_id: int
    seller_id: int
    listing_id: Optional[int]
    status: str
    has_review: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Reviews ---
class ReviewBase(BaseModel):
    rating: float = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass # order_id and reviewee_id will be derived

class ReviewResponse(ReviewBase):
    id: int
    order_id: int
    reviewer_id: int
    reviewee_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Messages ---
class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    order_id: Optional[int] = None
    content: str
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True