import psycopg2, os
from dotenv import load_dotenv

load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()
try:
    cur.execute("SELECT id, user_id, category_id, location, status FROM bid_requests ORDER BY created_at DESC LIMIT 1")
    req = cur.fetchone()
    print('Latest Request:', req)

    if req:
        req_id = req[0]
        cur.execute(f"SELECT * FROM notified_sellers WHERE bid_request_id = {req_id}")
        notified = cur.fetchall()
        print('Notified Sellers for latest request:', notified)

        cur.execute("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5")
        notifications = cur.fetchall()
        print('Recent Notifications:', notifications)
except Exception as e:
    print(e)
finally:
    conn.close()
