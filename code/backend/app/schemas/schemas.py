from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

# Base schema for shared attributes
class BidBase(BaseModel):
    bid_amount: float = Field(..., gt=0, description="Bid must be greater than 0") [cite: 106]
    message: Optional[str] = Field(None, max_length=500)

# Schema for creating a new bid (Input validation)
class BidCreate(BidBase):
    request_id: int
    seller_id: int

# Schema for reading a bid (Output formatting)
class BidResponse(BidBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True # Allows compatibility with SQLAlchemy models [cite: 55]