"""
Migration: Add `email_verified` column to users table and create `email_verification_otps` table.
Run from the backend directory:
    python migrate_add_email_verification.py
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

    # 1. Add email_verified to users
    cursor.execute("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'email_verified'
    """)
    if not cursor.fetchone():
        # Set default to False for new, but then update existing to True so we don't lock out current users
        cursor.execute("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE")
        cursor.execute("UPDATE users SET email_verified = TRUE")
        print("✅ Added 'email_verified' column to users table (existing users set to TRUE).")
    else:
        print("ℹ️ Column 'email_verified' already exists.")

    # 2. Create email_verification_otps table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS email_verification_otps (
            id SERIAL PRIMARY KEY,
            email VARCHAR NOT NULL,
            otp VARCHAR(6),
            otp_hash VARCHAR(128),
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc', now()),
            expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
            attempt_count INTEGER DEFAULT 0,
            used BOOLEAN DEFAULT FALSE,
            last_sent_at TIMESTAMP WITHOUT TIME ZONE
        );
        CREATE INDEX IF NOT EXISTS ix_email_verification_otps_email ON email_verification_otps (email);
        CREATE INDEX IF NOT EXISTS ix_email_verification_otps_id ON email_verification_otps (id);
    """)

    for column_name, column_sql in {
        'otp_hash': 'ALTER TABLE email_verification_otps ADD COLUMN IF NOT EXISTS otp_hash VARCHAR(128)',
        'last_sent_at': 'ALTER TABLE email_verification_otps ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMP WITHOUT TIME ZONE',
    }.items():
        cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = 'email_verification_otps' AND column_name = '{column_name}'")
        if not cursor.fetchone():
            cursor.execute(column_sql)

    cursor.execute("SELECT is_nullable FROM information_schema.columns WHERE table_name = 'email_verification_otps' AND column_name = 'otp'")
    otp_nullable = cursor.fetchone()
    if otp_nullable and otp_nullable[0] == 'NO':
        cursor.execute("ALTER TABLE email_verification_otps ALTER COLUMN otp DROP NOT NULL")

    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'email_verification_otps' AND column_name = 'otp_hash'")
    if cursor.fetchone():
        cursor.execute("UPDATE email_verification_otps SET otp_hash = encode(digest(otp, 'sha256'), 'hex') WHERE otp_hash IS NULL AND otp IS NOT NULL")

    print("✅ Ensured 'email_verification_otps' table supports secure OTP verification.")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    migrate()
