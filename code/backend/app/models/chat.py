# app/models/chat.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from datetime import datetime
from ..database import Base

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    order_id = Column(Integer, ForeignKey("orders.id")) # Links chat to a specific transaction
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow) 
    is_read = Column(Boolean, default=False)