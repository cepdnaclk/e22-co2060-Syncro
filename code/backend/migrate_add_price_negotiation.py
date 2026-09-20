"""
Migration: Add proposed_price, proposal_status, and proposal_note columns to orders table (PostgreSQL).
Run from the backend directory:
    python migrate_add_price_negotiation.py
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

    columns_to_add = [
        ("proposed_price", "FLOAT"),
        ("proposal_status", "VARCHAR"),
        ("proposal_note", "VARCHAR"),
    ]

    for col_name, col_type in columns_to_add:
        cursor.execute(f"""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'orders' AND column_name = '{col_name}'
        """)
        if not cursor.fetchone():
            cursor.execute(f"ALTER TABLE orders ADD COLUMN {col_name} {col_type};")
            print(f"✅ Added '{col_name}' column to orders table.")
        else:
            print(f"ℹ️ Column '{col_name}' already exists.")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    migrate()
