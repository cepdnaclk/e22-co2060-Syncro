# app/models/chat.py
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    is_read = Column(Boolean, default=False)

    # Relationships back to User (referenced by string to avoid circular imports)
    sender = relationship("User", foreign_keys=[sender_id], back_populates="messages_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="messages_received")

    # Composite index so "conversation lookup" (WHERE sender=A AND receiver=B OR ...) is fast
    __table_args__ = (
        Index("ix_messages_conversation", "sender_id", "receiver_id"),
    )