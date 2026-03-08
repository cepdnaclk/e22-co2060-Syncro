from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import User, BidRequest, BidRequestStatus, Category
from ..schemas.schemas import BidRequestCreate, BidRequestResponse
from .auth import get_current_user_from_token

router = APIRouter(prefix="/bid-requests", tags=["bid-requests"])

@router.post("/", response_model=BidRequestResponse)
def create_bid_request(
    request: BidRequestCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user_from_token)
):
    # Verify category exists
    category = db.query(Category).filter(Category.id == request.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

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

@router.get("/", response_model=List[BidRequestResponse])
def get_my_bid_requests(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user_from_token)
):
    return db.query(BidRequest).filter(BidRequest.user_id == current_user.id).order_by(BidRequest.created_at.desc()).all()

@router.get("/matching", response_model=List[BidRequestResponse])
def get_matching_bid_requests(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user_from_token)
):
    # For now, return all OPEN requests. 
    # In a real system, we'd filter by seller's categories.
    if current_user.active_role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can view matching requests")
        
    return db.query(BidRequest).filter(BidRequest.status == BidRequestStatus.OPEN).order_by(BidRequest.created_at.desc()).all()

@router.get("/{request_id}", response_model=BidRequestResponse)
def get_bid_request(
    request_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user_from_token)
):
    bid_request = db.query(BidRequest).filter(BidRequest.id == request_id).first()
    if not bid_request:
        raise HTTPException(status_code=404, detail="Bid request not found")
    return bid_request
