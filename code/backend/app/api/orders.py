from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import Order, OrderStatus, User, Profile, Notification
from ..schemas.schemas import OrderCreate, OrderResponse, ProposePriceRequest, RespondProposalRequest, SubmitSlipRequest
from ..api.auth import get_current_user_from_token, is_admin_email

router = APIRouter(prefix="/orders", tags=["Orders"])


def _enrich_orders(orders, db):
    """Attach buyer_name and seller_name to each order dict."""
    results = []
    for order in orders:
        # Buyer: first + last name from users table
        buyer = db.query(User).filter(User.id == order.buyer_id).first()
        if buyer:
            full = f"{buyer.first_name or ''} {buyer.last_name or ''}".strip()
            buyer_name = full if full else None
        else:
            buyer_name = None

        # Seller: business name from profiles, fallback to first+last name
        seller_profile = db.query(Profile).filter(Profile.user_id == order.seller_id).first()
        if seller_profile and seller_profile.name and seller_profile.name.strip():
            seller_name = seller_profile.name.strip()
        else:
            seller = db.query(User).filter(User.id == order.seller_id).first()
            if seller:
                full = f"{seller.first_name or ''} {seller.last_name or ''}".strip()
                seller_name = full if full else None
            else:
                seller_name = None

        results.append({
            "id": order.id,
            "service_name": order.service_name,
            "amount": order.amount,
            "buyer_id": order.buyer_id,
            "seller_id": order.seller_id,
            "buyer_name": buyer_name,
            "seller_name": seller_name,
            "listing_id": order.listing_id,
            "status": order.status,
            "payment_method": getattr(order, "payment_method", "card"),
            "payment_slip_url": getattr(order, "payment_slip_url", None),
            "payment_verified": getattr(order, "payment_verified", False),
            "payout_settled": getattr(order, "payout_settled", False),
            "payout_settled_at": getattr(order, "payout_settled_at", None),
            "rejection_reason": getattr(order, "rejection_reason", None),
            "proposed_price": getattr(order, "proposed_price", None),
            "proposal_status": getattr(order, "proposal_status", None),
            "proposal_note": getattr(order, "proposal_note", None),
            "has_review": order.has_review,
            "created_at": order.created_at,
        })
    return results


@router.get("/user/{user_id}", response_model=List[OrderResponse])
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .filter((Order.buyer_id == user_id) | (Order.seller_id == user_id))
        .order_by(Order.created_at.desc())
        .all()
    )
    return _enrich_orders(orders, db)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _enrich_orders([order], db)[0]


