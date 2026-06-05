"""
Verify the location column exists in the users table.
"""
import os
from dotenv import load_dotenv, find_dotenv
from sqlalchemy import create_engine, text

load_dotenv(find_dotenv(), override=True)
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    result = conn.execute(text(
        "SELECT column_name, data_type FROM information_schema.columns "
        "WHERE table_name = 'users' ORDER BY ordinal_position;"
    ))
    rows = result.fetchall()
    print("Columns in users table:")
    for row in rows:
        print(f"  {row[0]}: {row[1]}")
