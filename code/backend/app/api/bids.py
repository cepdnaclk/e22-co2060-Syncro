from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import User, BidRequest, Bid, BidStatus, BidRequestStatus
from ..schemas.schemas import BidCreate, BidResponse
from .auth import get_current_user_from_token

router = APIRouter(prefix="/bids", tags=["bids"])

@router.post("/", response_model=BidResponse)
def submit_bid(
    bid: BidCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user_from_token)
):
    if current_user.active_role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can submit bids")

    # Verify bid request exists and is open
    bid_request = db.query(BidRequest).filter(BidRequest.id == bid.bid_request_id).first()
    if not bid_request:
        raise HTTPException(status_code=404, detail="Bid request not found")
    if bid_request.status != BidRequestStatus.OPEN:
        raise HTTPException(status_code=400, detail="Bid request is no longer open")

    # Prevent duplicate bids from same seller
    existing_bid = db.query(Bid).filter(
        Bid.bid_request_id == bid.bid_request_id, 
        Bid.seller_id == current_user.id
    ).first()
    if existing_bid:
        raise HTTPException(status_code=400, detail="You have already submitted a bid for this request")

    new_bid = Bid(
        bid_request_id=bid.bid_request_id,
        seller_id=current_user.id,
        price=bid.price,
        quantity=bid.quantity,
        delivery_time=bid.delivery_time,
        message=bid.message,
        status=BidStatus.PENDING
    )
    db.add(new_bid)
    db.commit()
    db.refresh(new_bid)
    return new_bid

@router.get("/request/{request_id}", response_model=List[BidResponse])
def get_bids_for_request(
    request_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user_from_token)
):
    bid_request = db.query(BidRequest).filter(BidRequest.id == request_id).first()
    if not bid_request:
        raise HTTPException(status_code=404, detail="Bid request not found")
    
    # Only owner of request or sellers (maybe?) can see bids. 
    # Usually only owner can see all bids. Sellers see their own?
    # Let's restrict to owner for now to match custom offer style.
    if bid_request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only view bids for your own requests")

    return db.query(Bid).filter(Bid.bid_request_id == request_id).order_by(Bid.created_at.desc()).all()

@router.patch("/{bid_id}/status", response_model=BidResponse)
def update_bid_status(
    bid_id: int, 
    status: BidStatus,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user_from_token)
):
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    bid_request = db.query(BidRequest).filter(BidRequest.id == bid.bid_request_id).first()
    if bid_request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the request owner can change bid status")

    if status == BidStatus.ACCEPTED:
        # Close the request and accept this bid
        bid.status = BidStatus.ACCEPTED
        bid_request.status = BidRequestStatus.ACCEPTED
        
        # Reject all other pending bids
        db.query(Bid).filter(
            Bid.bid_request_id == bid.bid_request_id, 
            Bid.id != bid_id,
            Bid.status == BidStatus.PENDING
        ).update({"status": BidStatus.REJECTED})
    else:
        bid.status = status

    db.commit()
    db.refresh(bid)
    return bid
