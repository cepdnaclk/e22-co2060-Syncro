# app/models/user.py
from sqlalchemy import Column, Integer, String, Enum
import enum
from ..database import Base

class UserRole(str, enum.Enum):
    CLIENT = "client"
    SELLER = "seller"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # This tracks the user's CURRENT active mode 
    active_role = Column(Enum(UserRole), default=UserRole.CLIENT)