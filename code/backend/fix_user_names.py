import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import app.models.chat
from app.models.models import User, Profile

load_dotenv()
db_url = os.getenv("DATABASE_URL")
print(f"DATABASE_URL: {db_url}")

engine = create_engine(db_url)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    users = db.query(User).all()
    for u in users:
        print(f"User {u.id}: email={u.email}, first_name={u.first_name}, last_name={u.last_name}")
        if not u.first_name or u.first_name.lower() in ["user", "user 1", "user1"]:
            if u.email and not u.email.lower().startswith("user"):
                prefix = u.email.split("@")[0].replace(".", " ").replace("_", " ").title()
                u.first_name = prefix
            else:
                u.first_name = f"Customer #{u.id}"
            print(f"  -> Updated first_name to: {u.first_name}")
        
        # Update profile if needed
        p = db.query(Profile).filter(Profile.user_id == u.id).first()
        if p and (not p.name or p.name.lower() in ["user", "user 1", "user1"]):
            p.name = f"{u.first_name or ''} {u.last_name or ''}".strip()
            print(f"  -> Updated profile name to: {p.name}")

    db.commit()
    print("Successfully updated user names in database!")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
