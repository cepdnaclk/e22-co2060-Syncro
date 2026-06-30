from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from ..database import get_db
from ..models.models import BidRequest, BidRequestStatus, Category, User
from ..api.auth import get_current_user_from_token
from ..ai_service import chat_with_ai

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])


# ── Request/Response Schemas ──────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str       # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    conversation: List[ChatMessage]

class ChatResponse(BaseModel):
    status: str     # "collecting", "complete", or "error"
    message: str
    bid_request_id: Optional[int] = None
    order: Optional[dict] = None


# ── Helper: find or create a Category by name ─────────────────────────────────

def get_or_create_category(db: Session, category_name: str) -> Category:
    """
    Looks up a category by name (case-insensitive).
    If it doesn't exist yet, creates it automatically.
    """
    category = db.query(Category).filter(
        Category.name.ilike(category_name.strip())
    ).first()

    if not category:
        category = Category(name=category_name.strip().title())
        db.add(category)
        db.commit()
        db.refresh(category)

    return category


# ── Main Chatbot Endpoint ─────────────────────────────────────────────────────

@router.post("/rfp", response_model=ChatResponse)
async def rfp_chat(
    chat_request: ChatRequest,
    fastapi_req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    The main chatbot endpoint.

    The frontend sends the FULL conversation history every time the user
    sends a message. The AI figures out what to ask next.

    When the AI has collected all required info it returns status="complete"
    and this endpoint:
      1. Saves a BidRequest to the database
      2. Returns the bid_request_id so the frontend can redirect / show bids
    """

    # Convert Pydantic models to plain dicts for ai_service
    history = [{"role": m.role, "content": m.content} for m in chat_request.conversation]

    # Call the AI
    result = await chat_with_ai(history)

    # ── Still collecting information ──────────────────────────────────────────
    if result["status"] == "collecting":
        return ChatResponse(
            status="collecting",
            message=result["message"]
        )

    # ── AI returned an error ──────────────────────────────────────────────────
    if result["status"] == "error":
        return ChatResponse(
            status="error",
            message=result["message"]
        )

    # ── All info collected — save BidRequest to DB ────────────────────────────
    order = result["order"]

    # Find/create the category
    category = get_or_create_category(db, order.get("category", "General"))

    # Build a detailed description string from all the collected fields
    full_description = (
        f"{order.get('description', '')}\n\n"
        f"Quantity: {order.get('quantity', 'N/A')}\n"
        f"Budget: LKR {order.get('budget', 'N/A')}\n"
        f"Date needed: {order.get('event_date', 'N/A')}\n"
        f"Location: {order.get('location', 'N/A')}"
    )

    # Create the BidRequest (this is your existing model — no schema changes needed)
    new_bid_request = BidRequest(
        user_id=current_user.id,
        category_id=category.id,
        description=full_description,
        # Store the AI-collected location separately for clean Filter 3 matching
        location=order.get("location") or None,
        status=BidRequestStatus.OPEN
    )
    db.add(new_bid_request)
    db.commit()
    db.refresh(new_bid_request)

    # ── Stage 1 Hard Filters: notify only relevant, active, nearby sellers ────
    from ..services.seller_filter import apply_hard_filters
    from ..models.models import Notification

    matched_seller_ids = apply_hard_filters(current_user, new_bid_request, db)

    try:
        sio = fastapi_req.app.state.sio
        buyer_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or "A buyer"

        for seller_id in matched_seller_ids:
            new_notif = Notification(
                user_id=seller_id,
                title=f"New Lead: {category.name}",
                message=f"{buyer_name} is looking for {category.name} in {new_bid_request.location or 'your area'}. Check it out!",
                type="new_rfp",
                reference_id=new_bid_request.id
            )
            db.add(new_notif)
            db.commit()
            db.refresh(new_notif)

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
        print(f"Failed to send notification: {e}")

    return ChatResponse(
        status="complete",
        message=result["message"],
        bid_request_id=new_bid_request.id,
        order=order
    )
