"""
Migration: Add is_active column to profiles table (PostgreSQL).
Run once from the backend directory:
    python migrate_add_is_active.py
"""
import os
import sys

try:
    import psycopg2
except ImportError:
    print("psycopg2 not found — trying psycopg2-binary")
    os.system(f"{sys.executable} -m pip install psycopg2-binary -q")
    import psycopg2

# Load DATABASE_URL from .env if not already set
database_url = os.getenv("DATABASE_URL", "postgresql://postgres:syncro123@localhost:5433/syncro_db")

def migrate():
    conn = psycopg2.connect(database_url)
    conn.autocommit = True
    cursor = conn.cursor()

    # Check if column already exists
    cursor.execute("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'is_active'
    """)
    exists = cursor.fetchone()

    if not exists:
        cursor.execute(
            "ALTER TABLE profiles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE"
        )
        print("✅ Added 'is_active' column to profiles table (all existing sellers set to active).")
    else:
        print("ℹ️  Column 'is_active' already exists — no changes made.")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    migrate()
