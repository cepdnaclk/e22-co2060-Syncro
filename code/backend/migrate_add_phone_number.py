"""
One-time migration: add 'phone_number' column to the users table.
Run with: python migrate_add_phone_number.py
"""
import os
from dotenv import load_dotenv, find_dotenv
from sqlalchemy import create_engine, text

load_dotenv(find_dotenv(), override=True)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set in .env")

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    conn.execute(text(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR;"
    ))
    conn.commit()
    print("✅ Migration complete: 'phone_number' column added to users table.")
