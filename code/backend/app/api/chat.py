from fastapi import APIRouter, Depends, HTTPException
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
    request: ChatRequest,
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
    history = [{"role": m.role, "content": m.content} for m in request.conversation]

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
        status=BidRequestStatus.OPEN
    )
    db.add(new_bid_request)
    db.commit()
    db.refresh(new_bid_request)

    return ChatResponse(
        status="complete",
        message=result["message"],
        bid_request_id=new_bid_request.id,
        order=order
    )
