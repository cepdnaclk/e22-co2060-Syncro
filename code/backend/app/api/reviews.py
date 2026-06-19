from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.models import Review, Order, OrderStatus, User
from ..schemas.schemas import ReviewCreate
from ..api.auth import get_current_user_from_token
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/reviews", tags=["Reviews"])


# ── Shared response schema ──────────────────────────────────────────────────
class ReviewWithName(BaseModel):
    id: int
    rating: float
    comment: Optional[str] = None
    order_id: Optional[int] = None
    reviewer_id: int
    reviewee_id: int
    reviewer_name: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


def _enrich_review(review: Review, db: Session) -> dict:
    """Attach reviewer_name to a review dict."""
    reviewer = db.query(User).filter(User.id == review.reviewer_id).first()
    reviewer_name = None
    if reviewer:
        full = f"{reviewer.first_name or ''} {reviewer.last_name or ''}".strip()
        reviewer_name = full if full else f"User {reviewer.id}"
    return {
        "id": review.id,
        "rating": review.rating,
        "comment": review.comment,
        "order_id": review.order_id,
        "reviewer_id": review.reviewer_id,
        "reviewee_id": review.reviewee_id,
        "reviewer_name": reviewer_name,
        "timestamp": review.timestamp,
    }


# ── GET all reviews for a seller ────────────────────────────────────────────
@router.get("/user/{user_id}", response_model=List[ReviewWithName])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.reviewee_id == user_id).order_by(Review.timestamp.desc()).all()
    return [_enrich_review(r, db) for r in reviews]


# ── POST review from seller profile page (no order required) ─────────────────
@router.post("/seller/{seller_id}", response_model=ReviewWithName)
def create_seller_review(
    seller_id: int,
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    reviewer_id = current_user.id

    # Can't review yourself
    if reviewer_id == seller_id:
        raise HTTPException(status_code=400, detail="You cannot review yourself")

    # Check seller exists
    seller = db.query(User).filter(User.id == seller_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    new_review = Review(
        rating=review_data.rating,
        comment=review_data.comment,
        order_id=None,
        reviewer_id=reviewer_id,
        reviewee_id=seller_id,
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return _enrich_review(new_review, db)


# ── POST review tied to a specific completed order ───────────────────────────
@router.post("/order/{order_id}", response_model=ReviewWithName)
def create_order_review(
    order_id: int,
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    reviewer_id = current_user.id
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != OrderStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Cannot review an incomplete order")

    if order.buyer_id != reviewer_id:
        raise HTTPException(status_code=403, detail="Only the buyer can leave a review for this order")

    existing_review = db.query(Review).filter(
        Review.order_id == order_id,
        Review.reviewer_id == reviewer_id,
    ).first()

    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this order")

    new_review = Review(
        rating=review_data.rating,
        comment=review_data.comment,
        order_id=order_id,
        reviewer_id=reviewer_id,
        reviewee_id=order.seller_id,
    )

    db.add(new_review)
    order.has_review = True
    db.commit()
    db.refresh(new_review)

    return _enrich_review(new_review, db)
