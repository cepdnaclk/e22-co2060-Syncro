import socketio
from fastapi import FastAPI
from app.api import listings, auth  # Import your API routers
from app.database import engine # Import the database engine and Base for table creation
from app.models import models  # Import the models so SQLAlchemy knows which tables to create

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Syncro Backend")

app.include_router(listings.router)
app.include_router(auth.router)




# 1. Create the Socket.IO server with CORS allowed for your React frontend
sio = socketio.AsyncServer(cors_allowed_origins='*', async_mode='asgi')

# 2. Create the FastAPI app
app = FastAPI()

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