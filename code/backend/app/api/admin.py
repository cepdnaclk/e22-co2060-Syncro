import os
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from ..database import get_db
from ..models.models import User, Profile, Order, OrderStatus, Listing, BidRequest, Notification
from .auth import get_current_admin_user, is_admin_email

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ── Schemas for Admin Requests ────────────────────────────────────────────────
class VerifyPaymentRequest(BaseModel):
    action: str  # "approve" or "reject"
    rejection_reason: Optional[str] = None


class SettlePayoutRequest(BaseModel):
    payout_reference: Optional[str] = None


# ── 1. Metrics / Platform Overview ───────────────────────────────────────────
@router.get("/metrics")
def get_admin_metrics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    total_users = db.query(User).count()
    total_buyers = db.query(User).filter(User.active_role == "client").count()
    total_sellers = db.query(User).filter(User.active_role == "seller").count()
    banned_users = db.query(User).filter(User.is_banned == True).count()

    total_orders = db.query(Order).count()
    pending_slips = db.query(Order).filter(
        Order.payment_method == "bank_transfer",
        Order.payment_verified == False,
        Order.status != OrderStatus.CANCELLED
    ).count()
    
    in_progress_orders = db.query(Order).filter(Order.status == OrderStatus.IN_PROGRESS).count()
    completed_orders = db.query(Order).filter(Order.status == OrderStatus.COMPLETED).count()
    settled_orders = db.query(Order).filter(Order.payout_settled == True).count()

    # Financial aggregations
    all_orders = db.query(Order).filter(Order.status != OrderStatus.CANCELLED).all()
    total_volume = sum(o.amount for o in all_orders) if all_orders else 0.0

    # Escrow currently held (verified payments where seller hasn't been paid out yet)
    escrow_orders = [o for o in all_orders if getattr(o, "payment_verified", False) and not getattr(o, "payout_settled", False)]
    escrow_holding = sum(o.amount for o in escrow_orders) if escrow_orders else 0.0

    # 5% platform commission from completed/settled orders
    revenue_orders = [o for o in all_orders if o.status == OrderStatus.COMPLETED or getattr(o, "payout_settled", False)]
    platform_revenue = sum(o.amount * 0.05 for o in revenue_orders) if revenue_orders else 0.0

    return {
        "users": {
            "total": total_users,
            "buyers": total_buyers,
            "sellers": total_sellers,
            "banned": banned_users
        },
        "orders": {
            "total": total_orders,
            "pending_slips": pending_slips,
            "in_progress": in_progress_orders,
            "completed": completed_orders,
            "settled": settled_orders
        },
        "financials": {
            "total_volume": round(total_volume, 2),
            "escrow_holding": round(escrow_holding, 2),
            "platform_revenue": round(platform_revenue, 2),
            "commission_rate_pct": 5
        }
    }


# ── 2. User Management (List, Search, Ban, Delete) ────────────────────────────
@router.get("/users")
def get_admin_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_banned: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    query = db.query(User)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.email.ilike(search_fmt),
                User.first_name.ilike(search_fmt),
                User.last_name.ilike(search_fmt),
                User.phone_number.ilike(search_fmt),
                User.location.ilike(search_fmt)
            )
        )

    if role:
        query = query.filter(User.active_role == role)

    if is_banned is not None:
        query = query.filter(User.is_banned == is_banned)

    total_count = query.count()
    users = query.order_by(User.id.desc()).offset(skip).limit(limit).all()

    user_list = []
    for u in users:
        profile = db.query(Profile).filter(Profile.user_id == u.id).first()
        listings_count = db.query(Listing).filter(Listing.owner_id == u.id).count()
        buyer_orders_count = db.query(Order).filter(Order.buyer_id == u.id).count()
        seller_orders_count = db.query(Order).filter(Order.seller_id == u.id).count()

        full_name = f"{u.first_name or ''} {u.last_name or ''}".strip()
        user_list.append({
            "id": u.id,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "full_name": full_name or (profile.name if profile else u.email.split('@')[0]),
            "phone_number": u.phone_number,
            "location": u.location,
            "active_role": u.active_role,
            "email_verified": u.email_verified,
            "is_banned": bool(getattr(u, "is_banned", False)),
            "is_admin": is_admin_email(u.email),
            "profile_name": profile.name if profile else None,
            "listings_count": listings_count,
            "orders_count": buyer_orders_count + seller_orders_count
        })

    return {
        "total": total_count,
        "users": user_list
    }


