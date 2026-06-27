# app/api/messages.py
# REST endpoints for the buyer-seller messaging system.
# Socket.IO real-time delivery is triggered HERE (server-side) so the client
# never has to trust its own socket connection for delivery.

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, desc
from typing import List

from ..database import get_db
from ..models.chat import Message
from ..models.models import User
from ..schemas.schemas import MessageResponse, ConversationSummary, MessageCreate
from ..api.auth import get_current_user_from_token

router = APIRouter(prefix="/messages", tags=["Messages"])


def _user_display_name(user: User) -> str:
    """Return a human-readable name for a user. If they have a seller profile, return their business name."""
    if user.profile and user.profile.name:
        return user.profile.name
    name = f"{user.first_name or ''} {user.last_name or ''}".strip()
    return name if name else user.email


def _initials(name: str) -> str:
    """Return up to two uppercase initials from a display name."""
    parts = name.split()
    return "".join(p[0].upper() for p in parts[:2]) if parts else "?"



# ─────────────────────────────────────────────────────────────────────────────
# POST /messages/  — Send a message (REST, reliable)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/", response_model=MessageResponse)
async def send_message(
    payload: MessageCreate,
    request: Request,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    """
    Save a message to the database and push it via Socket.IO to both the
    receiver and sender rooms.  Using REST for the send path makes delivery
    100 % reliable regardless of the client's socket state.
    """
    content = (payload.content or "").strip()
    if not content:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    msg = Message(
        sender_id=current_user.id,
        receiver_id=payload.receiver_id,
        content=content,
        order_id=payload.order_id,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    # Build the payload once
    event_data = {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "order_id": msg.order_id,
        "content": msg.content,
        "timestamp": msg.timestamp.isoformat(),
        "is_read": msg.is_read,
    }

    # Push real-time events server-side (best-effort — message is already saved)
    try:
        sio = request.app.state.sio
        await sio.emit("new_message", event_data, room=f"user_{msg.receiver_id}")
        await sio.emit("new_message", event_data, room=f"user_{msg.sender_id}")
        print(f"💬 REST msg {msg.id}: user_{msg.sender_id} → user_{msg.receiver_id}")
    except Exception as e:
        print(f"⚠️  Socket push failed (message still saved): {e}")

    sender = db.query(User).filter(User.id == current_user.id).first()
    sender_name = _user_display_name(sender) if sender else ""

    return MessageResponse(
        id=msg.id,
        sender_id=msg.sender_id,
        receiver_id=msg.receiver_id,
        order_id=msg.order_id,
        content=msg.content,
        timestamp=msg.timestamp,
        is_read=msg.is_read,
        sender_name=sender_name,
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /messages/conversations
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/conversations", response_model=List[ConversationSummary])
def get_conversations(
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    """
    Return one entry per unique conversation partner, ordered by most-recent
    message first.  Each entry includes the partner name, last message preview,
    and unread count.
    """
    uid = current_user.id

    # Collect all unique partner IDs
    sent_partners = (
        db.query(Message.receiver_id.label("partner_id"))
        .filter(Message.sender_id == uid)
    )
    received_partners = (
        db.query(Message.sender_id.label("partner_id"))
        .filter(Message.receiver_id == uid)
    )

    partner_ids: set[int] = set()
    for row in sent_partners.all():
        partner_ids.add(row.partner_id)
    for row in received_partners.all():
        partner_ids.add(row.partner_id)

    results: List[ConversationSummary] = []

    for partner_id in partner_ids:
        # Most-recent message in this conversation
        last_msg = (
            db.query(Message)
            .filter(
                or_(
                    and_(Message.sender_id == uid, Message.receiver_id == partner_id),
                    and_(Message.sender_id == partner_id, Message.receiver_id == uid),
                )
            )
            .order_by(desc(Message.timestamp))
            .first()
        )
        if not last_msg:
            continue

        # Unread messages sent TO the current user FROM this partner
        unread = (
            db.query(func.count(Message.id))
            .filter(
                Message.sender_id == partner_id,
                Message.receiver_id == uid,
                Message.is_read == False,  # noqa: E712
            )
            .scalar()
            or 0
        )

        partner = db.query(User).filter(User.id == partner_id).first()
        if not partner:
            continue

        name = _user_display_name(partner)
        results.append(
            ConversationSummary(
                other_user_id=partner_id,
                other_user_name=name,
                other_user_initials=_initials(name),
                last_message=last_msg.content,
                last_message_time=last_msg.timestamp,
                unread_count=unread,
            )
        )

    # Sort newest-first
    results.sort(key=lambda c: c.last_message_time, reverse=True)
    return results


# ─────────────────────────────────────────────────────────────────────────────
# GET /messages/{other_user_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{other_user_id}", response_model=List[MessageResponse])
def get_conversation_history(
    other_user_id: int,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    """Return all messages between the current user and another user, oldest first."""
    uid = current_user.id

    messages = (
        db.query(Message)
        .filter(
            or_(
                and_(Message.sender_id == uid, Message.receiver_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.receiver_id == uid),
            )
        )
        .order_by(Message.timestamp.asc())
        .all()
    )

    result: List[MessageResponse] = []
    # Cache sender objects to avoid N+1 queries
    user_cache: dict[int, User] = {}

    def get_user(user_id: int) -> User | None:
        if user_id not in user_cache:
            u = db.query(User).filter(User.id == user_id).first()
            if u:
                user_cache[user_id] = u
        return user_cache.get(user_id)

    for msg in messages:
        sender = get_user(msg.sender_id)
        sender_name = _user_display_name(sender) if sender else ""
        result.append(
            MessageResponse(
                id=msg.id,
                sender_id=msg.sender_id,
                receiver_id=msg.receiver_id,
                order_id=msg.order_id,
                content=msg.content,
                timestamp=msg.timestamp,
                is_read=msg.is_read,
                sender_name=sender_name,
            )
        )

    return result


# ─────────────────────────────────────────────────────────────────────────────
# PUT /messages/{other_user_id}/read
# ─────────────────────────────────────────────────────────────────────────────

@router.put("/{other_user_id}/read")
async def mark_conversation_read(
    other_user_id: int,
    request: Request,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    """Mark all unread messages from another user as read, then notify the sender."""
    updated = (
        db.query(Message)
        .filter(
            Message.sender_id == other_user_id,
            Message.receiver_id == current_user.id,
            Message.is_read == False,  # noqa: E712
        )
        .update({"is_read": True}, synchronize_session=False)
    )
    db.commit()

    # Notify the original sender so their UI can immediately show blue double-ticks
    if updated > 0:
        try:
            sio = request.app.state.sio
            await sio.emit(
                "messages_read",
                {"reader_id": current_user.id},
                room=f"user_{other_user_id}",
            )
            print(f"✅ messages_read: user_{current_user.id} read msgs from user_{other_user_id}")
        except Exception as e:
            print(f"⚠️  messages_read socket push failed: {e}")

    return {"updated": updated}
