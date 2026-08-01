"""
Migration: Add payment_method and payment_slip_url columns to orders table (PostgreSQL).
Run from the backend directory:
    python migrate_add_payment_slip.py
"""
import os
import sys

try:
    import psycopg2
except ImportError:
    print("psycopg2 not found — trying psycopg2-binary")
    os.system(f"{sys.executable} -m pip install psycopg2-binary -q")
    import psycopg2

database_url = os.getenv("DATABASE_URL", "postgresql://postgres:syncro123@localhost:5433/syncro_db")

def migrate():
    conn = psycopg2.connect(database_url)
    conn.autocommit = True
    cursor = conn.cursor()

    # Check payment_method
    cursor.execute("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'payment_method'
    """)
    if not cursor.fetchone():
        cursor.execute("ALTER TABLE orders ADD COLUMN payment_method VARCHAR DEFAULT 'card'")
        print("✅ Added 'payment_method' column to orders table.")
    else:
        print("ℹ️ Column 'payment_method' already exists.")

    # Check payment_slip_url
    cursor.execute("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'payment_slip_url'
    """)
    if not cursor.fetchone():
        cursor.execute("ALTER TABLE orders ADD COLUMN payment_slip_url VARCHAR")
        print("✅ Added 'payment_slip_url' column to orders table.")
    else:
        print("ℹ️ Column 'payment_slip_url' already exists.")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    migrate()
