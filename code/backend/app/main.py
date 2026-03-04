import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import listings, auth, profiles, orders, reviews  # Import your API routers
from .database import engine # Import the database engine and Base for table creation
from .models import models  # Import the models so SQLAlchemy knows which tables to create

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Syncro Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(listings.router)
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(orders.router)
app.include_router(reviews.router)


# 1. Create the Socket.IO server with CORS allowed for your React frontend
sio = socketio.AsyncServer(cors_allowed_origins='*', async_mode='asgi')

# 3. Wrap with ASGI and mount to the FastAPI app
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
app.mount("/socket.io", socket_app) # Handles the /socket.io/ path

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