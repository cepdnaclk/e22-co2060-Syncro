import os
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import listings, auth, profiles, orders, reviews, bids, chat, notifications  # Import your API routers
from app.database import engine # Import the database engine and Base for table creation
from app.models import models  # Import the models so SQLAlchemy knows which tables to create

#models.Base.metadata.create_all(bind=engine)
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"CRITICAL DATABASE ERROR: {e}")
    raise e

app = FastAPI(title="Syncro Backend")

# Configure CORS — set ALLOWED_ORIGINS env var in production (comma-separated)
# e.g. "https://your-frontend.azurestaticapps.net,https://yourdomain.com"
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(listings.router)
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(orders.router)
app.include_router(reviews.router)
app.include_router(bids.router)
app.include_router(chat.router)
app.include_router(notifications.router)


# 1. Create the Socket.IO server
sio = socketio.AsyncServer(cors_allowed_origins='*', async_mode='asgi')

# 2. Create the combined ASGI application
# Note: We serve 'app' via uvicorn, so we mount the Socket.IO app into FastAPI
socket_app = socketio.ASGIApp(sio)
app.mount("/socket.io", socket_app)
app.state.sio = sio

# Standard HTTP Route
@app.get("/")
async def root():
    return {"message": "Syncro Backend is running"}

# Real-time Event: Client Connects
@sio.on("connect")
async def connect(sid, environ):
    print(f"✅ Client connected: {sid}")

# Real-time Event: Client Disconnects
@sio.on("disconnect")
async def disconnect(sid):
    print(f" Client disconnected: {sid}")

@sio.on("identify")
async def on_identify(sid, data):
    user_id = data.get("userId")
    if user_id:
        sio.enter_room(sid, f"user_{user_id}")
        print(f"User {user_id} joined room user_{user_id}")