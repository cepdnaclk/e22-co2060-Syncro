from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import Bid, BidRequest, User, BidRequestStatus, BidStatus, UserRole
from ..schemas.schemas import BidCreate, BidResponse, BidRequestCreate, BidRequestResponse
from .auth import get_current_user_from_token

router = APIRouter(prefix="/bids", tags=["bids"])


# ─── Helper: attach seller name/logo to bid dicts ───────────────────────────

def _enrich_bids(bids, db):
    """Return bids as dicts enriched with seller_name and seller_logo.
    Falls back: profile.name → user first+last name → None.
    """
    from ..models.models import Profile as ProfileModel
    results = []
    for bid in bids:
        profile = db.query(ProfileModel).filter(ProfileModel.user_id == bid.seller_id).first()
        seller_user = db.query(User).filter(User.id == bid.seller_id).first()

        # Business name first, then personal name, then None
        if profile and profile.name and profile.name.strip():
            seller_name = profile.name.strip()
        elif seller_user:
            full = f"{seller_user.first_name or ''} {seller_user.last_name or ''}".strip()
            seller_name = full if full else None
        else:
            seller_name = None

        results.append({
            "id": bid.id,
            "bid_request_id": bid.bid_request_id,
            "seller_id": bid.seller_id,
            "price": bid.price,
            "quantity": bid.quantity,
            "delivery_time": bid.delivery_time,
            "message": bid.message,
            "status": bid.status,
            "created_at": bid.created_at,
            "seller_name": seller_name,
            "seller_logo": profile.logo if profile else None,
        })
    return results


