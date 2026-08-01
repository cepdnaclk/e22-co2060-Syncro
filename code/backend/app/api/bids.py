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


def _enrich_bid_request(req: BidRequest, db: Session) -> dict:
    from ..models.models import Profile as ProfileModel
    user = db.query(User).filter(User.id == req.user_id).first()
    profile = db.query(ProfileModel).filter(ProfileModel.user_id == req.user_id).first() if user else None

    user_name = None
    if user:
        full = f"{user.first_name or ''} {user.last_name or ''}".strip()
        if full and not full.lower().startswith("user "):
            user_name = full
        elif user.email:
            email_prefix = user.email.split("@")[0]
            clean_name = email_prefix.replace(".", " ").replace("_", " ").title()
            if not clean_name.lower().startswith("user"):
                user_name = clean_name
            else:
                user_name = f"User #{user.id}"

    if not user_name and profile and profile.name and profile.name.strip():
        if not profile.name.lower().startswith("user "):
            user_name = profile.name.strip()

    if not user_name:
        user_name = f"User #{req.user_id}"

    return {
        "id": req.id,
        "user_id": req.user_id,
        "category_id": req.category_id,
        "description": req.description,
        "location": req.location,
        "status": req.status,
        "bid_count": req.bid_count,
        "resend_round": req.resend_round,
        "created_at": req.created_at,
        "user_name": user_name,
    }


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
        location=request.location,
        status=BidRequestStatus.OPEN
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # ── Full Pipeline: Filters + Ranking + Selection ──
    from ..services.ranking import run_pipeline
    from ..models.models import Category, Notification, NotifiedSeller

    selected_sellers = run_pipeline(current_user, new_request, db)

    category = db.query(Category).filter(Category.id == request.category_id).first() if request.category_id else None
    buyer_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or "A buyer"

    for seller_id, score, selection_type in selected_sellers:
        # 1. Track in NotifiedSeller
        ns = NotifiedSeller(
            bid_request_id=new_request.id,
            seller_id=seller_id,
            score=score,
            selection_type=selection_type,
            round_number=1
        )
        db.add(ns)

        # 2. Create Notification
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

        # 3. Emit WebSocket
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

    return _enrich_bid_request(new_request, db)


@router.get("/requests", response_model=List[BidRequestResponse])
def get_my_bid_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    reqs = db.query(BidRequest).filter(BidRequest.user_id == current_user.id).all()
    return [_enrich_bid_request(req, db) for req in reqs]


@router.get("/requests/matches", response_model=List[BidRequestResponse])
def get_matching_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    if current_user.active_role != UserRole.SELLER:
        raise HTTPException(status_code=403, detail="Only sellers can view matching requests")

    from ..models.models import NotifiedSeller

    # Get requests where this seller was notified in the current active round
    # and the request is still OPEN or BIDDING
    matching_requests = (
        db.query(BidRequest)
        .join(NotifiedSeller, BidRequest.id == NotifiedSeller.bid_request_id)
        .filter(
            NotifiedSeller.seller_id == current_user.id,
            NotifiedSeller.round_number == BidRequest.resend_round,
            BidRequest.status.in_([BidRequestStatus.OPEN, BidRequestStatus.BIDDING])
        )
        .all()
    )

    # Filter out requests they have already bid on
    existing_bids = db.query(Bid.bid_request_id).filter(
        Bid.seller_id == current_user.id,
        Bid.status != BidStatus.REJECTED
    ).all()
    bid_request_ids = {b[0] for b in existing_bids}

    available_jobs = [req for req in matching_requests if req.id not in bid_request_ids]

    return [_enrich_bid_request(req, db) for req in available_jobs]


@router.get("/requests/{request_id}", response_model=BidRequestResponse)
def get_bid_request_by_id(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    req = db.query(BidRequest).filter(BidRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return _enrich_bid_request(req, db)


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

    # State Machine: Reject if already full or closed
    if bid_request.status in (BidRequestStatus.ACCEPTED, BidRequestStatus.COMPLETED, BidRequestStatus.BID_LIMIT_REACHED):
        raise HTTPException(status_code=429, detail="This request is no longer accepting new bids in this round")

    # State Machine: Update state and count
    if bid_request.bid_count == 0 and bid_request.status == BidRequestStatus.OPEN:
        bid_request.status = BidRequestStatus.BIDDING

    bid_request.bid_count += 1
    if bid_request.bid_count >= 15:
        bid_request.status = BidRequestStatus.BID_LIMIT_REACHED

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


@router.post("/requests/{request_id}/resend", response_model=dict)
async def resend_bid_request(
    request_id: int,
    fastapi_req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Resend a request to a new batch of 15 sellers if the buyer wants more options."""
    bid_request = db.query(BidRequest).filter(BidRequest.id == request_id).first()
    if not bid_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if bid_request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can resend this request")

    if bid_request.status != BidRequestStatus.BID_LIMIT_REACHED:
        raise HTTPException(status_code=400, detail="Can only resend when the current bid limit is reached")

    from ..models.models import NotifiedSeller, Notification, Category
    from ..services.ranking import run_pipeline

    # Find previously notified sellers to exclude
    past_notified = db.query(NotifiedSeller.seller_id).filter(NotifiedSeller.bid_request_id == request_id).all()
    exclude_ids = {row[0] for row in past_notified}

    # Get new sellers
    selected_sellers = run_pipeline(current_user, bid_request, db, exclude_seller_ids=exclude_ids)
    
    if not selected_sellers:
        raise HTTPException(status_code=404, detail="No more matching sellers found in your area")

    # Reset state
    bid_request.bid_count = 0
    bid_request.resend_round += 1
    bid_request.status = BidRequestStatus.OPEN
    
    category = db.query(Category).filter(Category.id == bid_request.category_id).first() if bid_request.category_id else None
    buyer_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or "A buyer"

    # Notify new batch
    for seller_id, score, selection_type in selected_sellers:
        ns = NotifiedSeller(
            bid_request_id=bid_request.id,
            seller_id=seller_id,
            score=score,
            selection_type=selection_type,
            round_number=bid_request.resend_round
        )
        db.add(ns)

        desc_snippet = bid_request.description[:50] + ('...' if len(bid_request.description) > 50 else '')
        new_notif = Notification(
            user_id=seller_id,
            title="New Matching Request",
            message=f"{buyer_name} has posted a new request that matches your profile: '{desc_snippet}'",
            type="new_request",
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
            }, room=f"user_{seller_id}")
        except Exception:
            pass

    db.commit()

    return {
        "message": f"Successfully notified {len(selected_sellers)} more sellers.",
        "notified_count": len(selected_sellers),
        "round": bid_request.resend_round
    }


@router.patch("/requests/{request_id}/complete", response_model=BidRequestResponse)
def complete_bid_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    bid_request = db.query(BidRequest).filter(BidRequest.id == request_id).first()
    if not bid_request:
        raise HTTPException(status_code=404, detail="Request not found")

    if bid_request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can complete this request")

    if bid_request.status != BidRequestStatus.ACCEPTED:
        raise HTTPException(status_code=400, detail="Only accepted requests can be completed")

    bid_request.status = BidRequestStatus.COMPLETED
    db.commit()
    db.refresh(bid_request)
    return bid_request


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
