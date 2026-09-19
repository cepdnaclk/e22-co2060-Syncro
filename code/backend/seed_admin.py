import os
import sys

try:
    from dotenv import load_dotenv, find_dotenv
    load_dotenv(find_dotenv())
except ImportError:
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.strip() and not line.startswith('#') and '=' in line:
                    k, v = line.strip().split('=', 1)
                    os.environ.setdefault(k.strip().strip('"').strip("'"), v.strip().strip('"').strip("'"))

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.database import engine, SessionLocal, Base
from app.models.models import User, Profile
from app.core.security import get_password_hash

def seed():
    print("--- CONNECTING TO DATABASE TO SEED ADMIN AND MIGRATE COLUMNS ---")
    
    # 1. Run migrations for any new columns
    with engine.connect() as conn:
        print("Checking/Adding is_banned column to users table...")
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;"))
        
        print("Checking/Adding verification/payout columns to orders table...")
        conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT FALSE;"))
        conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payout_settled BOOLEAN DEFAULT FALSE;"))
        conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payout_settled_at TIMESTAMP;"))
        conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR;"))
        conn.commit()
        print("Schema columns verified successfully.")

    # 2. Seed Admin User
    db = SessionLocal()
    admin_email = "syncromarketplace@gmail.com"
    admin_password = "Admin@Syncro2026"

    try:
        user = db.query(User).filter(User.email == admin_email).first()
        hashed_pw = get_password_hash(admin_password)

        if user:
            print(f"User {admin_email} found. Updating password and ensuring verified/unbanned...")
            user.hashed_password = hashed_pw
            user.email_verified = True
            user.is_banned = False
            user.first_name = "Syncro"
            user.last_name = "Admin"
            db.commit()
            print(f"Admin user {admin_email} updated successfully.")
        else:
            print(f"Creating new admin user {admin_email}...")
            new_user = User(
                email=admin_email,
                hashed_password=hashed_pw,
                first_name="Syncro",
                last_name="Admin",
                location="Kandy",
                phone_number="0700000000",
                active_role="client",
                email_verified=True,
                is_banned=False
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            new_profile = Profile(
                user_id=new_user.id,
                name="Syncro Administrator",
                phone="0700000000",
                description="Platform Super Administrator"
            )
            db.add(new_profile)
            db.commit()
            print(f"Admin user {admin_email} created successfully with ID {new_user.id}.")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