@router.post("/users/{user_id}/toggle-ban")
def toggle_user_ban(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if is_admin_email(target_user.email):
        raise HTTPException(status_code=400, detail="Cannot ban an administrator account.")

    new_banned_state = not getattr(target_user, "is_banned", False)
    target_user.is_banned = new_banned_state
    db.commit()

    return {
        "success": True,
        "user_id": target_user.id,
        "is_banned": new_banned_state,
        "message": f"User account has been {'banned' if new_banned_state else 'unbanned'} successfully."
    }


@router.delete("/users/{user_id}")
def delete_user_account(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if is_admin_email(target_user.email):
        raise HTTPException(status_code=400, detail="Cannot delete an administrator account.")

    # SQLAlchemy cascade will delete associated profiles, listings, notifications, messages
    db.delete(target_user)
    db.commit()

    return {
        "success": True,
        "message": f"User {target_user.email} and all associated data have been permanently deleted."
    }


# ── 3. Orders & Payment Slip Verification ─────────────────────────────────────
@router.get("/orders")
def get_admin_orders(
    status_filter: Optional[str] = None,
    payment_method: Optional[str] = None,
    unverified_only: bool = False,
    pending_payout_only: bool = False,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    query = db.query(Order)

    if status_filter:
        query = query.filter(Order.status == status_filter)

    if payment_method:
        query = query.filter(Order.payment_method == payment_method)

    if unverified_only:
        query = query.filter(Order.payment_verified == False, Order.status != OrderStatus.CANCELLED)

    if pending_payout_only:
        query = query.filter(Order.status == OrderStatus.COMPLETED, Order.payout_settled == False)

    orders = query.order_by(Order.created_at.desc()).all()

    enriched = []
    for o in orders:
        buyer = db.query(User).filter(User.id == o.buyer_id).first()
        seller = db.query(User).filter(User.id == o.seller_id).first()
        seller_profile = db.query(Profile).filter(Profile.user_id == o.seller_id).first()

        buyer_name = f"{buyer.first_name or ''} {buyer.last_name or ''}".strip() if buyer else "Unknown Buyer"
        seller_name = seller_profile.name if (seller_profile and seller_profile.name) else (
            f"{seller.first_name or ''} {seller.last_name or ''}".strip() if seller else "Unknown Seller"
        )

        amount = float(o.amount)
        platform_fee = round(amount * 0.05, 2)
        seller_payout = round(amount - platform_fee, 2)

        enriched.append({
            "id": o.id,
            "service_name": o.service_name,
            "amount": amount,
            "platform_fee": platform_fee,
            "seller_payout": seller_payout,
            "status": o.status,
            "payment_method": getattr(o, "payment_method", "bank_transfer"),
            "payment_slip_url": getattr(o, "payment_slip_url", None),
            "payment_verified": bool(getattr(o, "payment_verified", False)),
            "payout_settled": bool(getattr(o, "payout_settled", False)),
            "payout_settled_at": getattr(o, "payout_settled_at", None),
            "rejection_reason": getattr(o, "rejection_reason", None),
            "created_at": o.created_at,
            "buyer": {
                "id": buyer.id if buyer else None,
                "name": buyer_name,
                "email": buyer.email if buyer else None,
                "phone": buyer.phone_number if buyer else None,
            },
            "seller": {
                "id": seller.id if seller else None,
                "name": seller_name,
                "email": seller.email if seller else None,
                "phone": seller.phone_number if seller else None,
            }
        })

    return enriched


@router.patch("/orders/{order_id}/verify-payment")
def verify_order_payment(
    order_id: int,
    payload: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if payload.action == "approve":
        order.payment_verified = True
        order.status = OrderStatus.IN_PROGRESS
        order.rejection_reason = None
        db.commit()

        # Notify Seller that escrow is secured
        seller_notif = Notification(
            user_id=order.seller_id,
            title="Escrow Payment Verified! 💰",
            message=f"Payment for '{order.service_name}' has been verified and secured in Syncro Escrow. You may now fulfill the order!",
            type="order_payment_verified",
            reference_id=order.id
        )
        db.add(seller_notif)

        # Notify Buyer
        buyer_notif = Notification(
            user_id=order.buyer_id,
            title="Payment Approved! ✅",
            message=f"Your payment for '{order.service_name}' has been verified. The seller has been notified to start work.",
            type="order_payment_approved",
            reference_id=order.id
        )
        db.add(buyer_notif)
        db.commit()

        return {"success": True, "message": "Payment verified and order set to in-progress."}

    elif payload.action == "reject":
        order.payment_verified = False
        order.rejection_reason = payload.rejection_reason or "Payment slip could not be verified."
        order.status = OrderStatus.CANCELLED
        db.commit()

        # Notify Buyer
        buyer_notif = Notification(
            user_id=order.buyer_id,
            title="Payment Slip Rejected ❌",
            message=f"Your payment verification for '{order.service_name}' was declined: {order.rejection_reason}. Please contact support.",
            type="order_payment_rejected",
            reference_id=order.id
        )
        db.add(buyer_notif)
        db.commit()

        return {"success": True, "message": "Payment slip rejected and order cancelled."}

    else:
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'approve' or 'reject'.")


@router.patch("/orders/{order_id}/settle-payout")
def settle_seller_payout(
    order_id: int,
    payload: SettlePayoutRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != OrderStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Only completed orders can have their payouts settled.")

    order.payout_settled = True
    order.payout_settled_at = datetime.utcnow()
    db.commit()

    # Notify Seller
    net_payout = round(order.amount * 0.95, 2)
    seller_notif = Notification(
        user_id=order.seller_id,
        title="Payout Sent! 💳",
        message=f"Syncro has released your payout of Rs. {net_payout:,.2f} for '{order.service_name}'. Please check your bank account.",
        type="order_payout_settled",
        reference_id=order.id
    )
    db.add(seller_notif)
    db.commit()

    return {
        "success": True, 
        "message": f"Payout of Rs. {net_payout:,.2f} marked as settled.",
        "settled_at": order.payout_settled_at
    }
