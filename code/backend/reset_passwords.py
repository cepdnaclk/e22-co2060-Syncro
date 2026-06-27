import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Import chat models so Message is registered for SQLAlchemy relationships
import app.models.chat
from app.core.security import get_password_hash
from app.models.models import User

load_dotenv()
db_url = os.getenv("DATABASE_URL")
print(f"DATABASE_URL: {db_url}")

engine = create_engine(db_url)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    users = db.query(User).all()
    hashed = get_password_hash("password123")
    print(f"Hashed 'password123': {hashed}")
    for u in users:
        print(f"Updating user {u.email}")
        u.hashed_password = hashed
    db.commit()
    print("Done resetting all passwords to password123")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
