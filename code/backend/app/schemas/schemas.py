from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, List

# --- Auth & Users ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: str
    last_name: str
    location: str
    phone_number: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str
    first_name: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    location: Optional[str] = None
    phone_number: Optional[str] = None
    active_role: str

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    location: Optional[str] = None
    phone_number: Optional[str] = None

# --- Bids & Bid Requests ---
class BidRequestBase(BaseModel):
    description: str
    category_id: Optional[int] = None
    # Buyer-specified delivery/service location (collected by AI assistant or manual form)
    location: Optional[str] = None

class BidRequestCreate(BidRequestBase):
    pass

class BidRequestResponse(BidRequestBase):
    id: int
    user_id: int
    status: str
    bid_count: int
    resend_round: int
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

class BidBase(BaseModel):
    price: float = Field(..., gt=0)
    quantity: int = Field(1, ge=1)
    delivery_time: Optional[str] = None
    message: Optional[str] = None

class BidCreate(BidBase):
    bid_request_id: int

class BidResponse(BidBase):
    id: int
    bid_request_id: int
    seller_id: int
    seller_name: Optional[str] = None
    seller_logo: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Profiles ---
class ProfileBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    logo: Optional[str] = None
    cover_image: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    logo: Optional[str] = None
    cover_image: Optional[str] = None

class ActiveStatusUpdate(BaseModel):
    is_active: bool

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    logo: Optional[str] = None
    cover_image: Optional[str] = None
    is_active: Optional[bool] = True

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
    payment_method: Optional[str] = "card"
    payment_slip_url: Optional[str] = None

class OrderCreate(OrderBase):
    seller_id: int
    listing_id: Optional[int] = None

class OrderResponse(OrderBase):
    id: int
    buyer_id: int
    seller_id: int
    buyer_name: Optional[str] = None
    seller_name: Optional[str] = None
    listing_id: Optional[int]
    status: str
    payment_method: Optional[str] = None
    payment_slip_url: Optional[str] = None
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
class MessageCreate(BaseModel):
    receiver_id: int
    content: str
    order_id: Optional[int] = None

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    order_id: Optional[int] = None
    content: str
    timestamp: datetime
    is_read: bool
    sender_name: Optional[str] = None

    class Config:
        from_attributes = True

class ConversationSummary(BaseModel):
    other_user_id: int
    other_user_name: str
    other_user_initials: str
    last_message: str
    last_message_time: datetime
    unread_count: int