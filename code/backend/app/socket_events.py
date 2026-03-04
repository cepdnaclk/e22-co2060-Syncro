# app/socket_events.py
from .database import SessionLocal
from .models import Bid

@sio.on("submit_bid")
async def handle_bid_submission(sid, data):
    # data: {"request_id": 101, "seller_id": 5, "amount": 250.0, "message": "Can do!"}
    
    db = SessionLocal()
    try:
        # 1. PERSISTENCE: Save the bid to PostgreSQL [cite: 21, 80]
        new_bid = Bid(**data)
        db.add(new_bid)
        db.commit()
        db.refresh(new_bid)

        # 2. BROADCAST: Emit to the specific RFP room so the Client sees it [cite: 22, 112]
        await sio.emit("new_bid_notification", {
            "bid_id": new_bid.id,
            "amount": new_bid.amount,
            "seller_id": new_bid.seller_id,
            "time": str(new_bid.created_at)
        }, room=f"rfp_{data['request_id']}")
        
    finally:
        db.close()