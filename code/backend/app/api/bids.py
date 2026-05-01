from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import Bid, BidRequest, User, BidRequestStatus, BidStatus
from ..schemas.schemas import BidCreate, BidResponse, BidRequestCreate, BidRequestResponse
from .auth import get_current_user_from_token

router = APIRouter(prefix="/bids", tags=["bids"])

# --- Bid Requests ---

@router.post("/requests", response_model=BidRequestResponse)
async def create_bid_request(
    request: BidRequestCreate,
    fastapi_req: Request,
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
    
    # --- Notification Logic for Matching Sellers ---
    from ..models.models import Category, Profile, Listing, UserRole, Notification
    import re
    
    def get_keywords(text):
        if not text: return set()
        words = re.findall(r'\b\w+\b', text.lower())
        stop_words = {"a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "of", "is", "are", "was", "were", "i", "we", "you", "they", "it", "this", "that", "want", "need", "looking", "buy", "sell", "get", "make", "some", "any"}
        return {w for w in words if w not in stop_words and len(w) > 2}
        
    # Get request keywords
    category = db.query(Category).filter(Category.id == request.category_id).first() if request.category_id else None
    cat_name = category.name if category else ""
    request_text = f"{cat_name} {request.description or ''}"
    req_keywords = get_keywords(request_text)
    
    # Get all users who are sellers
    sellers = db.query(User).filter(User.active_role == UserRole.SELLER, User.id != current_user.id).all()
    
    matched_seller_ids = set()
    
    for seller in sellers:
        # Check if seller has a listing in this category
        if request.category_id:
            has_listing = db.query(Listing).filter(
                Listing.seller_id == seller.id,
                Listing.category_id == request.category_id
            ).first()
            if has_listing:
                matched_seller_ids.add(seller.id)
                continue
                
        # Check if seller profile keywords overlap
        profile = db.query(Profile).filter(Profile.user_id == seller.id).first()
        profile_text = f"{profile.name or ''} {profile.description or ''}" if profile else ""
        prof_keywords = get_keywords(profile_text)
        
        if req_keywords.intersection(prof_keywords):
            matched_seller_ids.add(seller.id)
            
    # Create notifications and emit for matched sellers
    buyer_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or "A buyer"
    
    for seller_id in matched_seller_ids:
        new_notif = Notification(
            user_id=seller_id,
            title="New Matching Request",
            message=f"{buyer_name} has posted a new request that matches your profile: '{request.description[:50]}...'",
            type="new_request",
            reference_id=new_request.id
        )
        db.add(new_notif)
        db.commit()
        db.refresh(new_notif)
        
        try:
            sio = fastapi_req.app.state.sio
            await sio.emit("new_notification", {
                "id": new_notif.id,
                "title": new_notif.title,
                "text": new_notif.message,
                "time": "Just now",
                "unread": not new_notif.is_read,
                "type": new_notif.type,
                "reference_id": new_notif.reference_id
            }, room=f"user_{seller_id}")
        except Exception as e:
            print(f"Failed to send notification to seller {seller_id}: {e}")
    
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
    
    # We want requests where:
    # 1. The request's category_id is in the seller's listing categories
    # OR 2. The request's keywords overlap with the seller's profile keywords
    
    from ..models.models import Category, Profile, Listing
    import re
    
    def get_keywords(text):
        if not text: return set()
        words = re.findall(r'\b\w+\b', text.lower())
        stop_words = {"a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "of", "is", "are", "was", "were", "i", "we", "you", "they", "it", "this", "that", "want", "need", "looking", "buy", "sell", "get", "make", "some", "any"}
        return {w for w in words if w not in stop_words and len(w) > 2}
    
    # Get the seller's profile text keywords
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    profile_text = f"{profile.name or ''} {profile.description or ''}" if profile else ""
    prof_keywords = get_keywords(profile_text)
        
    # Get the seller's listing categories
    listing_categories = db.query(Listing.category_id).filter(Listing.seller_id == current_user.id).all()
    category_ids = {c[0] for c in listing_categories}
    
    # Find all open requests
    open_requests = db.query(BidRequest).filter(
        BidRequest.status == BidRequestStatus.OPEN,
        BidRequest.user_id != current_user.id
    ).all()
    
    # Get requests this seller has already bid on (and the bid is NOT rejected)
    from ..models.models import Bid
    existing_bids = db.query(Bid.bid_request_id).filter(
        Bid.seller_id == current_user.id,
        Bid.status != BidStatus.REJECTED
    ).all()
    bid_request_ids = {b[0] for b in existing_bids}
    
    matching_requests = []
    
    for req in open_requests:
        if req.id in bid_request_ids:
            continue
            
        # Match by listing category
        if req.category_id in category_ids:
            matching_requests.append(req)
            continue
            
        # Match by bio/name keywords
        category = db.query(Category).filter(Category.id == req.category_id).first() if req.category_id else None
        cat_name = category.name if category else ""
        request_text = f"{cat_name} {req.description or ''}"
        req_keywords = get_keywords(request_text)
        
        if req_keywords.intersection(prof_keywords):
            matching_requests.append(req)
            continue
                
    return matching_requests

@router.get("/requests/{request_id}", response_model=BidRequestResponse)
def get_bid_request_by_id(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    req = db.query(BidRequest).filter(BidRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req

# --- Bids ---

@router.post("/", response_model=BidResponse)
async def submit_bid(
    bid: BidCreate,
    fastapi_req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    if current_user.active_role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can submit bids")
    
    bid_request = db.query(BidRequest).filter(BidRequest.id == bid.bid_request_id).first()
    if not bid_request:
        raise HTTPException(status_code=404, detail="Bid request not found")

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
    
    # Send notification to the buyer
    from ..models.models import Notification, Profile
    
    buyer_id = bid_request.user_id
    seller_profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    seller_name = seller_profile.name if seller_profile and seller_profile.name else f"User {current_user.id}"
    
    new_notif = Notification(
        user_id=buyer_id,
        title="New Proposal Received",
        message=f"{seller_name} has submitted a proposal for your request.",
        type="new_bid",
        reference_id=bid_request.id
    )
    db.add(new_notif)
    db.commit()
    db.refresh(new_notif)
    
    try:
        sio = fastapi_req.app.state.sio
        await sio.emit("new_notification", {
            "id": new_notif.id,
            "title": new_notif.title,
            "text": new_notif.message,
            "time": "Just now",
            "unread": not new_notif.is_read,
            "type": new_notif.type,
            "reference_id": new_notif.reference_id
        }, room=f"user_{buyer_id}")
    except Exception as e:
        print(f"Failed to send notification: {e}")
        
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

@router.get("/my-bids", response_model=List[BidResponse])
def get_my_bids(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    if current_user.active_role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can view their bids")
        
    return db.query(Bid).filter(Bid.seller_id == current_user.id).all()

@router.patch("/{bid_id}/accept", response_model=BidResponse)
async def accept_bid(
    bid_id: int,
    fastapi_req: Request,
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
    
    # Note: We no longer auto-reject other bids because the buyer can accept multiple bids
    
    db.commit()
    
    # Create an Order
    from ..models.models import Order, OrderStatus, Category, Notification
    
    category = db.query(Category).filter(Category.id == bid_request.category_id).first()
    cat_name = category.name if category else "Custom Request"
    service_name = f"Custom Order: {cat_name}"
    
    new_order = Order(
        buyer_id=current_user.id,
        seller_id=bid.seller_id,
        service_name=service_name,
        amount=bid.price,
        status=OrderStatus.PENDING
    )
    db.add(new_order)
    
    # Notify the seller
    buyer_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or "A buyer"
    new_notif = Notification(
        user_id=bid.seller_id,
        title="Bid Accepted!",
        message=f"{buyer_name} has accepted your proposal for '{cat_name}'. A new order has been created.",
        type="bid_accepted",
        reference_id=bid.id
    )
    db.add(new_notif)
    
    db.commit()
    db.refresh(bid)
    db.refresh(new_order)
    db.refresh(new_notif)
    
    # Emit real-time notification
    try:
        sio = fastapi_req.app.state.sio
        await sio.emit("new_notification", {
            "id": new_notif.id,
            "title": new_notif.title,
            "text": new_notif.message,
            "time": "Just now",
            "unread": not new_notif.is_read,
            "type": new_notif.type,
            "reference_id": new_notif.reference_id
        }, room=f"user_{bid.seller_id}")
    except Exception as e:
        print(f"Failed to send notification: {e}")
    
    return bid
