import psycopg2
import os
from dotenv import load_dotenv

def run_migration():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not set.")
        return

    # 1. Update Enum (must be done with auto-commit or outside transaction)
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()

    try:
        cur.execute("ALTER TYPE bidrequeststatus ADD VALUE 'bidding';")
        print("Added 'bidding' to bidrequeststatus")
    except psycopg2.errors.DuplicateObject:
        print("'bidding' already exists in enum")

    try:
        cur.execute("ALTER TYPE bidrequeststatus ADD VALUE 'bid_limit_reached';")
        print("Added 'bid_limit_reached' to bidrequeststatus")
    except psycopg2.errors.DuplicateObject:
        print("'bid_limit_reached' already exists in enum")

    try:
        cur.execute("ALTER TYPE bidrequeststatus ADD VALUE 'completed';")
        print("Added 'completed' to bidrequeststatus")
    except psycopg2.errors.DuplicateObject:
        print("'completed' already exists in enum")

    cur.close()
    conn.close()

    # 2. Add columns and create table (can be inside transaction)
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    try:
        # Add columns to bid_requests
        cur.execute("""
            ALTER TABLE bid_requests
            ADD COLUMN IF NOT EXISTS bid_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS resend_round INTEGER DEFAULT 1;
        """)
        print("Added bid_count and resend_round to bid_requests")

        # Create notified_sellers table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS notified_sellers (
                id SERIAL PRIMARY KEY,
                bid_request_id INTEGER REFERENCES bid_requests(id) ON DELETE CASCADE,
                seller_id INTEGER REFERENCES users(id),
                score DOUBLE PRECISION DEFAULT 0.0,
                selection_type VARCHAR,
                round_number INTEGER DEFAULT 1,
                notified_at TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc', now())
            );
            CREATE INDEX IF NOT EXISTS ix_notified_sellers_id ON notified_sellers (id);
        """)
        print("Created notified_sellers table")

        conn.commit()
        print("Migration successful")
    except Exception as e:
        conn.rollback()
        print(f"Error during migration: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
