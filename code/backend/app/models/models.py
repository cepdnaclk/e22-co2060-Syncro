from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Enum, Boolean
import enum
from datetime import datetime
from sqlalchemy.orm import relationship
from ..database import Base

class UserRole(str, enum.Enum):
    CLIENT = "client"
    SELLER = "seller"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    active_role = Column(Enum(UserRole), default=UserRole.CLIENT)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    listings = relationship("Listing", back_populates="owner", cascade="all, delete-orphan")
    bids = relationship("Bid", back_populates="seller", cascade="all, delete-orphan")
    orders_as_buyer = relationship("Order", back_populates="buyer", foreign_keys="Order.buyer_id", cascade="all, delete-orphan")
    orders_as_seller = relationship("Order", back_populates="seller", foreign_keys="Order.seller_id", cascade="all, delete-orphan")
    reviews_given = relationship("Review", back_populates="reviewer", foreign_keys="Review.reviewer_id", cascade="all, delete-orphan")
    reviews_received = relationship("Review", back_populates="reviewee", foreign_keys="Review.reviewee_id", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String, index=True)
    logo = Column(String, nullable=True) # URL
    cover_image = Column(String, nullable=True) # URL
    description = Column(Text, nullable=True)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    website = Column(String, nullable=True)
    
    user = relationship("User", back_populates="profile")

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
    delivery_time = Column(String, nullable=True)
    
    # Relationships
    seller_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    
    owner = relationship("User", back_populates="listings")
    orders = relationship("Order", back_populates="listing")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String, nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    amount = Column(Float, nullable=False)
    has_review = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    buyer_id = Column(Integer, ForeignKey("users.id"))
    seller_id = Column(Integer, ForeignKey("users.id"))
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=True)

    buyer = relationship("User", back_populates="orders_as_buyer", foreign_keys=[buyer_id])
    seller = relationship("User", back_populates="orders_as_seller", foreign_keys=[seller_id])
    listing = relationship("Listing", back_populates="orders")
    review = relationship("Review", back_populates="order", uselist=False)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    order_id = Column(Integer, ForeignKey("orders.id"), unique=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    reviewee_id = Column(Integer, ForeignKey("users.id"))

    order = relationship("Order", back_populates="review")
    reviewer = relationship("User", back_populates="reviews_given", foreign_keys=[reviewer_id])
    reviewee = relationship("User", back_populates="reviews_received", foreign_keys=[reviewee_id])

class Bid(Base):
    __tablename__ = "bids"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    message = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow) 
    request_id = Column(Integer) # For Phase 2 RFP logic 
    seller_id = Column(Integer, ForeignKey("users.id"))
    
    seller = relationship("User", back_populates="bids")