# ─── Bid Requests ────────────────────────────────────────────────────────────

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
    from ..models.models import Category, Profile, Listing, Notification
    import re

    def get_keywords(text):
        if not text:
            return set()
        words = re.findall(r'\b\w+\b', text.lower())
        stop_words = {"a", "an", "the", "and", "or", "but", "in", "on", "at", "to",
                      "for", "with", "by", "of", "is", "are", "was", "were", "i", "we",
                      "you", "they", "it", "this", "that", "want", "need", "looking",
                      "buy", "sell", "get", "make", "some", "any"}
        return {w for w in words if w not in stop_words and len(w) > 2}

    category = db.query(Category).filter(Category.id == request.category_id).first() if request.category_id else None
    cat_name = category.name if category else ""
    request_text = f"{cat_name} {request.description or ''}"
    req_keywords = get_keywords(request_text)

    # Notify ALL users who have a seller profile (regardless of current active_role)
    seller_user_ids = db.query(Profile.user_id).filter(
        Profile.description != None,
        Profile.description != "",
        Profile.user_id != current_user.id
    ).all()
    seller_ids_list = [row[0] for row in seller_user_ids]
    sellers = db.query(User).filter(User.id.in_(seller_ids_list)).all()

    matched_seller_ids = set()

    for seller in sellers:
        if request.category_id:
            has_listing = db.query(Listing).filter(
                Listing.seller_id == seller.id,
                Listing.category_id == request.category_id
            ).first()
            if has_listing:
                matched_seller_ids.add(seller.id)
                continue

        profile = db.query(Profile).filter(Profile.user_id == seller.id).first()
        profile_text = f"{profile.name or ''} {profile.description or ''}" if profile else ""
        prof_keywords = get_keywords(profile_text)

        if req_keywords.intersection(prof_keywords):
            matched_seller_ids.add(seller.id)

    buyer_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or "A buyer"

    for seller_id in matched_seller_ids:
        desc_snippet = request.description[:50] + ('...' if len(request.description) > 50 else '')
        new_notif = Notification(
            user_id=seller_id,
            title="New Matching Request",
            message=f"{buyer_name} has posted a new request that matches your profile: '{desc_snippet}'",
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
    if current_user.active_role != UserRole.SELLER:
        raise HTTPException(status_code=403, detail="Only sellers can view matching requests")

    from ..models.models import Category, Profile, Listing
    import re

    def get_keywords(text):
        if not text:
            return set()
        words = re.findall(r'\b\w+\b', text.lower())
        stop_words = {"a", "an", "the", "and", "or", "but", "in", "on", "at", "to",
                      "for", "with", "by", "of", "is", "are", "was", "were", "i", "we",
                      "you", "they", "it", "this", "that", "want", "need", "looking",
                      "buy", "sell", "get", "make", "some", "any"}
        return {w for w in words if w not in stop_words and len(w) > 2}

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    profile_text = f"{profile.name or ''} {profile.description or ''}" if profile else ""
    prof_keywords = get_keywords(profile_text)

    listing_categories = db.query(Listing.category_id).filter(Listing.seller_id == current_user.id).all()
    category_ids = {c[0] for c in listing_categories}

    open_requests = db.query(BidRequest).filter(
        BidRequest.status == BidRequestStatus.OPEN,
        BidRequest.user_id != current_user.id
    ).all()

    existing_bids = db.query(Bid.bid_request_id).filter(
        Bid.seller_id == current_user.id,
        Bid.status != BidStatus.REJECTED
    ).all()
    bid_request_ids = {b[0] for b in existing_bids}

    matching_requests = []
    for req in open_requests:
        if req.id in bid_request_ids:
            continue
        if req.category_id in category_ids:
            matching_requests.append(req)
            continue
        category = db.query(Category).filter(Category.id == req.category_id).first() if req.category_id else None
        cat_name = category.name if category else ""
        request_text = f"{cat_name} {req.description or ''}"
        req_keywords = get_keywords(request_text)
        if req_keywords.intersection(prof_keywords):
            matching_requests.append(req)

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


# ─── Bids ────────────────────────────────────────────────────────────────────

@router.post("/", response_model=BidResponse)
async def submit_bid(
    bid: BidCreate,
    fastapi_req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    if current_user.active_role != UserRole.SELLER:
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
    seller_display = (seller_profile.name if seller_profile and seller_profile.name else None) or \
                     f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or \
                     f"User {current_user.id}"

    new_notif = Notification(
        user_id=buyer_id,
        title="New Proposal Received",
        message=f"{seller_display} has submitted a proposal for your request.",
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

    # Return enriched single bid
    return _enrich_bids([new_bid], db)[0]


@router.get("/request/{request_id}", response_model=List[BidResponse])
def get_bids_for_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    bid_request = db.query(BidRequest).filter(BidRequest.id == request_id).first()
    if not bid_request:
        raise HTTPException(status_code=404, detail="Bid request not found")

    if bid_request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    bids = db.query(Bid).filter(Bid.bid_request_id == request_id).all()
    return _enrich_bids(bids, db)


@router.get("/my-bids", response_model=List[BidResponse])
def get_my_bids(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    if current_user.active_role != UserRole.SELLER:
        raise HTTPException(status_code=403, detail="Only sellers can view their bids")

    bids = db.query(Bid).filter(Bid.seller_id == current_user.id).all()
    return _enrich_bids(bids, db)


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

    bid.status = BidStatus.ACCEPTED
    bid_request.status = BidRequestStatus.ACCEPTED
    db.commit()

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

    return _enrich_bids([bid], db)[0]


@router.patch("/{bid_id}/reject", response_model=BidResponse)
async def reject_bid(
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
        raise HTTPException(status_code=403, detail="Only the request owner can reject bids")

    if bid.status == BidStatus.ACCEPTED:
        raise HTTPException(status_code=400, detail="Cannot reject an already accepted bid")

    bid.status = BidStatus.REJECTED
    db.commit()

    from ..models.models import Notification, Category

    category = db.query(Category).filter(Category.id == bid_request.category_id).first()
    cat_name = category.name if category else "your request"
    buyer_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or "A buyer"

    new_notif = Notification(
        user_id=bid.seller_id,
        title="Proposal Rejected",
        message=f"{buyer_name} has declined your proposal for '{cat_name}'. Keep submitting — more opportunities await!",
        type="bid_rejected",
        reference_id=bid.bid_request_id
    )
    db.add(new_notif)
    db.commit()
    db.refresh(bid)
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
        }, room=f"user_{bid.seller_id}")
    except Exception as e:
        print(f"Failed to send rejection notification: {e}")

    return _enrich_bids([bid], db)[0]
