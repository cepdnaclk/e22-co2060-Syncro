import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
print(f"DATABASE_URL: {db_url}")

engine = create_engine(db_url)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    res = db.execute(text("SELECT id, email, active_role, first_name, last_name FROM users")).fetchall()
    print("--- USERS ---")
    for row in res:
        print(row)
        
    res_listings = db.execute(text("SELECT id, title, price, seller_id FROM listings")).fetchall()
    print("--- LISTINGS ---")
    for row in res_listings:
        print(row)

    res_messages = db.execute(text("SELECT id, sender_id, receiver_id, content, timestamp FROM messages")).fetchall()
    print("--- MESSAGES ---")
    for row in res_messages:
        print(row)
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
