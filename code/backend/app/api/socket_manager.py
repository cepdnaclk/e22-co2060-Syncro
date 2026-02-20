# app/api/socket_manager.py
import socketio
from sqlalchemy.orm import Session
from ..models.bid import Bid
from ..database import SessionLocal

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins="*")

@sio.on("submit_bid")
async def handle_bid(sid, data):
    # 1. Extract data from the event [cite: 15]
    request_id = data.get("request_id")
    seller_id = data.get("seller_id")
    amount = data.get("amount")
    
    # 2. Database Operation (Persistence)
    db = SessionLocal()
    try:
        new_bid = Bid(request_id=request_id, seller_id=seller_id, bid_amount=amount)
        db.add(new_bid)
        db.commit() # Save to PostgreSQL 
        db.refresh(new_bid)
        
        # 3. Broadcast to the specific auction "room" 
        # This ensures the Client sees the new bid instantly on their dashboard [cite: 16, 110]
        await sio.emit("update_bid_list", {
            "id": new_bid.id,
            "bid_amount": new_bid.bid_amount,
            "seller_id": new_bid.seller_id,
            "time": str(new_bid.timestamp)
        }, room=f"request_{request_id}")
        
    finally:
        db.close()