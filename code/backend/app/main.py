import os
import socketio
import sys
import traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import listings, auth, profiles, orders, reviews, bids, chat, notifications, messages  # Import your API routers
from app.database import engine, SessionLocal # Import the database engine and Base for table creation
from app.models import models  # Import the models so SQLAlchemy knows which tables to create
from app.models import chat as chat_model  # Ensure Message table is registered with Base

try:
    # Get the URL
    db_url = os.getenv("DATABASE_URL")
    # Redact the password for security
    if db_url and "://" in db_url and "@" in db_url:
        parts = db_url.split("@")
        redacted_url = parts[0].split(":")[0] + "://****:****@" + parts[1]
        print(f"--- ATTEMPTING CONNECTION TO: {redacted_url} ---", file=sys.stderr, flush=True)
    else:
        print("--- DATABASE_URL NOT FOUND OR INVALID FORMAT ---", file=sys.stderr, flush=True)

    models.Base.metadata.create_all(bind=engine)
    print("--- DATABASE CONNECTION SUCCESSFUL ---", file=sys.stderr, flush=True)

except Exception as e:
    print("!!! CRITICAL DATABASE ERROR !!!", file=sys.stderr, flush=True)
    traceback.print_exc(file=sys.stderr)
    raise e

# ── Internal FastAPI application ──────────────────────────────────────────────
# Named fastapi_app internally; the final "app" exported below is the combined
# socketio.ASGIApp wrapper so "uvicorn app.main:app --reload" works unchanged.
fastapi_app = FastAPI(title="Syncro Backend")

# Configure CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fastapi_app.include_router(listings.router)
fastapi_app.include_router(auth.router)
fastapi_app.include_router(profiles.router)
fastapi_app.include_router(orders.router)
fastapi_app.include_router(reviews.router)
fastapi_app.include_router(bids.router)
fastapi_app.include_router(chat.router)
fastapi_app.include_router(notifications.router)
fastapi_app.include_router(messages.router)


@fastapi_app.get("/")
async def root():
    return {"message": "Syncro Backend is running"}


# ── Socket.IO server ──────────────────────────────────────────────────────────
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")

# Attach sio to the FastAPI app state so API handlers can access it via
# request.app.state.sio  (request.app resolves to fastapi_app at runtime)
fastapi_app.state.sio = sio

# ── sid → user_id mapping ────────────────────────────────────────────────────
# Populated when the client emits "identify" after connecting.
# Cleaned up on disconnect to prevent stale entries.
_sid_to_user: dict[str, int] = {}


@sio.on("connect")
async def connect(sid, environ):
    print(f"✅ Socket connected: {sid}")


@sio.on("disconnect")
async def disconnect(sid):
    _sid_to_user.pop(sid, None)
    print(f"❌ Socket disconnected: {sid}")


@sio.on("identify")
async def on_identify(sid, data):
    """Called by the client right after connecting to join their personal room."""
    user_id = data.get("userId")
    if user_id:
        await sio.enter_room(sid, f"user_{user_id}")
        _sid_to_user[sid] = int(user_id)
        print(f"🔔 User {user_id} joined room user_{user_id}")


@sio.on("send_message")
async def on_send_message(sid, data):
    """
    Real-time message delivery.

    Expected payload:
        { "receiver_id": int, "content": str, "order_id": int | null }

    Flow:
      1. Look up sender via sid → user mapping (set during "identify").
      2. Persist the message to PostgreSQL.
      3. Emit "new_message" to the receiver's personal room AND the sender's
         room so all open tabs stay in sync.
    """
    sender_id = _sid_to_user.get(sid)
    if not sender_id:
        # Client hasn't identified yet — ignore silently
        return

    receiver_id = data.get("receiver_id")
    content = (data.get("content") or "").strip()
    order_id = data.get("order_id")  # optional

    if not receiver_id or not content:
        return

    db = SessionLocal()
    try:
        from app.models.chat import Message

        msg = Message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            content=content,
            order_id=order_id if order_id else None,
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)

        payload = {
            "id": msg.id,
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "order_id": msg.order_id,
            "content": msg.content,
            "timestamp": msg.timestamp.isoformat(),
            "is_read": msg.is_read,
        }

        # Deliver to receiver instantly
        await sio.emit("new_message", payload, room=f"user_{receiver_id}")
        # Echo back to sender so all their open tabs update too
        await sio.emit("new_message", payload, room=f"user_{sender_id}")

        print(f"💬 Message {msg.id}: user_{sender_id} → user_{receiver_id}")

    except Exception as e:
        print(f"❌ send_message error: {e}")
    finally:
        db.close()


# ── Combined ASGI app (served by uvicorn) ────────────────────────────────────
# socketio.ASGIApp wraps FastAPI so that Socket.IO handshake requests (which
# arrive at /socket.io/...) are handled by sio, and all other HTTP requests
# fall through to fastapi_app.  This is the CORRECT integration pattern;
# the previous app.mount("/socket.io", ...) approach caused FastAPI to strip
# the /socket.io prefix before the socketio app could see it, silently
# breaking the WebSocket connection.
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)