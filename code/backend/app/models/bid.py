# app/models/bid.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from datetime import datetime
from ..database import Base

class Bid(Base):
    __tablename__ = "bids"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id")) # Link to Client's RFP [cite: 21]
    seller_id = Column(Integer, ForeignKey("users.id"))     # Link to Seller Profile [cite: 21]
    bid_amount = Column(Float, nullable=False)              # The price offered [cite: 15]
    message = Column(String, nullable=True)                 # Optional seller message [cite: 15]
    timestamp = Column(DateTime, default=datetime.utcnow)