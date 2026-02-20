from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Enum
import enum
from datetime import datetime
from ..database import Base

class UserRole(str, enum.Enum):
    CLIENT = "client"
    SELLER = "seller"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    active_role = Column(Enum(UserRole), default=UserRole.CLIENT)

    listings = relationship("Listing", back_populates="owner")
    bids = relationship("Bid", back_populates="seller")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # e.g., "Catering", "Tutoring"

class Listing(Base):
    __tablename__ = "listings"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    image_url = Column(String, nullable=True) # Cloudinary URL
    
    # Relationships
    seller_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    
    owner = relationship("User", back_populates="listings")

class Bid(Base):
    __tablename__ = "bids"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    message = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow) 
    request_id = Column(Integer) # For Phase 2 RFP logic 
    seller_id = Column(Integer, ForeignKey("users.id"))
    
    seller = relationship("User", back_populates="bids")