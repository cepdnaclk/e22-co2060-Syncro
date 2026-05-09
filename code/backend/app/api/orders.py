from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import Order, OrderStatus, User, Profile
from ..schemas.schemas import OrderCreate, OrderResponse
from ..api.auth import get_current_user_from_token

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
            "has_review": order.has_review,
            "created_at": order.created_at,
        })
    return results


@router.get("/user/{user_id}", response_model=List[OrderResponse])
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter((Order.buyer_id == user_id) | (Order.seller_id == user_id)).all()
    return _enrich_orders(orders, db)


@router.post("/", response_model=OrderResponse)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_from_token)):
    new_order = Order(**order_data.dict(), buyer_id=current_user.id)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return _enrich_orders([new_order], db)[0]


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, status: OrderStatus, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    db.commit()
    db.refresh(order)
    return _enrich_orders([order], db)[0]
