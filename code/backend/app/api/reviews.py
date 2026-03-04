from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import Review, Order, OrderStatus, User
from ..schemas.schemas import ReviewCreate, ReviewResponse
from ..api.auth import get_current_user_from_token

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.get("/user/{user_id}", response_model=List[ReviewResponse])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.reviewee_id == user_id).all()
    return reviews


@router.post("/order/{order_id}", response_model=ReviewResponse)
def create_review(order_id: int, review_data: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_from_token)):
    reviewer_id = current_user.id
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.status != OrderStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Cannot review an incomplete order")
        
    if order.buyer_id != reviewer_id and order.seller_id != reviewer_id:
         raise HTTPException(status_code=403, detail="Not authorized to review this order")

    # Determine reviewee based on who is leaving the review
    reviewee_id = order.seller_id if order.buyer_id == reviewer_id else order.buyer_id
    
    existing_review = db.query(Review).filter(
        Review.order_id == order_id, 
        Review.reviewer_id == reviewer_id
    ).first()
    
    if existing_review:
         raise HTTPException(status_code=400, detail="Review already exists for this order")

    new_review = Review(
        **review_data.dict(),
        order_id=order_id,
        reviewer_id=reviewer_id,
        reviewee_id=reviewee_id
    )
    
    db.add(new_review)
    order.has_review = True # Update order status
    db.commit()
    db.refresh(new_review)
    
    return new_review
