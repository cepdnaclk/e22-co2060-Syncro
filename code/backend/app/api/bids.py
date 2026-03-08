from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import Bid, BidRequest, User, BidRequestStatus, BidStatus
from ..schemas.schemas import BidCreate, BidResponse, BidRequestCreate, BidRequestResponse
from .auth import get_current_user_from_token

router = APIRouter(prefix="/bids", tags=["bids"])

# --- Bid Requests ---

@router.post("/requests", response_model=BidRequestResponse)
def create_bid_request(
    request: BidRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    new_request = BidRequest(
        user_id=current_user.id,
        description=request.description,
        category_id=request.category_id,
        status=BidRequestStatus.OPEN
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.get("/requests", response_model=List[BidRequestResponse])
def get_my_bid_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    return db.query(BidRequest).filter(BidRequest.user_id == current_user.id).all()

@router.get("/requests/matches", response_model=List[BidRequestResponse])
def get_matching_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    if current_user.active_role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can view matching requests")
    
    # In a real app, we'd match based on seller categories. 
    # For now, return all open requests.
    return db.query(BidRequest).filter(BidRequest.status == BidRequestStatus.OPEN).all()

# --- Bids ---

@router.post("/", response_model=BidResponse)
def submit_bid(
    bid: BidCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    if current_user.active_role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can submit bids")
    
    bid_request = db.query(BidRequest).filter(BidRequest.id == bid.bid_request_id).first()
    if not bid_request:
        raise HTTPException(status_code=404, detail="Bid request not found")
    
    if bid_request.status != BidRequestStatus.OPEN:
        raise HTTPException(status_code=400, detail="This request is no longer open for bids")

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
    
    # Only the owner can see bids
    if bid_request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    return db.query(Bid).filter(Bid.bid_request_id == request_id).all()

@router.patch("/{bid_id}/accept", response_model=BidResponse)
def accept_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    bid_request = db.query(BidRequest).filter(BidRequest.id == bid.bid_request_id).first()
    if bid_request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the request owner can accept bids")

    # Update states
    bid.status = BidStatus.ACCEPTED
    bid_request.status = BidRequestStatus.ACCEPTED
    
    # Reject other bids for this request
    db.query(Bid).filter(
        Bid.bid_request_id == bid.bid_request_id,
        Bid.id != bid_id
    ).update({"status": BidStatus.REJECTED})
    
    db.commit()
    db.refresh(bid)
    return bid
