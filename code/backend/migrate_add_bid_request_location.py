"""
Migration: Add `location` column to bid_requests table.

The location field stores the district/city the buyer specifies through the
Syncro AI assistant (or manual form). It is used by the Stage 1 hard filter
to match sellers in the correct Sri Lanka district.

Run:
    python migrate_add_bid_request_location.py
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set.")

conn = psycopg2.connect(DATABASE_URL)
conn.autocommit = True
cur = conn.cursor()

# Check if column already exists
cur.execute("""
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'bid_requests' AND column_name = 'location'
""")
exists = cur.fetchone()

if not exists:
    cur.execute("ALTER TABLE bid_requests ADD COLUMN location VARCHAR NULLABLE DEFAULT NULL")
    print("✅ Added 'location' column to bid_requests table.")
else:
    print("ℹ️  Column 'location' already exists — no changes made.")

cur.close()
conn.close()
