from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import Order, OrderStatus, User
from ..schemas.schemas import OrderCreate, OrderResponse
from ..api.auth import get_current_user_from_token

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("/user/{user_id}", response_model=List[OrderResponse])
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    from ..models.models import Profile
    orders = db.query(Order).filter((Order.buyer_id == user_id) | (Order.seller_id == user_id)).all()

    results = []
    for order in orders:
        # Buyer name: first_name + last_name from User table
        buyer = db.query(User).filter(User.id == order.buyer_id).first()
        buyer_name = None
        if buyer:
            full = f"{buyer.first_name or ''} {buyer.last_name or ''}".strip()
            buyer_name = full if full else None

        # Seller name: business name from Profile table
        seller_profile = db.query(Profile).filter(Profile.user_id == order.seller_id).first()
        seller_name = seller_profile.name if seller_profile and seller_profile.name else None

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

@router.post("/", response_model=OrderResponse)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_from_token)):
    new_order = Order(**order_data.dict(), buyer_id=current_user.id)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, status: OrderStatus, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status
    db.commit()
    db.refresh(order)
    return order