@router.post("/", response_model=OrderResponse)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_from_token)):
    new_order = Order(**order_data.dict(), buyer_id=current_user.id)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return _enrich_orders([new_order], db)[0]


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status: OrderStatus,
    fastapi_req: Request,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    db.commit()
    db.refresh(order)

    # Friendly status labels
    status_label = "In Progress" if status == OrderStatus.IN_PROGRESS else "Completed" if status == OrderStatus.COMPLETED else "Cancelled" if status == OrderStatus.CANCELLED else status.value.capitalize()

    # Create notification for buyer
    notif = Notification(
        user_id=order.buyer_id,
        title=f"Order #{order.id} is {status_label}",
        message=f"Your order for '{order.service_name}' has been marked as {status_label}.",
        type=f"order_{status.value.replace('-', '_')}",
        reference_id=order.id
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    # Emit socket notification so buyer dashboard reloads in real time
    try:
        sio = getattr(fastapi_req.app.state, 'sio', None)
        if sio:
            await sio.emit("new_notification", {
                "id": notif.id,
                "title": notif.title,
                "text": notif.message,
                "time": "Just now",
                "unread": True,
                "type": notif.type,
                "reference_id": notif.reference_id
            }, room=f"user_{order.buyer_id}")
    except Exception as e:
        print(f"Failed to emit status update socket notification: {e}")

    return _enrich_orders([order], db)[0]


@router.post("/{order_id}/propose-price", response_model=OrderResponse)
async def propose_order_price(
    order_id: int,
    data: ProposePriceRequest,
    fastapi_req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can propose a price change")
    if order.status in [OrderStatus.COMPLETED, OrderStatus.CANCELLED]:
        raise HTTPException(status_code=400, detail="Cannot negotiate price on a completed or cancelled order")

    order.proposed_price = data.proposed_price
    order.proposal_status = "pending"
    order.proposal_note = data.note or None

    notif = Notification(
        user_id=order.buyer_id,
        title="Price Proposal Received",
        message=f"Seller proposed a revised price of LKR {data.proposed_price:,.0f} for Order #{order.id}.",
        type="order_price_proposal",
        reference_id=order.id
    )
    db.add(notif)
    db.commit()
    db.refresh(order)
    db.refresh(notif)

    try:
        sio = getattr(fastapi_req.app.state, 'sio', None)
        if sio:
            await sio.emit("new_notification", {
                "id": notif.id,
                "title": notif.title,
                "text": notif.message,
                "time": "Just now",
                "unread": True,
                "type": notif.type,
                "reference_id": notif.reference_id
            }, room=f"user_{order.buyer_id}")
    except Exception as e:
        print(f"Failed to emit proposal socket notification: {e}")

    return _enrich_orders([order], db)[0]


@router.post("/{order_id}/respond-proposal", response_model=OrderResponse)
async def respond_price_proposal(
    order_id: int,
    data: RespondProposalRequest,
    fastapi_req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the buyer can respond to a price proposal")
    if order.proposal_status != "pending" or order.proposed_price is None:
        raise HTTPException(status_code=400, detail="No pending price proposal for this order")

    if data.action == "accept":
        new_amount = order.proposed_price
        order.amount = new_amount
        order.proposal_status = "accepted"
        order.proposed_price = None

        notif = Notification(
            user_id=order.seller_id,
            title="Price Proposal Accepted",
            message=f"Buyer accepted your price proposal of LKR {new_amount:,.0f} for Order #{order.id}.",
            type="order_price_accepted",
            reference_id=order.id
        )
    else:
        declined_amount = order.proposed_price
        order.proposal_status = "rejected"
        order.proposed_price = None

        notif = Notification(
            user_id=order.seller_id,
            title="Price Proposal Declined",
            message=f"Buyer declined your price proposal of LKR {declined_amount:,.0f} for Order #{order.id}.",
            type="order_price_declined",
            reference_id=order.id
        )

    db.add(notif)
    db.commit()
    db.refresh(order)
    db.refresh(notif)

    try:
        sio = getattr(fastapi_req.app.state, 'sio', None)
        if sio:
            await sio.emit("new_notification", {
                "id": notif.id,
                "title": notif.title,
                "text": notif.message,
                "time": "Just now",
                "unread": True,
                "type": notif.type,
                "reference_id": notif.reference_id
            }, room=f"user_{order.seller_id}")
    except Exception as e:
        print(f"Failed to emit proposal response socket notification: {e}")

    return _enrich_orders([order], db)[0]


@router.post("/{order_id}/cancel-proposal", response_model=OrderResponse)
def cancel_price_proposal(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can cancel the proposal")

    order.proposed_price = None
    order.proposal_status = None
    order.proposal_note = None
    db.commit()
    db.refresh(order)
    return _enrich_orders([order], db)[0]


@router.post("/{order_id}/submit-slip", response_model=OrderResponse)
async def submit_order_payment_slip(
    order_id: int,
    data: SubmitSlipRequest,
    fastapi_req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.buyer_id != current_user.id and not is_admin_email(current_user.email):
        raise HTTPException(status_code=403, detail="Only the buyer can submit a payment slip for this order")
    if order.status == OrderStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Cannot submit payment for a cancelled order")

    order.payment_slip_url = data.payment_slip_url
    order.payment_method = data.payment_method or "bank_transfer"
    order.payment_verified = False
    order.rejection_reason = None
    db.commit()
    db.refresh(order)

    # Friendly service label
    svc = order.service_name or f"Order #{order.id}"

    # Notify buyer confirming receipt of slip
    notif_buyer = Notification(
        user_id=order.buyer_id,
        title=f"Payment Slip Submitted for Order #{order.id}",
        message=f"Your payment slip for Order #{order.id} ({svc}) has been submitted and is awaiting admin verification.",
        type="payment_slip_submitted",
        reference_id=order.id
    )
    db.add(notif_buyer)

    # Notify seller that buyer paid / submitted slip
    notif_seller = Notification(
        user_id=order.seller_id,
        title=f"Payment Submitted for Order #{order.id}",
        message=f"Buyer submitted a payment slip for Order #{order.id} ({svc}). Awaiting admin verification.",
        type="payment_slip_pending",
        reference_id=order.id
    )
    db.add(notif_seller)
    db.commit()

    # Emit socket notifications
    try:
        sio = getattr(fastapi_req.app.state, 'sio', None)
        if sio:
            await sio.emit("new_notification", {
                "id": notif_buyer.id,
                "title": notif_buyer.title,
                "text": notif_buyer.message,
                "time": "Just now",
                "unread": True,
                "type": notif_buyer.type,
                "reference_id": notif_buyer.reference_id
            }, room=f"user_{order.buyer_id}")
            await sio.emit("new_notification", {
                "id": notif_seller.id,
                "title": notif_seller.title,
                "text": notif_seller.message,
                "time": "Just now",
                "unread": True,
                "type": notif_seller.type,
                "reference_id": notif_seller.reference_id
            }, room=f"user_{order.seller_id}")
    except Exception as e:
        print(f"Failed to emit slip submission socket notification: {e}")

    return _enrich_orders([order], db)[0]
